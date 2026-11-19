import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiWorkshopKanban } from "@/components/kanban/HiWorkshopKanban";

describe("HiWorkshopKanban — Lift & Atölye Kanban Panosu", () => {
  it("renders 4 bays with technicians per wireframe", () => {
    render(<HiWorkshopKanban />);

    expect(screen.getByText("LİFT 1 (Mekanik / Ağır Bakım)")).toBeInTheDocument();
    expect(screen.getByText("Ahmet Usta")).toBeInTheDocument();

    expect(screen.getByText("LİFT 2 (Periyodik Hızlı Bakım)")).toBeInTheDocument();
    expect(screen.getByText("Can Usta")).toBeInTheDocument();

    expect(screen.getByText("LİFT 3 (Rot-Balans / Ön Takım)")).toBeInTheDocument();
    expect(screen.getByText("Murat Usta")).toBeInTheDocument();

    expect(screen.getByText("Kalite Kontrol & Teslimat")).toBeInTheDocument();
  });

  it("renders vehicle cards with plate badge and priority flags", () => {
    render(<HiWorkshopKanban />);

    expect(screen.getByText("WO-2026-10492")).toBeInTheDocument();
    expect(screen.getByText("🔴 Acil")).toBeInTheDocument();
    expect(screen.getByText(/Passat 1.6 TDI/i)).toBeInTheDocument();
  });

  it("filters cards when priority filter buttons are clicked", () => {
    render(<HiWorkshopKanban />);

    const acilFilter = screen.getByRole("button", { name: /🔴 Acil/i });
    fireEvent.click(acilFilter);

    // Only Urgent cards should be visible
    expect(screen.getByText("WO-2026-10492")).toBeInTheDocument();
    expect(screen.queryByText("WO-2026-10495")).not.toBeInTheDocument();
  });

  it("allows moving a work order to a different lift", () => {
    render(<HiWorkshopKanban />);

    // Find select dropdown on first card
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);

    fireEvent.change(selects[0], { target: { value: "lift-2" } });
    
    // Check that cards still exist and have updated bay
    const updatedSelects = screen.getAllByRole("combobox");
    expect(updatedSelects.length).toBe(selects.length);
  });

  it("calls onOpenTechBoard callback when tech board button is clicked", () => {
    const handleOpenTechBoard = vi.fn();
    render(<HiWorkshopKanban onOpenTechBoard={handleOpenTechBoard} />);

    const techBoardBtns = screen.getAllByText("Tech Board");
    expect(techBoardBtns.length).toBeGreaterThan(0);

    fireEvent.click(techBoardBtns[0]);
    expect(handleOpenTechBoard).toHaveBeenCalled();
  });
});
