import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HiSealedLabelModal } from "@/components/warehouse/HiSealedLabelModal";
import { AllocatePartResponse } from "@/lib/api";

describe("HiSealedLabelModal — 50mm x 30mm Termal Mühür Etiketi Modalı", () => {
  const mockLabelData: AllocatePartResponse = {
    partRequestId: "req-1",
    workOrderId: "wo-10492",
    workOrderNumber: "WO-2026-10492",
    plate: "34 ABC 123",
    vin: "WVWZZZ3CZWE104921",
    partName: "Bosch Ön Fren Balata Takımı",
    partSku: "4047024185242",
    internalSealedQr: "HS-WO10492-P01",
    escPosPayloadBase64: "G0BhAUhpU2VydmlzIEFJ...",
    escPosCommandsHex: "1B401B61014869536572766973...",
    thermalLabelText: [
      "┌────────────────────────────────────────────────────────┐",
      "│  HiServis AI  •  Maslak Atatürk Oto Sanayi Şubesi      │",
      "│  İŞ EMRİ: #WO-2026-10492                               │",
      "│  PLAKA: 34 ABC 123        USTA: Ahmet Usta (LİFT 1)   │",
      "│  ŞASE:  WVWZZZ3CZWE104921                              │",
      "│  PARÇA: Bosch Ön Fren Balata Takımı (4047024185242)   │",
      "│  ┌──────────┐                                          │",
      "│  │ [QR KOD] │  MÜHÜR TOKENI: HS-WO10492-P01           │",
      "│  │          │  TARİH: 18.11.2026 14:35                 │",
      "│  └──────────┘                                          │",
      "└────────────────────────────────────────────────────────┘",
    ].join("\n"),
    allocatedAt: "2026-11-18T14:35:00Z",
    message: "Parça '34 ABC 123' plakalı araca tahsis edildi. Termal mühür etiketi basıldı.",
  };

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <HiSealedLabelModal isOpen={false} onClose={() => {}} labelData={mockLabelData} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders 50mm x 30mm thermal label contents correctly", () => {
    render(<HiSealedLabelModal isOpen={true} onClose={() => {}} labelData={mockLabelData} />);

    expect(screen.getByText(/Termal Mühür Etiketi \(50mm x 30mm\)/i)).toBeInTheDocument();
    expect(screen.getByText("#WO-2026-10492")).toBeInTheDocument();
    expect(screen.getByText("34 ABC 123")).toBeInTheDocument();
    expect(screen.getByText("WVWZZZ3CZWE104921")).toBeInTheDocument();
    expect(screen.getByText("Bosch Ön Fren Balata Takımı")).toBeInTheDocument();
    expect(screen.getByText("HS-WO10492-P01")).toBeInTheDocument();
    expect(screen.getByText(/Termal Yazıcıya Gönderildi/i)).toBeInTheDocument();
  });

  it("copies ESC/POS hex data when button is clicked", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<HiSealedLabelModal isOpen={true} onClose={() => {}} labelData={mockLabelData} />);

    const copyBtn = screen.getByText(/ESC\/POS Kodu Kopyala/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(mockLabelData.escPosCommandsHex);
    expect(screen.getByText("Kopyalandı!")).toBeInTheDocument();
  });

  it("calls onClose when Tamam / Kapat is clicked", () => {
    const onCloseMock = vi.fn();
    render(<HiSealedLabelModal isOpen={true} onClose={onCloseMock} labelData={mockLabelData} />);

    const closeBtn = screen.getByText("Tamam / Kapat");
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
