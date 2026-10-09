import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorBanner from "./ErrorBanner";

describe("ErrorBanner", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes the message as an alert", () => {
    render(<ErrorBanner message="Invalid email or password" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
