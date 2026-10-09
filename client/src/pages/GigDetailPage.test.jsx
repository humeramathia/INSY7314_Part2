import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GigDetailPage from "./GigDetailPage";

vi.mock("../api", () => ({
  getGig: vi.fn(),
  createBooking: vi.fn(),
}));

vi.mock("../AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { createBooking, getGig } from "../api";
import { useAuth } from "../AuthContext";

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/gigs/gig1"]}>
      <Routes>
        <Route path="/gigs/:id" element={<GigDetailPage />} />
        <Route path="/bookings" element={<p>My bookings</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GigDetailPage", () => {
  it("lets a client book and then opens bookings", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ user: { name: "Ada", role: "client" } });
    vi.mocked(getGig).mockResolvedValue({
      id: "gig1",
      title: "Window cleaning",
      description: "Deep clean windows",
      category: "Cleaning",
      price: 250,
    });
    vi.mocked(createBooking).mockResolvedValue({ id: "b1", status: "pending" });

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book" }));
    expect(createBooking).toHaveBeenCalledWith("gig1");
    expect(await screen.findByText("My bookings")).toBeInTheDocument();
  });

  it("hides the book button when the user is not a client", async () => {
    vi.mocked(useAuth).mockReturnValue({ user: { name: "Mo", role: "freelancer" } });
    vi.mocked(getGig).mockResolvedValue({
      id: "gig1",
      title: "Window cleaning",
      description: "Deep clean windows",
      category: "Cleaning",
      price: 250,
    });

    renderDetail();

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Book" })).not.toBeInTheDocument();
    expect(screen.getByText("Sign in as a client to book.")).toBeInTheDocument();
  });
});
