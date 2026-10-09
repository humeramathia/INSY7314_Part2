import { describe, expect, it } from "vitest";
import { formatDate, formatPrice } from "./format";

describe("formatPrice", () => {
  it("renders rand values with two decimal places", () => {
    expect(formatPrice(250)).toBe("R 250.00");
    expect(formatPrice("80")).toBe("R 80.00");
  });
});

describe("formatDate", () => {
  it("returns an empty string for missing values", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null)).toBe("");
  });

  it("formats a valid ISO date for South Africa", () => {
    expect(formatDate("2026-10-09T09:00:00.000Z")).toMatch(/2026/);
  });
});
