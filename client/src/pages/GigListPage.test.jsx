import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GigListPage from "./GigListPage";

vi.mock("../api", () => ({
  listGigs: vi.fn(),
}));

import { listGigs } from "../api";

describe("GigListPage", () => {
  it("renders gigs from the API and opens a listing", async () => {
    const user = userEvent.setup();
    vi.mocked(listGigs).mockResolvedValue([
      { id: "gig1", title: "Window cleaning", category: "Cleaning", price: 250 },
    ]);

    render(
      <MemoryRouter initialEntries={["/gigs"]}>
        <Routes>
          <Route path="/gigs" element={<GigListPage />} />
          <Route path="/gigs/:id" element={<p>Gig detail gig1</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    expect(screen.getByText("R 250.00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByText("Gig detail gig1")).toBeInTheDocument();
  });

  it("shows an empty state when there are no listings", async () => {
    vi.mocked(listGigs).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <GigListPage />
      </MemoryRouter>
    );
    expect(await screen.findByText("No gigs yet")).toBeInTheDocument();
  });
});
