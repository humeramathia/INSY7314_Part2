/**
 * Logging tests.
 *
 * The real Express app and middleware run; only the Mongo models are mocked,
 * so no database is needed. Each test checks that a key system event is
 * logged with the right fields, and that secrets never reach the log.
 */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-for-logging-tests";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/hustlehub-test";

jest.mock("../src/models/userModel");
jest.mock("../src/models/gigModel");
jest.mock("../src/models/bookingModel");
jest.mock("../src/models/transactionModel");

const request = require("supertest");
const { logger, maskEmail, scrub } = require("../src/utils/logger");
const { signToken } = require("../src/utils/jwt");
const { hashPassword } = require("../src/utils/password");
const userModel = require("../src/models/userModel");
const gigModel = require("../src/models/gigModel");
const bookingModel = require("../src/models/bookingModel");
const transactionModel = require("../src/models/transactionModel");
const app = require("../src/app");

const CLIENT_ID = "6650a0000000000000000001";
const FREELANCER_ID = "6650a0000000000000000002";
const OTHER_CLIENT_ID = "6650a0000000000000000003";
const GIG_ID = "6650a00000000000000000a1";
const BOOKING_ID = "6650a00000000000000000b1";
const TX_ID = "6650a00000000000000000c1";

let entries;

/** Captures every entry passed to the logger (before it is written). */
function captureLogs() {
  entries = [];
  jest.spyOn(logger, "log").mockImplementation((entry) => {
    entries.push(entry);
    return logger;
  });
  jest.spyOn(logger, "error").mockImplementation((entry) => {
    entries.push({ level: "error", ...entry });
    return logger;
  });
  jest.spyOn(logger, "warn").mockImplementation((entry) => {
    entries.push({ level: "warn", ...entry });
    return logger;
  });
}

function findEvent(event) {
  return entries.filter((entry) => entry.event === event);
}

const bearer = (id, role) => `Bearer ${signToken({ id, role })}`;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  captureLogs();
});

describe("request logging", () => {
  test("every request gets an X-Request-Id and an access log line", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    const [access] = findEvent("http.request");
    expect(access).toMatchObject({
      method: "GET",
      path: "/api/health",
      status: 200,
      requestId: res.headers["x-request-id"],
    });
  });

  test("query strings are not logged in the path", async () => {
    await request(app).get("/api/health?token=abc123");
    const [access] = findEvent("http.request");
    expect(access.path).toBe("/api/health");
  });
});

describe("login attempts", () => {
  const email = "lilitha@example.com";
  const password = "Str0ng!Passw0rd";

  test("successful login is logged as a security event", async () => {
    userModel.findByEmail.mockResolvedValue({
      _id: CLIENT_ID,
      name: "Lilitha",
      email,
      role: "client",
      password: await hashPassword(password),
    });

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    const [event] = findEvent("auth.login.success");
    expect(event).toMatchObject({ category: "security", level: "info", userId: CLIENT_ID });
  });

  test("wrong password is logged with the reason", async () => {
    userModel.findByEmail.mockResolvedValue({
      _id: CLIENT_ID,
      email,
      role: "client",
      password: await hashPassword(password),
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "WrongPassword1!" });

    expect(res.status).toBe(401);
    const [event] = findEvent("auth.login.failure");
    expect(event).toMatchObject({ level: "warn", reason: "wrong_password", targetUserId: CLIENT_ID });
  });

  test("unknown email is logged, client still gets the generic message", async () => {
    userModel.findByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password });

    expect(res.body.message).toBe("Invalid email or password");
    const [event] = findEvent("auth.login.failure");
    expect(event.reason).toBe("unknown_email");
  });

  test("the password is never passed to the logger", async () => {
    userModel.findByEmail.mockResolvedValue(null);
    await request(app).post("/api/auth/login").send({ email, password });

    expect(JSON.stringify(entries)).not.toContain(password);
  });
});

describe("tokens and access control", () => {
  test("missing token is logged", async () => {
    await request(app).get("/api/auth/me");
    expect(findEvent("auth.token.missing")).toHaveLength(1);
  });

  test("forged token is logged without the token value", async () => {
    const forged = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IngiLCJyb2xlIjoiYWRtaW4ifQ.bad";
    await request(app).get("/api/auth/me").set("Authorization", `Bearer ${forged}`);

    const [event] = findEvent("auth.token.invalid");
    expect(event.reason).toBe("bad_signature_or_malformed");
    expect(JSON.stringify(entries)).not.toContain(forged);
  });

  test("wrong role is logged as access denied", async () => {
    await request(app)
      .get("/api/admin/gigs")
      .set("Authorization", bearer(CLIENT_ID, "client"));

    const [event] = findEvent("access.denied");
    expect(event).toMatchObject({ reason: "wrong_role", requiredRole: "admin", userId: CLIENT_ID });
  });

  test("NoSQL injection payload is rejected and logged", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $ne: null }, password: "x" });

    expect(res.status).toBe(400);
    expect(findEvent("input.unsafe_rejected")).toHaveLength(1);
  });
});

