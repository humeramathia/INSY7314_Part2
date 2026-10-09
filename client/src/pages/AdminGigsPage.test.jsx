import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminGigsPage from "./AdminGigsPage";

vi.mock("../api", () => ({
  adminGigs: vi.fn(),
}));

import { adminGigs } from "../api";

describe("AdminGigsPage", () => {
  it("renders every gig from the admin endpoint", async () => {
    vi.mocked(adminGigs).mockResolvedValue([
      { id: "gig1", title: "Window cleaning", category: "Cleaning", price: 250 },
    ]);

    render(
      <MemoryRouter>
        <AdminGigsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "All gigs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
  });
});
