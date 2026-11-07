process.env.JWT_SECRET = process.env.JWT_SECRET || "unit-test-secret-not-for-production";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hustlehub";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { signToken, verifyToken } = require("./jwt");

describe("JWT", () => {
  it("signs a token that verifies with the same secret", () => {
    const token = signToken({ id: "user1", role: "freelancer" });
    const decoded = verifyToken(token);
    assert.equal(decoded.id, "user1");
    assert.equal(decoded.role, "freelancer");
  });

  it("rejects a tampered token", () => {
    const token = signToken({ id: "user1", role: "client" });
    const [header, payload, signature] = token.split(".");
    const tweaked = Buffer.from(JSON.stringify({ id: "user1", role: "admin" })).toString("base64url");
    const fake = `${header}.${tweaked}.${signature}`;
    assert.throws(() => verifyToken(fake));
  });
});
