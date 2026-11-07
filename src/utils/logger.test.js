const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { maskEmail, scrub } = require("./logger");

describe("logger redaction", () => {
  it("masks email addresses", () => {
    assert.equal(maskEmail("ada@test.com"), "ad***@test.com");
  });

  it("redacts passwords and tokens and strips line breaks", () => {
    const clean = scrub({
      password: "Secret123!",
      token: "abc.def.ghi",
      note: "line1\nFAKE admin login",
    });
    assert.equal(clean.password, "[REDACTED]");
    assert.equal(clean.token, "[REDACTED]");
    assert.equal(clean.note.includes("\n"), false);
  });
});
