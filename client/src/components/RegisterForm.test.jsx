import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RegisterForm from "./RegisterForm";

describe("RegisterForm", () => {
  it("does not offer an admin role", () => {
    render(<RegisterForm onSubmit={() => {}} error="" loading={false} />);
    expect(screen.queryByRole("option", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("submits client or freelancer details", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} error="" loading={false} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "client" } });
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@test.com",
      password: "Password1!",
      role: "client",
    });
  });
});
