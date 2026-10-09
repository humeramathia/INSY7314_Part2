import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GigCard from "./GigCard";

describe("GigCard", () => {
  it("shows title, category, and price", () => {
    render(<GigCard title="Window cleaning" category="Cleaning" price={250} onView={() => {}} />);
    expect(screen.getByRole("heading", { name: "Window cleaning" })).toBeInTheDocument();
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.getByText("R 250.00")).toBeInTheDocument();
  });

  it("calls onView when View is clicked", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    render(<GigCard title="Window cleaning" category="Cleaning" price={250} onView={onView} />);
    await user.click(screen.getByRole("button", { name: "View" }));
    expect(onView).toHaveBeenCalledTimes(1);
  });
});
