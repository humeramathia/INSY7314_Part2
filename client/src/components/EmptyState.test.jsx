import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and message", () => {
    render(<EmptyState title="No gigs yet" message="Publish a service first." />);
    expect(screen.getByRole("heading", { name: "No gigs yet" })).toBeInTheDocument();
    expect(screen.getByText("Publish a service first.")).toBeInTheDocument();
  });

  it("runs the action when the button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState title="No gigs yet" message="Publish a service first." actionLabel="New gig" onAction={onAction} />
    );
    await user.click(screen.getByRole("button", { name: "New gig" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
