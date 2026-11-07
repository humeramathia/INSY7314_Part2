const fs = require("fs");
const path = require("path");

function url(parts) {
  return {
    raw: `{{baseUrl}}/${parts.join("/")}`,
    host: ["{{baseUrl}}"],
    path: parts,
  };
}

function bearer(tokenVar) {
  const value = tokenVar === "badtoken" ? "badtoken" : `{{${tokenVar}}}`;
  return {
    type: "bearer",
    bearer: [{ key: "token", value, type: "string" }],
  };
}

function jsonBody(obj) {
  return {
    mode: "raw",
    raw: JSON.stringify(obj, null, 2),
    options: { raw: { language: "json" } },
  };
}

function tests(lines) {
  return [
    {
      listen: "test",
      script: { type: "text/javascript", exec: lines },
    },
  ];
}

const okBody = [
  "const body = pm.response.json();",
  'pm.test("success is true", () => pm.expect(body.success).to.eql(true));',
  'pm.test("message is a string", () => pm.expect(body.message).to.be.a("string"));',
];

const failBody = [
  "const body = pm.response.json();",
  'pm.test("success is false", () => pm.expect(body.success).to.eql(false));',
  'pm.test("error message is present", () => {',
  "    pm.expect(body.message).to.be.a(\"string\");",
  "    pm.expect(body.message.length).to.be.above(0);",
  "});",
];

function item({ name, method, pathParts, auth, body, extraTests = [], status, fail = false }) {
  const statusTest = `pm.test("${status}", () => pm.response.to.have.status(${status}));`;
  const request = {
    method,
    header: [],
    url: url(pathParts),
  };
  if (auth) request.auth = bearer(auth);
  if (body) request.body = jsonBody(body);
  return {
    name,
    event: tests([statusTest, ...(fail ? failBody : okBody), ...extraTests]),
    request,
    response: [],
  };
}

