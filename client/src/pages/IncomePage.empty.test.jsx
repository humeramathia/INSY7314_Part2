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
    vi.mocked(myTransactions).mockResolvedValue({ items: [], totalIncome: 0 });
    render(<IncomePage />);
    expect(await screen.findByText("No payments yet")).toBeInTheDocument();
    expect(screen.getByText("R 0.00")).toBeInTheDocument();
  });
});