describe("bookings and transactions", () => {
  const booking = {
    id: BOOKING_ID,
    gigId: GIG_ID,
    clientId: CLIENT_ID,
    freelancerId: FREELANCER_ID,
    amount: 750,
    status: "pending",
  };

  test("booking creation is logged", async () => {
    gigModel.findById.mockResolvedValue({ id: GIG_ID, freelancerId: FREELANCER_ID, price: 750 });
    bookingModel.createBooking.mockResolvedValue(booking);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", bearer(CLIENT_ID, "client"))
      .send({ gigId: GIG_ID });

    expect(res.status).toBe(201);
    const [event] = findEvent("booking.created");
    expect(event).toMatchObject({ category: "audit", bookingId: BOOKING_ID, amount: 750 });
  });

  test("confirming a booking logs the confirmation and the transaction", async () => {
    bookingModel.findById.mockResolvedValue(booking);
    transactionModel.findByBookingId.mockResolvedValue(null);
    bookingModel.confirmBooking.mockResolvedValue({ ...booking, status: "confirmed" });
    transactionModel.createTransaction.mockResolvedValue({
      id: TX_ID,
      bookingId: BOOKING_ID,
      gigId: GIG_ID,
      clientId: CLIENT_ID,
      freelancerId: FREELANCER_ID,
      amount: 750,
      type: "booking",
    });

    const res = await request(app)
      .post(`/api/bookings/${BOOKING_ID}/confirm`)
      .set("Authorization", bearer(CLIENT_ID, "client"));

    expect(res.status).toBe(200);
    expect(findEvent("booking.confirmed")).toHaveLength(1);
    const [tx] = findEvent("transaction.recorded");
    expect(tx).toMatchObject({ transactionId: TX_ID, bookingId: BOOKING_ID, amount: 750 });
  });

  test("confirming another client's booking is logged as access denied", async () => {
    bookingModel.findById.mockResolvedValue(booking);

    const res = await request(app)
      .post(`/api/bookings/${BOOKING_ID}/confirm`)
      .set("Authorization", bearer(OTHER_CLIENT_ID, "client"));

    expect(res.status).toBe(403);
    const [event] = findEvent("access.denied");
    expect(event).toMatchObject({ reason: "not_booking_owner", userId: OTHER_CLIENT_ID });
    expect(findEvent("transaction.recorded")).toHaveLength(0);
  });

  test("a duplicate payment attempt is logged", async () => {
    bookingModel.findById.mockResolvedValue(booking);
    transactionModel.findByBookingId.mockResolvedValue({ id: TX_ID });

    const res = await request(app)
      .post(`/api/bookings/${BOOKING_ID}/confirm`)
      .set("Authorization", bearer(CLIENT_ID, "client"));

    expect(res.status).toBe(409);
    expect(findEvent("transaction.duplicate_blocked")).toHaveLength(1);
  });
});

describe("errors", () => {
  test("unexpected errors are logged with a stack, client gets a generic message", async () => {
    bookingModel.findMine.mockRejectedValue(new Error("Mongo exploded"));

    const res = await request(app)
      .get("/api/bookings/mine")
      .set("Authorization", bearer(CLIENT_ID, "client"));

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Something went wrong");
    expect(JSON.stringify(res.body)).not.toContain("Mongo exploded");

    const [event] = findEvent("error.unhandled");
    expect(event).toMatchObject({ errorMessage: "Mongo exploded", requestId: res.headers["x-request-id"] });
    expect(event.stack).toContain("Error: Mongo exploded");
  });

  test("invalid JSON is logged", async () => {
    await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": ');

    expect(findEvent("request.invalid_json")).toHaveLength(1);
  });
});

describe("gigs", () => {
  test("gig creation is logged and keeps the audit category", async () => {
    gigModel.createGig.mockResolvedValue({ id: GIG_ID, price: 750, category: "Design" });

    const res = await request(app)
      .post("/api/gigs")
      .set("Authorization", bearer(FREELANCER_ID, "freelancer"))
      .send({ title: "Logo design", description: "A clean modern logo.", category: "Design", price: 750 });

    expect(res.status).toBe(201);
    const [event] = findEvent("gig.created");
    expect(event).toMatchObject({ category: "audit", gigCategory: "Design", gigId: GIG_ID });
  });
});

describe("redaction helpers", () => {
  test("emails are masked", () => {
    expect(maskEmail("lilitha@example.com")).toBe("li***@example.com");
  });

  test("secrets are redacted and line breaks are stripped", () => {
    const clean = scrub({
      password: "hunter2",
      authorization: "Bearer abc",
      nested: { token: "abc" },
      note: "line1\nFAKE level=info admin login",
    });

    expect(clean.password).toBe("[REDACTED]");
    expect(clean.authorization).toBe("[REDACTED]");
    expect(clean.nested.token).toBe("[REDACTED]");
    expect(clean.note).not.toContain("\n");
  });
});
