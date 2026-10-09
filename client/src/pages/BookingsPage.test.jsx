import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BookingsPage from "./BookingsPage";

vi.mock("../api", () => ({
  myBookings: vi.fn(),
  listGigs: vi.fn(),
  confirmBooking: vi.fn(),
}));

vi.mock("../AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { confirmBooking, listGigs, myBookings } from "../api";
import { useAuth } from "../AuthContext";

const pending = {
  id: "b1",
  gigId: "gig1",
  amount: 250,
  status: "pending",
  createdAt: "2026-10-09T09:00:00.000Z",
};

describe("BookingsPage", () => {
  it("lets a client confirm a pending booking", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: { name: "Ada", role: "client" } });
    vi.mocked(listGigs).mockResolvedValue([{ id: "gig1", title: "Window cleaning" }]);
    vi.mocked(myBookings)
      .mockResolvedValueOnce([pending])
      .mockResolvedValueOnce([{ ...pending, status: "confirmed" }]);
    vi.mocked(confirmBooking).mockResolvedValue({ booking: { status: "confirmed" } });

    render(<BookingsPage />);

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm payment" }));
    expect(confirmBooking).toHaveBeenCalledWith("b1");
    expect(await screen.findByText("confirmed")).toBeInTheDocument();
  });

  it("does not show confirm payment to a freelancer", async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { name: "Mo", role: "freelancer" } });
    vi.mocked(listGigs).mockResolvedValue([{ id: "gig1", title: "Window cleaning" }]);
    vi.mocked(myBookings).mockResolvedValue([pending]);

    render(<BookingsPage />);

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm payment" })).not.toBeInTheDocument();
  });
});
