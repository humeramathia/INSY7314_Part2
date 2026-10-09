import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookingsPage from "./BookingsPage";

vi.mock("../api", () => ({
  myBookings: vi.fn(),
  listGigs: vi.fn(),
  confirmBooking: vi.fn(),
}));

vi.mock("../AuthContext", () => ({
  useAuth: () => ({ user: { name: "Ada", role: "client" } }),
}));

import { listGigs, myBookings } from "../api";

describe("BookingsPage empty state", () => {
  it("tells a client when nothing is booked yet", async () => {
    vi.mocked(myBookings).mockResolvedValue([]);
    vi.mocked(listGigs).mockResolvedValue([]);
    render(<BookingsPage />);
    expect(await screen.findByText("No bookings yet")).toBeInTheDocument();
  });
});
