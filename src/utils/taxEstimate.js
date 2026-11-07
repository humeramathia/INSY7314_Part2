/**
 * SARS personal income tax estimate for a South African freelancer.
 *
 * Year of assessment 2025/26 (1 March 2025 – 28 February 2026), the latest
 * published individual tables used for this POE. This is NOT a tax return.
 * It treats confirmed HustleHub+ income as the only taxable income, applies
 * the statutory brackets, then subtracts the primary rebate for a person
 * under 65. Medical credits, expenses, turnover tax, and VAT are out of
 * scope (SARS, 2025).
 */
const TAX_YEAR = "2025/26";
const PRIMARY_REBATE = 17235;

const BRACKETS = [
  { upTo: 237100, rate: 0.18, base: 0, from: 0 },
  { upTo: 370500, rate: 0.26, base: 42678, from: 237100 },
  { upTo: 512800, rate: 0.31, base: 77362, from: 370500 },
  { upTo: 673000, rate: 0.36, base: 121475, from: 512800 },
  { upTo: 857900, rate: 0.39, base: 179147, from: 673000 },
  { upTo: 1817000, rate: 0.41, base: 251258, from: 857900 },
  { upTo: Infinity, rate: 0.45, base: 644489, from: 1817000 },
];

function roundCents(value) {
  return Math.round(Number(value) * 100) / 100;
}

function taxBeforeRebate(income) {
  if (income <= 0) return 0;
  const bracket = BRACKETS.find((row) => income <= row.upTo);
  return roundCents(bracket.base + (income - bracket.from) * bracket.rate);
}

function estimateTax(grossIncome) {
  const income = roundCents(Math.max(0, Number(grossIncome) || 0));
  const beforeRebate = taxBeforeRebate(income);
  const estimatedTax = roundCents(Math.max(0, beforeRebate - PRIMARY_REBATE));
  const netIncome = roundCents(income - estimatedTax);
  const effectiveRate = income === 0 ? 0 : roundCents((estimatedTax / income) * 100);
  const bracket = BRACKETS.find((row) => income <= row.upTo);

  return {
    taxYear: TAX_YEAR,
    grossIncome: income,
    taxBeforeRebate: beforeRebate,
    primaryRebate: PRIMARY_REBATE,
    estimatedTax,
    netIncome,
    effectiveRate,
    marginalRate: Math.round(bracket.rate * 100),
    method:
      "SARS 2025/26 individual income tax brackets, minus the primary rebate for a person under 65. Confirmed freelance income is treated as the only taxable amount.",
    disclaimer:
      "Estimate only. It is not tax advice and does not replace a SARS return. Expenses, other income, age rebates, medical tax credits, turnover tax, and VAT are not applied.",
  };
}

function incomeByMonth(items) {
  const buckets = new Map();
  for (const item of items || []) {
    const date = item.createdAt ? new Date(item.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, roundCents((buckets.get(key) || 0) + Number(item.amount || 0)));
  }
  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, amount]) => ({ month, amount }));
}

module.exports = {
  TAX_YEAR,
  PRIMARY_REBATE,
  BRACKETS,
  estimateTax,
  incomeByMonth,
};
