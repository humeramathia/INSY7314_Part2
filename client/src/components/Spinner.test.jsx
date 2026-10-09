import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("announces the loading label", () => {
    render(<Spinner label="Loading bookings" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading bookings");
  });
});
