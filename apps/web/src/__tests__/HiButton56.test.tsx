import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HiButton56 } from "@/components/ui/HiButton56";
import React from "react";

describe("HiButton56", () => {
  it("renders with touch-first 56px height class by default", () => {
    render(<HiButton56>RUHSAT ÇEK</HiButton56>);
    const button = screen.getByRole("button", { name: /ruhsat çek/i });
    expect(button.className).toContain("h-14");
    expect(button.className).toContain("min-h-[56px]");
  });

  it("triggers click event when clicked", () => {
    const handleClick = vi.fn();
    render(<HiButton56 onClick={handleClick}>KAYDET</HiButton56>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger click when disabled or loading", () => {
    const handleClick = vi.fn();
    render(
      <HiButton56 disabled onClick={handleClick}>
        ENGELLE
      </HiButton56>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders danger variant with red background", () => {
    render(<HiButton56 variant="danger">İŞÇİLİĞİ DURDUR</HiButton56>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-[#DC2626]");
  });
});
