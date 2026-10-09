import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MyGigsPage from "./MyGigsPage";

vi.mock("../api", () => ({
  myGigs: vi.fn(),
  deleteGig: vi.fn(),
}));

import { deleteGig, myGigs } from "../api";

describe("MyGigsPage", () => {
  it("lists owned gigs and deletes one", async () => {
    const user = userEvent.setup();
    vi.mocked(myGigs)
      .mockResolvedValueOnce([
        { id: "gig1", title: "Window cleaning", category: "Cleaning", price: 250 },
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(deleteGig).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <MyGigsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteGig).toHaveBeenCalledWith("gig1");
    expect(await screen.findByText("No gigs yet")).toBeInTheDocument();
  });

  it("opens the new gig screen", async () => {
    const user = userEvent.setup();
    vi.mocked(myGigs).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/gigs/mine"]}>
        <Routes>
          <Route path="/gigs/mine" element={<MyGigsPage />} />
          <Route path="/gigs/new" element={<p>New gig form</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("No gigs yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "New gig" }));
    expect(screen.getByText("New gig form")).toBeInTheDocument();
  });
});
