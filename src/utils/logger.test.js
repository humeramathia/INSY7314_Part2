const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { info } = require("./logger");

describe("logger", () => {
  it("writes JSON without a password field", () => {
    const chunks = [];
    const original = console.log;
    console.log = (line) => chunks.push(line);
    try {
      info("login.success", { userId: "abc", role: "freelancer" });
    } finally {
      console.log = original;
    }
    const parsed = JSON.parse(chunks[0]);
    assert.equal(parsed.event, "login.success");
    assert.equal(parsed.userId, "abc");
    assert.equal("password" in parsed, false);
    assert.equal("token" in parsed, false);
  });
});
