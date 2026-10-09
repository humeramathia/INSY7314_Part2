import https from "https";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const results = [];

function req(method, path, { body, token } = {}) {
  return new Promise((resolve) => {
    const data = body !== undefined ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(data);
    }
    if (token) headers.Authorization = "Bearer " + token;
    const r = https.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers,
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

function check(id, pass, detail) {
  results.push({ id, pass, detail });
}

const stamp = Date.now();
const freelancer = {
  name: "Poe Freelancer",
  email: "poe.f." + stamp + "@test.com",
  password: "Password1!",
  role: "freelancer",
};
const otherFreelancer = {
  name: "Poe Other",
  email: "poe.f2." + stamp + "@test.com",
  password: "Password1!",
  role: "freelancer",
};
const client = {
  name: "Poe Client",
  email: "poe.c." + stamp + "@test.com",
  password: "Password1!",
  role: "client",
};

const health = await req("GET", "/api/health");
check("API runs over HTTPS", health.status === 200, "status " + health.status);
check("Helmet CSP header", Boolean(health.headers["content-security-policy"]), String(health.headers["content-security-policy"] || "").slice(0, 120));
check("Helmet HSTS", Boolean(health.headers["strict-transport-security"]), String(health.headers["strict-transport-security"]));
check("Cache-Control no-store", health.headers["cache-control"] === "no-store", String(health.headers["cache-control"]));

const rf = await req("POST", "/api/auth/register", { body: freelancer });
const rc = await req("POST", "/api/auth/register", { body: client });
check("Register freelancer 201", rf.status === 201 && rf.json?.data?.role === "freelancer", JSON.stringify(rf.json?.data?.role));
check("Register client 201", rc.status === 201 && rc.json?.data?.role === "client", JSON.stringify(rc.json?.data?.role));
check("Register omits password", rf.status === 201 && !("password" in (rf.json?.data || {})), Object.keys(rf.json?.data || {}).join(","));

const adminTry = await req("POST", "/api/auth/register", {
  body: {
    name: "Poe Admin",
    email: "poe.a." + stamp + "@test.com",
    password: "Password1!",
    role: "admin",
  },
});
check("Public cannot register as admin", adminTry.status === 400, JSON.stringify(adminTry.json));

const lf = await req("POST", "/api/auth/login", {
  body: { email: freelancer.email, password: freelancer.password },
});
const lc = await req("POST", "/api/auth/login", {
  body: { email: client.email, password: client.password },
});
check("Login freelancer returns JWT", lf.status === 200 && Boolean(lf.json?.data?.token), "status " + lf.status);
check("Login client returns JWT", lc.status === 200 && Boolean(lc.json?.data?.token), "status " + lc.status);
const fToken = lf.json?.data?.token;
const cToken = lc.json?.data?.token;

const me = await req("GET", "/api/auth/me", { token: fToken });
check("Protected /me with JWT", me.status === 200 && me.json?.data?.role === "freelancer", JSON.stringify(me.json?.data?.role));
const meNone = await req("GET", "/api/auth/me");
check("Protected /me without JWT is 401", meNone.status === 401, JSON.stringify(meNone.json));

const gig = await req("POST", "/api/gigs", {
  token: fToken,
  body: {
    title: "POE window clean",
    description: "Deep clean interior and exterior glass.",
    category: "Cleaning",
    price: 250,
  },
});
check("Freelancer creates gig 201", gig.status === 201 && gig.json?.data?.id, JSON.stringify(gig.json?.message));
const gigId = gig.json?.data?.id;

const listed = await req("GET", "/api/gigs");
check("Anyone can browse gigs", listed.status === 200 && listed.json?.data?.some((g) => g.id === gigId), "count " + (listed.json?.data?.length || 0));

const mine = await req("GET", "/api/gigs/mine", { token: fToken });
check("Freelancer lists own gigs", mine.status === 200 && mine.json?.data?.some((g) => g.id === gigId), JSON.stringify(mine.json?.message));

const updated = await req("PUT", "/api/gigs/" + gigId, {
  token: fToken,
  body: {
    title: "POE window clean plus",
    description: "Deep clean interior and exterior glass.",
    category: "Cleaning",
    price: 250,
  },
});
check("Freelancer updates own gig", updated.status === 200 && updated.json?.data?.title.includes("plus"), JSON.stringify(updated.json?.data?.title));
check("Update cannot steal freelancerId", updated.json?.data?.freelancerId === gig.json?.data?.freelancerId, String(updated.json?.data?.freelancerId));

const clientGig = await req("POST", "/api/gigs", {
  token: cToken,
  body: {
    title: "Should fail",
    description: "Clients must not create listings.",
    category: "Test",
    price: 10,
  },
});
check("Client cannot create gig 403", clientGig.status === 403, JSON.stringify(clientGig.json));

const booking = await req("POST", "/api/bookings", { token: cToken, body: { gigId } });
check("Client books gig 201 pending", booking.status === 201 && booking.json?.data?.status === "pending", JSON.stringify(booking.json));
const bookingId = booking.json?.data?.id;

const freelancerBooks = await req("POST", "/api/bookings", { token: fToken, body: { gigId } });
check("Freelancer cannot book 403", freelancerBooks.status === 403, JSON.stringify(freelancerBooks.json));

const freelancerConfirm = await req("POST", "/api/bookings/" + bookingId + "/confirm", { token: fToken });
check("Freelancer cannot confirm 403", freelancerConfirm.status === 403, JSON.stringify(freelancerConfirm.json));

const confirmed = await req("POST", "/api/bookings/" + bookingId + "/confirm", { token: cToken });
check(
  "Client confirm creates transaction",
  confirmed.status === 200 &&
    confirmed.json?.data?.booking?.status === "confirmed" &&
    confirmed.json?.data?.transaction?.amount === 250,
  JSON.stringify(confirmed.json?.data?.transaction)
);

const twice = await req("POST", "/api/bookings/" + bookingId + "/confirm", { token: cToken });
check("Confirm twice is 409", twice.status === 409, JSON.stringify(twice.json));

const income = await req("GET", "/api/transactions/mine", { token: fToken });
check(
  "Freelancer income is 250",
  income.status === 200 && income.json?.data?.totalIncome === 250,
  JSON.stringify(income.json?.data)
);

const clientIncome = await req("GET", "/api/transactions/mine", { token: cToken });
check("Client cannot read income 403", clientIncome.status === 403, JSON.stringify(clientIncome.json));

const clientAdmin = await req("GET", "/api/admin/gigs", { token: cToken });
check("Client cannot open admin gigs 403", clientAdmin.status === 403, JSON.stringify(clientAdmin.json));

const extra = await req("POST", "/api/gigs", {
  token: fToken,
  body: {
    title: "Mass assign",
    description: "Should reject extra field here.",
    category: "Cleaning",
    price: 90,
    freelancerId: "attacker",
  },
});
check("Mass assignment rejected", extra.status === 400, JSON.stringify(extra.json));

const operator = {
  title: "Operator key",
  description: "Should reject mongo operator keys.",
  category: "Cleaning",
  price: 90,
};
operator["$where"] = "1";
const unsafe = await req("POST", "/api/gigs", { token: fToken, body: operator });
check("Sanitiser rejects $ keys", unsafe.status === 400, JSON.stringify(unsafe.json));

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const gigDoc = await db.collection("gigs").findOne({ _id: new mongoose.Types.ObjectId(gigId) });
const bookingDoc = await db.collection("bookings").findOne({ _id: new mongoose.Types.ObjectId(bookingId) });
const txDoc = await db.collection("transactions").findOne({ bookingId });
check("Gig stored in MongoDB", Boolean(gigDoc), gigDoc ? gigDoc.title : "missing");
check("Booking stored in MongoDB", bookingDoc?.status === "confirmed", bookingDoc?.status);
check("Transaction stored in MongoDB", txDoc?.amount === 250, txDoc ? String(txDoc.amount) : "missing");
await mongoose.disconnect();

const out = {
  pass: results.filter((r) => r.pass).length,
  fail: results.filter((r) => !r.pass).length,
  total: results.length,
  tokens: { freelancer: Boolean(fToken), client: Boolean(cToken) },
  ids: { gigId, bookingId },
  otherFreelancer,
  results,
};

console.log(JSON.stringify(out, null, 2));
