import https from "https";
import fs from "fs";

const results = [];

function req(method, path, { body, token, headers = {}, origin } = {}) {
  return new Promise((resolve) => {
    const data = body !== undefined ? JSON.stringify(body) : null;
    const hdrs = { ...headers };
    if (data) {
      hdrs["Content-Type"] = "application/json";
      hdrs["Content-Length"] = Buffer.byteLength(data);
    }
    if (token) hdrs.Authorization = "Bearer " + token;
    if (origin) hdrs.Origin = origin;
    const r = https.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: hdrs,
        rejectUnauthorized: false,
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, headers: res.headers, json, raw });
        });
      }
    );
    r.on("error", (err) => resolve({ status: 0, error: err.message }));
    if (data) r.write(data);
    r.end();
  });
}

function check(id, owasp, pass, detail) {
  results.push({ id, owasp, pass, detail });
}

const health = await req("GET", "/api/health");
const h = health.headers || {};
check("HTTPS health endpoint", "A02 Cryptographic Failures", health.status === 200, "status " + health.status);
check("HSTS", "A02 Cryptographic Failures", Boolean(h["strict-transport-security"]), String(h["strict-transport-security"] || "missing"));
check("X-Content-Type-Options nosniff", "A05 Security Misconfiguration", h["x-content-type-options"] === "nosniff", String(h["x-content-type-options"]));
check("X-Frame-Options", "A04 Insecure Design", Boolean(h["x-frame-options"]), String(h["x-frame-options"]));
check("CSP present", "A05 Security Misconfiguration", Boolean(h["content-security-policy"]), String(h["content-security-policy"] || "").slice(0, 180));
check("Referrer-Policy", "A05 Security Misconfiguration", h["referrer-policy"] === "no-referrer", String(h["referrer-policy"]));
check("COOP", "A05 Security Misconfiguration", Boolean(h["cross-origin-opener-policy"]), String(h["cross-origin-opener-policy"]));

const corsBad = await req("GET", "/api/health", { origin: "https://evil.example" });
const acao = corsBad.headers["access-control-allow-origin"];
check("CORS does not reflect unknown origin", "A05 Security Misconfiguration", acao !== "https://evil.example", "ACAO=" + acao);

const corsOk = await req("GET", "/api/health", { origin: "http://localhost:5173" });
check("CORS allows Vite origin", "A05 Security Misconfiguration", corsOk.headers["access-control-allow-origin"] === "http://localhost:5173", String(corsOk.headers["access-control-allow-origin"]));

const meNone = await req("GET", "/api/auth/me");
check("GET /api/auth/me without token is 401", "A01 Broken Access Control", meNone.status === 401 && meNone.json?.success === false, JSON.stringify(meNone.json));

const meBad = await req("GET", "/api/auth/me", { token: "not-a-jwt" });
check("GET /api/auth/me with invalid token is 401", "A01 Broken Access Control", meBad.status === 401, JSON.stringify(meBad.json));

const mineNone = await req("GET", "/api/gigs/mine");
check("GET /api/gigs/mine without token is 401", "A01 Broken Access Control", mineNone.status === 401, JSON.stringify(mineNone.json));

const adminNone = await req("GET", "/api/admin/gigs");
check("GET /api/admin/gigs without token is 401", "A01 Broken Access Control", adminNone.status === 401, JSON.stringify(adminNone.json));

const bookNone = await req("POST", "/api/bookings", { body: { gigId: "x" } });
check("POST /api/bookings without token is 401", "A01 Broken Access Control", bookNone.status === 401, JSON.stringify(bookNone.json));

const incomeNone = await req("GET", "/api/transactions/mine");
check("GET /api/transactions/mine without token is 401", "A01 Broken Access Control", incomeNone.status === 401, JSON.stringify(incomeNone.json));

