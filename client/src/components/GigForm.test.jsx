import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GigForm from "./GigForm";

describe("GigForm", () => {
  it("sends numeric price with the listing fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<GigForm onSubmit={onSubmit} error="" loading={false} submitLabel="Publish gig" />);

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Window cleaning" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Deep clean interior and exterior windows." },
    });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Cleaning" } });
    fireEvent.change(screen.getByLabelText("Price (R)"), { target: { value: "250" } });
    await user.click(screen.getByRole("button", { name: "Publish gig" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Window cleaning",
      description: "Deep clean interior and exterior windows.",
      category: "Cleaning",
      price: 250,
    });
  });
});
