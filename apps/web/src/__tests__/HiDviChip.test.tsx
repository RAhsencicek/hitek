import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HiDviChip } from "@/components/ui/HiDviChip";
import React from "react";

describe("HiDviChip", () => {
  it("renders all 3 inspection status options", () => {
    render(<HiDviChip title="Ön Fren Balataları" />);

    expect(screen.getByText("Ön Fren Balataları")).toBeDefined();
    expect(screen.getByText("SORUNSUZ")).toBeDefined();
    expect(screen.getByText("TAKİP ET")).toBeDefined();
    expect(screen.getByText("ACİL DEĞİŞ")).toBeDefined();
  });

  it("indicates mandatory photo requirement on fail option", () => {
    render(<HiDviChip value="fail" />);
    expect(screen.getByText("Foto Zorunlu")).toBeDefined();
  });

  it("calls onChange callback when an option is selected", () => {
    const handleChange = vi.fn();
    render(<HiDviChip value="pass" onChange={handleChange} />);

    fireEvent.click(screen.getByText("ACİL DEĞİŞ"));
    expect(handleChange).toHaveBeenCalledWith("fail");

    fireEvent.click(screen.getByText("TAKİP ET"));
    expect(handleChange).toHaveBeenCalledWith("warning");
  });
});
