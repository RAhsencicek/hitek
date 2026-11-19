import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HiNumpad } from "@/components/ui/HiNumpad";
import React from "react";

describe("HiNumpad", () => {
  it("renders with initial KM value and unit", () => {
    render(<HiNumpad initialValue={145200} unit="KM" />);
    expect(screen.getByText("145.200 KM")).toBeDefined();
  });

  it("handles key presses and updates display", () => {
    render(<HiNumpad initialValue="" unit="KM" />);

    // Press '5', then '0', then '0'
    fireEvent.click(screen.getByText("5"));
    fireEvent.click(screen.getByText("0"));
    fireEvent.click(screen.getByText("0"));

    expect(screen.getByText("500 KM")).toBeDefined();
  });

  it("clears display on 'C' button press", () => {
    render(<HiNumpad initialValue={50000} unit="KM" />);
    expect(screen.getByText("50.000 KM")).toBeDefined();

    fireEvent.click(screen.getByText("C"));
    expect(screen.getByText("0 KM")).toBeDefined();
  });

  it("calls onConfirm with parsed number and formatted string", () => {
    const handleConfirm = vi.fn();
    render(<HiNumpad initialValue={12345} unit="KM" onConfirm={handleConfirm} />);

    fireEvent.click(screen.getByText("KİLOMETREYİ KAYDET"));
    expect(handleConfirm).toHaveBeenCalledWith(12345, "12.345 KM");
  });
});
