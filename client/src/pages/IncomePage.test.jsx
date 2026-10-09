import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IncomePage from "./IncomePage";

vi.mock("../api", () => ({
  myTransactions: vi.fn(),
  listGigs: vi.fn(),
}));

import { listGigs, myTransactions } from "../api";

describe("IncomePage", () => {
  it("renders total income from confirmed bookings", async () => {
    vi.mocked(listGigs).mockResolvedValue([{ id: "gig1", title: "Window cleaning" }]);
    vi.mocked(myTransactions).mockResolvedValue({
      totalIncome: 250,
      items: [
        {
          id: "t1",
          gigId: "gig1",
          amount: 250,
          createdAt: "2026-10-09T09:00:00.000Z",
        },
      ],
    });

    render(<IncomePage />);

    expect(await screen.findByRole("heading", { name: "Income" })).toBeInTheDocument();
    expect(screen.getAllByText("R 250.00").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
  });
});
