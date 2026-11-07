const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { success, fail } = require("./response");

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("API envelope", () => {
  it("returns success JSON without leaking extra fields", () => {
    const res = mockRes();
    success(res, 200, "OK", { id: "1" });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, message: "OK", data: { id: "1" } });
  });

  it("returns failure JSON with success false", () => {
    const res = mockRes();
    fail(res, 401, "Invalid email or password");
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { success: false, message: "Invalid email or password" });
  });
});
