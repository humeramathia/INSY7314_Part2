import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";

const login = vi.fn();

vi.mock("../AuthContext", () => ({
  useAuth: () => ({ login }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    login.mockReset();
  });

  it("renders the sign-in form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("submits email and password to login", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ role: "client" });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Email"), "ada@test.com");
    await user.type(screen.getByLabelText("Password"), "Password1!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(login).toHaveBeenCalledWith({
      email: "ada@test.com",
      password: "Password1!",
    });
  });

  it("shows an API error without exposing a token", async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new Error("Invalid email or password"));
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Email"), "ada@test.com");
    await user.type(screen.getByLabelText("Password"), "WrongPass1!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
