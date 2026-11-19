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

  it("updates fields when demo preset buttons are clicked", () => {
    render(<HiVehicleIntakeForm />);

    // Click on Megane demo preset
    const meganeBtn = screen.getByText("06 BCD 456 (Megane)");
    fireEvent.click(meganeBtn);

    expect(screen.getByDisplayValue("06 BCD 456")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Renault")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Megane 1.5 Blue dCi Icon")).toBeInTheDocument();

    // Click on New Vehicle preset
    const newVehicleBtn = screen.getByText("35 CDE 789 (Yeni Araç)");
    fireEvent.click(newVehicleBtn);

    expect(screen.getByDisplayValue("35 CDE 789")).toBeInTheDocument();
    expect(screen.getByText("Yeni Araç Kaydı")).toBeInTheDocument();
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