const stamp = Date.now();
const freelancer = {
  name: "Zap Freelancer",
  email: "zap.f." + stamp + "@test.com",
  password: "Password1!",
  role: "freelancer",
};
const client = {
  name: "Zap Client",
  email: "zap.c." + stamp + "@test.com",
  password: "Password1!",
  role: "client",
};
const rf = await req("POST", "/api/auth/register", { body: freelancer });
await req("POST", "/api/auth/register", { body: client });
check(
  "Register does not return password",
  "A07 Identification and Authentication Failures",
  rf.status === 201 && rf.json?.data && !("password" in rf.json.data),
  "keys=" + Object.keys(rf.json?.data || {}).join(",")
);

const lf = await req("POST", "/api/auth/login", {
  body: { email: freelancer.email, password: freelancer.password },
});
const lc = await req("POST", "/api/auth/login", {
  body: { email: client.email, password: client.password },
});
check(
  "Login returns JWT and omits password",
  "A07 Identification and Authentication Failures",
  Boolean(lf.json?.data?.token) && !("password" in (lf.json?.data?.user || {})),
  "login status " + lf.status
);

const fToken = lf.json?.data?.token;
const cToken = lc.json?.data?.token;

const clientCreatesGig = await req("POST", "/api/gigs", {
  token: cToken,
  body: {
    title: "Should fail",
    description: "Client must not create gigs here",
    category: "Test",
    price: 10,
  },
});
check("Client cannot create gig", "A01 Broken Access Control", clientCreatesGig.status === 403, JSON.stringify(clientCreatesGig.json));

const clientIncome = await req("GET", "/api/transactions/mine", { token: cToken });
check("Client cannot read freelancer income", "A01 Broken Access Control", clientIncome.status === 403, JSON.stringify(clientIncome.json));

const clientAdmin = await req("GET", "/api/admin/gigs", { token: cToken });
check("Client cannot open admin gigs", "A01 Broken Access Control", clientAdmin.status === 403, JSON.stringify(clientAdmin.json));

const extraField = await req("POST", "/api/gigs", {
  token: fToken,
  body: {
    title: "Zap gig title",
    description: "Zap gig description text",
    category: "Cleaning",
    price: 100,
    freelancerId: "attacker",
  },
});
check("Unexpected fields rejected on gig create", "A03 Injection", extraField.status === 400, JSON.stringify(extraField.json));

const operatorBody = {
  title: "Zap gig title",
  description: "Zap gig description text",
  category: "Cleaning",
  price: 100,
};
operatorBody["$where"] = "1";
const dollarKey = await req("POST", "/api/gigs", { token: fToken, body: operatorBody });
check(
  "Mongo operator keys rejected",
  "A03 Injection",
  dollarKey.status === 400 && /unsafe|Unexpected|Invalid/i.test(dollarKey.json?.message || ""),
  JSON.stringify(dollarKey.json)
);

const html = await req("POST", "/api/gigs", {
  token: fToken,
  body: {
    title: "<b>Bold</b> window",
    description: "Normal description text here",
    category: "Cleaning",
    price: 80,
  },
});
const stripped = html.json?.data?.title;
check(
  "HTML tags stripped from stored title",
  "A03 Injection",
  html.status === 201 && stripped === "Bold window",
  "title=" + stripped + " status=" + html.status
);

const badJson = await new Promise((resolve) => {
  const r = https.request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      rejectUnauthorized: false,
    },
    (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => resolve({ status: res.statusCode, raw }));
    }
  );
  r.write("{not json");
  r.end();
});
check(
  "Malformed JSON does not leak stack",
  "A09 Security Logging and Monitoring Failures",
  badJson.status === 400 && !/stack|server.js|node_modules/i.test(badJson.raw),
  badJson.raw
);

const missing = await req("POST", "/api/auth/register", { body: { email: "x@test.com" } });
check("Validation rejects incomplete register", "A07 Identification and Authentication Failures", missing.status === 400, JSON.stringify(missing.json));

const unknown = await req("GET", "/api/does-not-exist");
check("Unknown route is JSON 404", "A05 Security Misconfiguration", unknown.status === 404 && unknown.json?.success === false, JSON.stringify(unknown.json));

const out = {
  pass: results.filter((r) => r.pass).length,
  fail: results.filter((r) => !r.pass).length,
  total: results.length,
  results,
};
fs.writeFileSync(new URL("./control-checks.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
