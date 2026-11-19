import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import React from "react";

describe("HiPlateBadge", () => {
  it("renders TR country band and plate number in uppercase", () => {
    render(<HiPlateBadge plate="34 abc 123" />);

    expect(screen.getByText("TR")).toBeDefined();
    expect(screen.getByText("34 ABC 123")).toBeDefined();
  });

  it("has accessible aria label for screen readers", () => {
    render(<HiPlateBadge plate="06 bcd 456" />);

    const badge = screen.getByRole("img");
    expect(badge.getAttribute("aria-label")).toBe("Araç Plakası: 06 BCD 456");
  });

  it("applies hero size correctly", () => {
    const { container } = render(<HiPlateBadge plate="35 XYZ 789" size="hero" />);
    const plateElement = container.querySelector("[role='img']");
    expect(plateElement?.className).toContain("h-14");
  });

  it("normalizes unspaced plate inputs into standard Turkish plate format", () => {
    render(<HiPlateBadge plate="34abc123" />);
    expect(screen.getByText("34 ABC 123")).toBeDefined();
  });

  it("provides fallback plate and matching aria label when plate is empty", () => {
    render(<HiPlateBadge plate="" />);
    const badge = screen.getByRole("img");
    expect(screen.getByText("34 ABC 123")).toBeDefined();
    expect(badge.getAttribute("aria-label")).toBe("Araç Plakası: 34 ABC 123");
  });
});
