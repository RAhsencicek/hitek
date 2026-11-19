import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiDamageInspection, DamageMarker } from "@/components/ui/HiDamageInspection";

describe("HiDamageInspection — 2D Kaporta Hasar Şeması", () => {
  const initialMarkers: DamageMarker[] = [
    {
      id: "dmg-1",
      zone: "FrontBumper",
      zoneName: "Ön Tampon",
      damageType: "scratch",
      xPercent: 50,
      yPercent: 10,
      notes: "Taş izi",
    },
  ];

  it("renders vehicle inspection component with initial markers", () => {
    render(<HiDamageInspection markers={initialMarkers} />);

    expect(screen.getByText("2D İnteraktif Kaporta Hasar Şeması")).toBeInTheDocument();
    expect(screen.getByText("1 Hasar Pini")).toBeInTheDocument();
    expect(screen.getAllByText("Ön Tampon").length).toBeGreaterThanOrEqual(1);
  });

  it("displays damage type selector with scratch, dent, and repaint", () => {
    render(<HiDamageInspection markers={[]} />);

    expect(screen.getByText("Çizik")).toBeInTheDocument();
    expect(screen.getByText("Göçük / Kırık")).toBeInTheDocument();
    expect(screen.getByText("Boyalı / Değişen")).toBeInTheDocument();
  });

  it("allows selecting damage type and triggers change on diagram click", () => {
    const handleChange = vi.fn();
    render(<HiDamageInspection markers={[]} onChange={handleChange} />);

    // Select Çizik (scratch)
    const scratchBtn = screen.getByText("Çizik");
    fireEvent.click(scratchBtn);

    // Click on diagram (find by directional text '▲ ÖN (FRONT)')
    const frontText = screen.getByText("▲ ÖN (FRONT)");
    const diagramContainer = frontText.parentElement;
    expect(diagramContainer).toBeTruthy();

    if (diagramContainer) {
      fireEvent.click(diagramContainer, { clientX: 100, clientY: 50 });
      expect(handleChange).toHaveBeenCalled();
    }
  });

  it("opens mandatory photo modal when dent (🔴) is selected and diagram is clicked", () => {
    const handleChange = vi.fn();
    render(<HiDamageInspection markers={[]} onChange={handleChange} />);

    // Select Göçük / Kırık
    const dentBtn = screen.getByText("Göçük / Kırık");
    fireEvent.click(dentBtn);

    const frontText = screen.getByText("▲ ÖN (FRONT)");
    const diagramContainer = frontText.parentElement;
    expect(diagramContainer).toBeTruthy();

    if (diagramContainer) {
      fireEvent.click(diagramContainer, { clientX: 100, clientY: 50 });
      // Mandatory photo modal should open per Section 4 of spec
      expect(screen.getByText(/Zorunlu Hasar Fotoğrafı/i)).toBeInTheDocument();
    }
  });

  it("calls onChange to remove marker when delete button is clicked", () => {
    const handleChange = vi.fn();
    render(<HiDamageInspection markers={initialMarkers} onChange={handleChange} />);

    const deleteBtn = screen.getByRole("button", { name: "Sil" });
    fireEvent.click(deleteBtn);

    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
