import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IncomePage from "./IncomePage";

vi.mock("../api", () => ({
  myTransactions: vi.fn(),
  listGigs: vi.fn(),
}));

import { listGigs, myTransactions } from "../api";

describe("IncomePage empty state", () => {
  it("shows zero income when there are no confirmed bookings", async () => {
    vi.mocked(listGigs).mockResolvedValue([]);
    vi.mocked(myTransactions).mockResolvedValue({
      items: [],
      totalIncome: 0,
      tax: { estimatedTax: 0, netIncome: 0, taxYear: "2025/26", method: "SARS.", disclaimer: "Estimate only." },
      byMonth: [],
    });
    render(<IncomePage />);
    expect(await screen.findByText("No payments yet")).toBeInTheDocument();
    expect(screen.getAllByText("R 0.00").length).toBeGreaterThan(0);
  });
});
