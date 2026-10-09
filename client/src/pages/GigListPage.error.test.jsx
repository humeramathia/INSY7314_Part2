import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import GigListPage from "./GigListPage";

vi.mock("../api", () => ({
  listGigs: vi.fn(),
}));

import { listGigs } from "../api";

describe("GigListPage errors", () => {
  it("shows an API failure without leaking internals", async () => {
    vi.mocked(listGigs).mockRejectedValue(new Error("Could not reach the API. Is https://localhost:3000 running?"));
    render(
      <MemoryRouter>
        <GigListPage />
      </MemoryRouter>
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the API");
  });
});
