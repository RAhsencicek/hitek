import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiTechBoard } from "@/components/techboard/HiTechBoard";

describe("HiTechBoard — Teknisyen Mobil Arayüzü & İşçilik Sayacı", () => {
  it("renders technician header and assigned vehicle per Ekran 2 wireframe", () => {
    render(<HiTechBoard />);

    expect(screen.getByText("👨‍🔧 Ahmet Usta")).toBeInTheDocument();
    expect(screen.getByText(/Maslak Merkez • LİFT 1/i)).toBeInTheDocument();
    expect(screen.getByText("Volkswagen Passat 1.6 TDI (2018)")).toBeInTheDocument();
    expect(screen.getByText("#WO-10492")).toBeInTheDocument();
  });

  it("displays live labor timer and toggles pause/resume", () => {
    render(<HiTechBoard />);

    // Initially timer is running with "⏸️ Mola / Duraklat"
    expect(screen.getByText(/AKTİF İŞÇİLİK SAYAÇ/i)).toBeInTheDocument();
    const pauseBtn = screen.getByText(/⏸️ Mola \/ Duraklat/i);
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);

    // After click, toggles to "▶️ İşe Devam Et / Başla"
    expect(screen.getByText(/▶️ İşe Devam Et \/ Başla/i)).toBeInTheDocument();
  });

  it("renders operations checklist and toggles checkmark on click", () => {
    render(<HiTechBoard />);

    const oilItem = screen.getByText("4 Litre 5W-30 Motor Yağı & Filtre Değişimi");
    expect(oilItem).toBeInTheDocument();

    const oilBtn = oilItem.closest("button");
    expect(oilBtn).toBeTruthy();

    if (oilBtn) {
      fireEvent.click(oilBtn);
      // Item is marked as done
      expect(oilBtn.className).toContain("line-through");
    }
  });

  it("simulates voice dictation with Whisper AI on sticky bar", () => {
    vi.useFakeTimers();
    render(<HiTechBoard />);

    const dictationBtn = screen.getByText(/🎙️ Dikte/i);
    fireEvent.click(dictationBtn);

    expect(screen.getByText(/Dinliyor.../i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(screen.getByText(/Sesli Not Kaydedildi/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("simulates photo capture on sticky bar", () => {
    vi.useFakeTimers();
    render(<HiTechBoard />);

    const photoBtn = screen.getByText(/📸 Fotoğraf/i);
    fireEvent.click(photoBtn);

    expect(screen.getByText(/Çekiliyor.../i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByText(/İşçilik kanıt fotoğrafı eklendi/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("marks work order complete when Tamamla button is clicked", () => {
    render(<HiTechBoard />);

    const completeBtn = screen.getByText("✅ Tamamla");
    fireEvent.click(completeBtn);

    expect(screen.getByText(/İş Emri Ahmet Usta Tarafından Tamamlandı/i)).toBeInTheDocument();
  });
});
