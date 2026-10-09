import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  login: vi.fn(),
  me: vi.fn(),
  register: vi.fn(),
}));

import { getToken, login, me, setToken } from "./api";
import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { user, ready, login: doLogin, logout } = useAuth();
  return (
    <div>
      <p>ready:{String(ready)}</p>
      <p>user:{user ? user.name : "none"}</p>
      <button type="button" onClick={() => doLogin({ email: "ada@test.com", password: "Password1!" })}>
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue(null);
    vi.mocked(setToken).mockReset();
    vi.mocked(login).mockReset();
    vi.mocked(me).mockReset();
  });

  it("is ready with no user when there is no token", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("ready:true")).toBeInTheDocument();
    });
    expect(screen.getByText("user:none")).toBeInTheDocument();
  });

  it("stores the JWT and profile after login", async () => {
    vi.mocked(login).mockResolvedValue({ token: "jwt-token" });
    vi.mocked(me).mockResolvedValue({ name: "Ada", role: "client" });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    screen.getByRole("button", { name: "Login" }).click();

    await waitFor(() => {
      expect(screen.getByText("user:Ada")).toBeInTheDocument();
    });
    expect(setToken).toHaveBeenCalledWith("jwt-token");
  });
});
