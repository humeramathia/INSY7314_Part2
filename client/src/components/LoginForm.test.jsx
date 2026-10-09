import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  it("submits the typed email and password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} error="" loading={false} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "ada@test.com",
      password: "Password1!",
    });
  });

  it("disables the button while loading", () => {
    render(<LoginForm onSubmit={() => {}} error="" loading />);
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  });
});