const collection = {
  info: {
    _postman_id: "8693dd9f-55fc-49a4-af65-36ee0d191978",
    name: "HustleHub-Part2",
    description:
      "Part 2 API checks. Every request asserts status and JSON {success, message}. Set passwords in postman/local-secrets.json. Needs freelancer A/B, client A/B, and admin.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [
    item({
      name: "Health Check",
      method: "GET",
      pathParts: ["api", "health"],
      status: 200,
    }),
    item({
      name: "Login Freelancer A",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "{{freelancerEmail}}", password: "{{freelancerPassword}}" },
      status: 200,
      extraTests: [
        "if (body.success && body.data && body.data.token) {",
        '    pm.collectionVariables.set("freelancerToken", body.data.token);',
        "}",
        'pm.test("JWT returned", () => pm.expect(body.data.token).to.be.a("string").and.not.eql(""));',
      ],
    }),
    item({
      name: "Login Freelancer B",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "{{freelancerBEmail}}", password: "{{freelancerBPassword}}" },
      status: 200,
      extraTests: [
        "if (body.success && body.data && body.data.token) {",
        '    pm.collectionVariables.set("freelancerBToken", body.data.token);',
        "}",
        'pm.test("JWT returned", () => pm.expect(body.data.token).to.be.a("string").and.not.eql(""));',
      ],
    }),
    item({
      name: "Login Client A",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "{{clientEmail}}", password: "{{clientPassword}}" },
      status: 200,
      extraTests: [
        "if (body.success && body.data && body.data.token) {",
        '    pm.collectionVariables.set("clientToken", body.data.token);',
        "}",
        'pm.test("JWT returned", () => pm.expect(body.data.token).to.be.a("string").and.not.eql(""));',
      ],
    }),
    item({
      name: "Login Client B",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "{{clientBEmail}}", password: "{{clientBPassword}}" },
      status: 200,
      extraTests: [
        "if (body.success && body.data && body.data.token) {",
        '    pm.collectionVariables.set("clientBToken", body.data.token);',
        "}",
        'pm.test("JWT returned", () => pm.expect(body.data.token).to.be.a("string").and.not.eql(""));',
      ],
    }),
    item({
      name: "Login Admin",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "admin@hustlehub.local", password: "{{adminPassword}}" },
      status: 200,
      extraTests: [
        "if (body.success && body.data && body.data.token) {",
        '    pm.collectionVariables.set("adminToken", body.data.token);',
        "}",
        'pm.test("JWT returned", () => pm.expect(body.data.token).to.be.a("string").and.not.eql(""));',
      ],
    }),
    item({
      name: "List Gigs",
      method: "GET",
      pathParts: ["api", "gigs"],
      status: 200,
    }),
    item({
      name: "Create Gig",
      method: "POST",
      pathParts: ["api", "gigs"],
      auth: "freelancerToken",
      body: {
        title: "Window cleaning",
        description: "Deep clean interior and exterior windows.",
        category: "Cleaning",
        price: 250,
      },
      status: 201,
      extraTests: [
        "if (pm.response.code === 201 && body.data && body.data.id) {",
        '    pm.collectionVariables.set("gigId", body.data.id);',
        "}",
        'pm.test("gig id returned", () => pm.expect(body.data.id).to.be.a("string"));',
      ],
    }),
    item({
      name: "Get Gig By ID",
      method: "GET",
      pathParts: ["api", "gigs", "{{gigId}}"],
      status: 200,
    }),
    item({
      name: "My Gigs",
      method: "GET",
      pathParts: ["api", "gigs", "mine"],
      auth: "freelancerToken",
      status: 200,
    }),
    item({
      name: "Update Gig",
      method: "PUT",
      pathParts: ["api", "gigs", "{{gigId}}"],
      auth: "freelancerToken",
      body: {
        title: "Window cleaning service",
        description: "Deep clean interior and exterior windows.",
        category: "Cleaning",
        price: 250,
      },
      status: 200,
    }),
    item({
      name: "Create Booking",
      method: "POST",
      pathParts: ["api", "bookings"],
      auth: "clientToken",
      body: { gigId: "{{gigId}}" },
      status: 201,
      extraTests: [
        "if (pm.response.code === 201 && body.data && body.data.id) {",
        '    pm.collectionVariables.set("bookingId", body.data.id);',
        "}",
        'pm.test("booking id returned", () => pm.expect(body.data.id).to.be.a("string"));',
      ],
    }),
    item({
      name: "My Bookings Client A",
      method: "GET",
      pathParts: ["api", "bookings", "mine"],
      auth: "clientToken",
      status: 200,
    }),
    item({
      name: "Confirm Booking",
      method: "POST",
      pathParts: ["api", "bookings", "{{bookingId}}", "confirm"],
      auth: "clientToken",
      status: 200,
    }),
    item({
      name: "My Income",
      method: "GET",
      pathParts: ["api", "transactions", "mine"],
      auth: "freelancerToken",
      status: 200,
    }),
    item({
      name: "Admin Gigs",
      method: "GET",
      pathParts: ["api", "admin", "gigs"],
      auth: "adminToken",
      status: 200,
    }),
    item({
      name: "Forbidden - Client Create Gig",
      method: "POST",
      pathParts: ["api", "gigs"],
      auth: "clientToken",
      body: {
        title: "Test restricted gig",
        description: "This request should be rejected.",
        category: "Cleaning",
        price: 100,
      },
      status: 403,
      fail: true,
    }),
    item({
      name: "Forbidden - Freelancer Admin Gigs",
      method: "GET",
      pathParts: ["api", "admin", "gigs"],
      auth: "freelancerToken",
      status: 403,
      fail: true,
    }),
    item({
      name: "Forbidden - Freelancer Create Booking",
      method: "POST",
      pathParts: ["api", "bookings"],
      auth: "freelancerToken",
      body: { gigId: "{{gigId}}" },
      status: 403,
      fail: true,
    }),
    item({
      name: "Forbidden - Freelancer B Updates Freelancer A Gig",
      method: "PUT",
      pathParts: ["api", "gigs", "{{gigId}}"],
      auth: "freelancerBToken",
      body: {
        title: "Stolen listing",
        description: "Freelancer B must not be able to edit this.",
        category: "Cleaning",
        price: 1,
      },
      status: 403,
      fail: true,
    }),
    item({
      name: "Forbidden - Freelancer B Deletes Freelancer A Gig",
      method: "DELETE",
      pathParts: ["api", "gigs", "{{gigId}}"],
      auth: "freelancerBToken",
      status: 403,
      fail: true,
    }),
    item({
      name: "IDOR - Client B Bookings Do Not Include Client A",
      method: "GET",
      pathParts: ["api", "bookings", "mine"],
      auth: "clientBToken",
      status: 200,
      extraTests: [
        "const ids = Array.isArray(body.data) ? body.data.map((row) => row.id) : [];",
        'const foreignId = pm.collectionVariables.get("bookingId");',
        'pm.test("client B list does not include client A booking", () => {',
        "    pm.expect(ids).to.not.include(foreignId);",
        "});",
      ],
    }),
    item({
      name: "Forbidden - Client B Confirms Client A Booking",
      method: "POST",
      pathParts: ["api", "bookings", "{{bookingId}}", "confirm"],
      auth: "clientBToken",
      status: 403,
      fail: true,
    }),
    item({
      name: "Forbidden - Client Income",
      method: "GET",
      pathParts: ["api", "transactions", "mine"],
      auth: "clientToken",
      status: 403,
      fail: true,
    }),
    item({
      name: "Conflict - Confirm Booking Twice",
      method: "POST",
      pathParts: ["api", "bookings", "{{bookingId}}", "confirm"],
      auth: "clientToken",
      status: 409,
      fail: true,
    }),
    item({
      name: "Unauthorized - No Token",
      method: "GET",
      pathParts: ["api", "auth", "me"],
      status: 401,
      fail: true,
    }),
    item({
      name: "Unauthorized - Invalid Token",
      method: "GET",
      pathParts: ["api", "auth", "me"],
      auth: "badtoken", // literal junk JWT, not a collection variable
      status: 401,
      fail: true,
    }),
    ...[1, 2, 3, 4, 5].map((n) =>
      item({
        name: `Rate Limit - Failed Login ${n}`,
        method: "POST",
        pathParts: ["api", "auth", "login"],
        body: { email: "rate-limit@test.com", password: "WrongPass1!" },
        status: 401,
        fail: true,
      })
    ),
    item({
      name: "Rate Limit - Failed Login 6 Expect 429",
      method: "POST",
      pathParts: ["api", "auth", "login"],
      body: { email: "rate-limit@test.com", password: "WrongPass1!" },
      status: 429,
      fail: true,
    }),
  ],
  variable: [
    { key: "baseUrl", value: "https://localhost:3000" },
    { key: "freelancerToken", value: "" },
    { key: "freelancerBToken", value: "" },
    { key: "clientToken", value: "" },
    { key: "clientBToken", value: "" },
    { key: "adminToken", value: "" },
    { key: "gigId", value: "" },
    { key: "bookingId", value: "" },
    { key: "freelancerEmail", value: "imraannordien@gmail.com" },
    { key: "freelancerPassword", value: "" },
    { key: "freelancerBEmail", value: "imraan.freelancer.b@demo.com" },
    { key: "freelancerBPassword", value: "" },
    { key: "clientEmail", value: "imraan.client@demo.com" },
    { key: "clientPassword", value: "" },
    { key: "clientBEmail", value: "imraan.client.b@demo.com" },
    { key: "clientBPassword", value: "" },
    { key: "adminPassword", value: "" },
  ],
};

const out = path.join(__dirname, "..", "postman", "HustleHub-Part2.postman_collection.json");
fs.writeFileSync(out, `${JSON.stringify(collection, null, 4)}\n`);
console.log(`Wrote ${collection.item.length} requests to ${out}`);
