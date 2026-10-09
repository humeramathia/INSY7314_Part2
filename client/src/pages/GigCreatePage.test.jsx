import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GigCreatePage from "./GigCreatePage";

vi.mock("../api", () => ({
  createGig: vi.fn(),
}));

import { createGig } from "../api";

describe("GigCreatePage", () => {
  it("publishes a gig with the form fields", async () => {
    const user = userEvent.setup();
    vi.mocked(createGig).mockResolvedValue({ id: "gig1" });

    render(
      <MemoryRouter initialEntries={["/gigs/new"]}>
        <Routes>
          <Route path="/gigs/new" element={<GigCreatePage />} />
          <Route path="/gigs/mine" element={<p>My gigs</p>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Window cleaning" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Deep clean interior and exterior windows." },
    });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Cleaning" } });
    fireEvent.change(screen.getByLabelText("Price (R)"), { target: { value: "250" } });
    await user.click(screen.getByRole("button", { name: "Publish gig" }));

    expect(createGig).toHaveBeenCalledWith({
      title: "Window cleaning",
      description: "Deep clean interior and exterior windows.",
      category: "Cleaning",
      price: 250,
    });
    expect(await screen.findByText("My gigs")).toBeInTheDocument();
  });
});
