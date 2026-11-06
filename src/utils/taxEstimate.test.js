const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { estimateTax, incomeByMonth, PRIMARY_REBATE } = require("./taxEstimate");

describe("estimateTax", () => {
  it("returns zero tax when there is no income", () => {
    const result = estimateTax(0);
    assert.equal(result.estimatedTax, 0);
    assert.equal(result.netIncome, 0);
    assert.equal(result.effectiveRate, 0);
  });

  it("applies 18% then the primary rebate on modest income", () => {
    const result = estimateTax(100000);
    assert.equal(result.taxBeforeRebate, 18000);
    assert.equal(result.primaryRebate, PRIMARY_REBATE);
    assert.equal(result.estimatedTax, 765);
    assert.equal(result.netIncome, 99235);
    assert.equal(result.marginalRate, 18);
  });

  it("uses the second SARS bracket above R237 100", () => {
    const result = estimateTax(300000);
    assert.equal(result.taxBeforeRebate, 59032);
    assert.equal(result.estimatedTax, 41797);
    assert.equal(result.marginalRate, 26);
  });
});

describe("incomeByMonth", () => {
  it("groups confirmed amounts by year-month", () => {
    const rows = incomeByMonth([
      { amount: 100, createdAt: "2026-03-01T00:00:00.000Z" },
      { amount: 50, createdAt: "2026-03-20T00:00:00.000Z" },
      { amount: 80, createdAt: "2026-04-02T00:00:00.000Z" },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].month, "2026-03");
    assert.equal(rows[0].amount, 150);
    assert.equal(rows[1].month, "2026-04");
  });
});
