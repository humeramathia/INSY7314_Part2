import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";

const register = vi.fn();

vi.mock("../AuthContext", () => ({
  useAuth: () => ({ register }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    register.mockReset();
  });

  it("only offers client and freelancer roles", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const role = screen.getByLabelText("Role");
    expect(role).toHaveValue("client");
    expect(screen.getByRole("option", { name: "Client" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Freelancer" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("submits registration including the chosen role", async () => {
    const user = userEvent.setup();
    register.mockResolvedValue({ role: "freelancer" });
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Mo Freelancer" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "mo@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Password1!" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "freelancer" } });
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(register).toHaveBeenCalledWith({
      name: "Mo Freelancer",
      email: "mo@test.com",
      password: "Password1!",
      role: "freelancer",
    });
  });
});
