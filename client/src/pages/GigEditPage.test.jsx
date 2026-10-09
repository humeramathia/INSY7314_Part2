import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GigEditPage from "./GigEditPage";

vi.mock("../api", () => ({
  getGig: vi.fn(),
  updateGig: vi.fn(),
}));

import { getGig, updateGig } from "../api";

describe("GigEditPage", () => {
  it("loads a gig and saves changes", async () => {
    const user = userEvent.setup();
    vi.mocked(getGig).mockResolvedValue({
      id: "gig1",
      title: "Window cleaning",
      description: "Deep clean windows",
      category: "Cleaning",
      price: 250,
    });
    vi.mocked(updateGig).mockResolvedValue({ id: "gig1" });

    render(
      <MemoryRouter initialEntries={["/gigs/gig1/edit"]}>
        <Routes>
          <Route path="/gigs/:id/edit" element={<GigEditPage />} />
          <Route path="/gigs/mine" element={<p>My gigs</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("Window cleaning")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Window cleaning plus" } });
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateGig).toHaveBeenCalledWith("gig1", expect.objectContaining({
      title: "Window cleaning plus",
      price: 250,
    }));
    expect(await screen.findByText("My gigs")).toBeInTheDocument();
  });
});
