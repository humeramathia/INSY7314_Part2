import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "./AuthContext";

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login screen</p>} />
        <Route
          path="/income"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <p>Income screen</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("shows a session spinner until auth is ready", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, ready: false });
    renderAt("/income");
    expect(screen.getByText("Checking session")).toBeInTheDocument();
  });

  it("sends guests to login", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, ready: true });
    renderAt("/income");
    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("blocks the wrong role", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { name: "Ada", role: "client" },
      ready: true,
    });
    renderAt("/income");
    expect(screen.getByRole("alert")).toHaveTextContent("You do not have access to this page.");
    expect(screen.queryByText("Income screen")).not.toBeInTheDocument();
  });

  it("renders children for an allowed role", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { name: "Mo", role: "freelancer" },
      ready: true,
    });
    renderAt("/income");
    expect(screen.getByText("Income screen")).toBeInTheDocument();
  });
});
