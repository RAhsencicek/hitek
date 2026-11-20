import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiVehicleIntakeForm } from "@/components/intake/HiVehicleIntakeForm";

describe("HiVehicleIntakeForm — Hızlı Araç Kabul & İş Emri", () => {
  it("renders rapid vehicle intake form with plate badge and fields", () => {
    render(<HiVehicleIntakeForm />);

    expect(screen.getByText("Hızlı Araç Kabul & İş Emri Girişi")).toBeInTheDocument();
    expect(screen.getByText(/Kameradan Plaka Tara/i)).toBeInTheDocument();
    expect(screen.getByText(/Ruhsat OCR & TSB Doldur/i)).toBeInTheDocument();
    expect(screen.getByText(/KABULÜ TAMAMLA & LİFTE SEVK ET/i)).toBeInTheDocument();
  });

  it("updates fields when user types plate and info", () => {
    render(<HiVehicleIntakeForm />);

    const plateInput = screen.getByPlaceholderText("34 ABC 123");
    fireEvent.change(plateInput, { target: { value: "34 IST 999" } });
    expect(plateInput).toHaveValue("34 IST 999");
  });

  it("simulates plate camera scanner with < 300ms feedback", async () => {
    vi.useFakeTimers();
    render(<HiVehicleIntakeForm />);

    const scanBtn = screen.getByText("Kameradan Plaka Tara");
    fireEvent.click(scanBtn);

    expect(screen.getByText("Okunuyor (<300ms)...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByDisplayValue("34 ABC 123")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("toggles dev numpad when numpad button is clicked", () => {
    render(<HiVehicleIntakeForm />);

    const numpadBtn = screen.getByText("Dev Numpad");
    fireEvent.click(numpadBtn);

    expect(screen.getByText("Dokunmatik Kilometre Girişi")).toBeInTheDocument();
  });

  it("submits intake and opens receipt modal", () => {
    render(<HiVehicleIntakeForm />);

    const submitBtn = screen.getByText(/KABULÜ TAMAMLA & LİFTE SEVK ET/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText("Araç Kabul Fişi Oluşturuldu")).toBeInTheDocument();
    expect(screen.getByText("HIZLI ARAÇ KABUL FİŞİ")).toBeInTheDocument();
  });
});
