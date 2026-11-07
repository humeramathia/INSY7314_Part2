/**
 * Logging demonstration script.
 *
 * Sends a realistic sequence of requests to the running API so that
 * logs/app.log and logs/security.log fill with the key system events:
 * login attempts, gig creation, booking, transaction, access control
 * failures, blocked injection, and rate limiting.
 *
 * Usage (API must already be running with `npm run dev`):
 *   npm run demo:logs
 *
 * The auth rate limiter allows 5 register/login requests per 15 minutes,
 * and this script uses all of them. Wait 15 minutes before running it again.
 */
const https = require("https");

require("dotenv").config();

const BASE = `https://localhost:${process.env.PORT || 3000}`;

// The API uses a self-signed certificate in development only.
const agent = new https.Agent({ rejectUnauthorized: false });

function call(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
    const req = https.request(
      `${BASE}${path}`,
      {
        method,
        agent,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(raw);
          } catch (err) {
            json = { message: raw };
          }
          resolve({ status: res.statusCode, body: json, requestId: res.headers["x-request-id"] });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function show(step, res) {
  console.log(`${String(res.status).padEnd(4)} ${step.padEnd(52)} ${res.body.message || ""}`);
}

async function main() {
  const stamp = Date.now();
  const freelancer = {
    name: "Demo Freelancer",
    email: `freelancer${stamp}@example.com`,
    password: "Freelance#2026",
    role: "freelancer",
  };
  const client = {
    name: "Demo Client",
    email: `client${stamp}@example.com`,
    password: "ClientPass#2026",
    role: "client",
  };

  console.log(`Sending demo requests to ${BASE}\n`);

  let res = await call("GET", "/api/health");
  show("Health check", res);

  res = await call("POST", "/api/auth/register", freelancer);
  show("Register freelancer", res);

  res = await call("POST", "/api/auth/register", client);
  show("Register client", res);

  res = await call("POST", "/api/auth/login", { email: freelancer.email, password: freelancer.password });
  show("Freelancer login (success)", res);
  const freelancerToken = res.body.data && res.body.data.token;

  res = await call("POST", "/api/auth/login", { email: client.email, password: "WrongPassword#1" });
  show("Client login with WRONG password", res);

  res = await call("POST", "/api/auth/login", { email: client.email, password: client.password });
  show("Client login (success)", res);
  const clientToken = res.body.data && res.body.data.token;

  if (!freelancerToken || !clientToken) {
    console.log("\nLogin failed, so the rest cannot run. If you see 429, wait 15 minutes and try again.");
    return;
  }

  res = await call(
    "POST",
    "/api/gigs",
    {
      title: "Logo design",
      description: "A clean, modern logo for a small business.",
      category: "Design",
      price: 750,
    },
    freelancerToken
  );
  show("Freelancer creates a gig", res);
  const gigId = res.body.data && res.body.data.id;

  res = await call("POST", "/api/bookings", { gigId }, clientToken);
  show("Client books the gig", res);
  const bookingId = res.body.data && res.body.data.id;

  res = await call("POST", `/api/bookings/${bookingId}/confirm`, undefined, clientToken);
  show("Client confirms booking (transaction recorded)", res);

  res = await call("POST", `/api/bookings/${bookingId}/confirm`, undefined, clientToken);
  show("Client confirms again (blocked)", res);

  res = await call("GET", "/api/transactions/mine", undefined, freelancerToken);
  show("Freelancer views income", res);

  console.log("\nSecurity events:");

  res = await call("GET", "/api/admin/gigs", undefined, clientToken);
  show("Client tries the admin route", res);

  res = await call("GET", "/api/auth/me");
  show("/me with no token", res);

  res = await call("GET", "/api/auth/me", undefined, "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IngiLCJyb2xlIjoiYWRtaW4ifQ.forged");
  show("/me with a forged admin token", res);

  res = await call("POST", "/api/auth/login", { email: { $ne: null }, password: "anything" });
  show("NoSQL injection login attempt", res);

  res = await call("POST", "/api/auth/login", '{"email": ');
  show("Broken JSON body", res);

  res = await call("POST", "/api/auth/login", { email: client.email, password: "Guess#12345" });
  show("Another login attempt (rate limited)", res);

  console.log("\nDone. Open logs/security.log and logs/app.log to see the entries.");
}

main().catch((err) => {
  console.error(`Could not reach the API at ${BASE}. Is "npm run dev" running?`);
  console.error(err.message);
  process.exit(1);
});
