import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Layout from "./Layout";

function renderNav(user) {
  const onLogout = vi.fn();
  render(
    <MemoryRouter>
      <Layout user={user} onLogout={onLogout}>
        <p>Page body</p>
      </Layout>
    </MemoryRouter>
  );
  return onLogout;
}

describe("Layout", () => {
  it("shows guest links when logged out", () => {
    renderNav(null);
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });

  it("shows client bookings and hides freelancer tools", () => {
    renderNav({ name: "Ada", role: "client" });
    expect(screen.getByRole("link", { name: "My bookings" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Income" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Admin gigs" })).not.toBeInTheDocument();
  });

  it("shows freelancer marketplace tools", () => {
    renderNav({ name: "Mo", role: "freelancer" });
    expect(screen.getByRole("link", { name: "My gigs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New gig" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bookings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Income" })).toBeInTheDocument();
  });

  it("shows admin gigs and logs out on click", async () => {
    const user = userEvent.setup();
    const onLogout = renderNav({ name: "Imraan", role: "admin" });
    expect(screen.getByRole("link", { name: "Admin gigs" })).toBeInTheDocument();
    expect(screen.getByText(/Signed in as/)).toHaveTextContent("admin");
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
