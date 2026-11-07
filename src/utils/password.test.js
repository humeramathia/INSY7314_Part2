const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, comparePassword } = require("./password");

describe("password hashing", () => {
  it("hashes a password and accepts the same plaintext", async () => {
    const hash = await hashPassword("Secret123!");
    assert.notEqual(hash, "Secret123!");
    assert.equal(await comparePassword("Secret123!", hash), true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("Secret123!");
    assert.equal(await comparePassword("Wrong123!", hash), false);
  });
});
