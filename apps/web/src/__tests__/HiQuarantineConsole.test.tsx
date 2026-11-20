import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HiQuarantineConsole } from "@/components/quarantine/HiQuarantineConsole";
import { apiClient } from "@/lib/api";
import { SectorProvider } from "@/lib/SectorContext";

describe("HiQuarantineConsole — Faz 3 Karantina Çakışma Hakemlik Konsolu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithSector = (ui: React.ReactElement) => {
    return render(<SectorProvider>{ui}</SectorProvider>);
  };

  it("renders header, offline simulator banner, and initial incidents", async () => {
    renderWithSector(<HiQuarantineConsole />);

    expect(
      screen.getByText(/Karantina Çakışma Yönetimi & Hakemlik Konsolu/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Karantina Çakışma Yönetimi/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bodrum Katına İn \(Çevrimdışı Simüle Et\)/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/WO-2026-10492/i)).toBeInTheDocument();
    });

    expect(screen.getByText("34 ABC 123")).toBeInTheDocument();
    expect(screen.getByText(/Çakışma: Ofis İptal vs Saha Tamamlandı/i)).toBeInTheDocument();
  });

  it("displays side-by-side comparison between office and field technician", async () => {
    renderWithSector(<HiQuarantineConsole />);

    await waitFor(() => {
      expect(screen.getByText(/1\. OFİS SERVİS DANIŞMANI/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. SAHA TEKNİSYENİ/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/İPTAL EDİLDİ \(Cancelled\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahmet Usta \(LIFT-1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bosch Ön Fren Balata Takımı/i)).toBeInTheDocument();
  });

  it("renders the 3 ergonomic arbitration action buttons", async () => {
    renderWithSector(<HiQuarantineConsole />);

    await waitFor(() => {
      expect(screen.getByText("SAHAYI ONAYLA")).toBeInTheDocument();
      expect(screen.getByText("OFİSİ KORU (İPTAL ET)")).toBeInTheDocument();
      expect(screen.getByText("MANUEL DÜZELT")).toBeInTheDocument();
    });
  });

  it("executes Sahayı Onayla arbitration and marks incident as resolved", async () => {
    const resolveSpy = vi.spyOn(apiClient, "resolveQuarantineIncident").mockResolvedValueOnce({
      success: true,
      message: "Saha durumu kabul edildi. İş emri tamamlandı olarak güncellendi.",
      incidentId: "mock-inc-1",
      resolutionStatus: "ResolvedByManager",
      newWorkOrderStatus: "Completed",
      resolvedAt: new Date().toISOString(),
    });

    renderWithSector(<HiQuarantineConsole />);

    await waitFor(() => {
      expect(screen.getByText("SAHAYI ONAYLA")).toBeInTheDocument();
    });

    const noteInput = screen.getByPlaceholderText(/Müşteri ile telefon görüşmesi yapıldı/i);
    fireEvent.change(noteInput, {
      target: { value: "Müşteri ile teyit edildi, usta işi tamamladı." },
    });

    const acceptClientBtn = screen.getByText("SAHAYI ONAYLA").closest("button")!;
    fireEvent.click(acceptClientBtn);

    await waitFor(() => {
      expect(resolveSpy).toHaveBeenCalledWith(
        "mock-inc-1",
        expect.objectContaining({
          resolutionAction: "AcceptClientState",
          managerNotes: "Müşteri ile teyit edildi, usta işi tamamladı.",
        })
      );
    });

    // Check resolution audit stamp
    await waitFor(() => {
      expect(screen.getByText(/Karar Uygulandı:/i)).toBeInTheDocument();
      expect(screen.getByText(/Saha Onaylandı \(Tamamlandı\)/i)).toBeInTheDocument();
    });
  });

  it("toggles the offline basement simulation mode", async () => {
    renderWithSector(<HiQuarantineConsole />);

    const offlineToggle = screen.getByText(/Bodrum Katına İn \(Çevrimdışı Simüle Et\)/i);
    fireEvent.click(offlineToggle);

    await waitFor(() => {
      expect(screen.getByText(/Bodrum Katı \/ Çevrimdışı Mod Aktif/i)).toBeInTheDocument();
      expect(screen.getByText(/Drift SQLite Kuyrukluyor/i)).toBeInTheDocument();
      expect(screen.getByText(/📡 Çevrimiçine Dön & Senkronize Et/i)).toBeInTheDocument();
    });

    // Return online
    const onlineToggle = screen.getByText(/📡 Çevrimiçine Dön & Senkronize Et/i);
    fireEvent.click(onlineToggle);

    await waitFor(() => {
      expect(screen.getByText(/Saha Cihazları Çevrimiçi/i)).toBeInTheDocument();
    });
  });

  it("handles simulating a conflict through the button", async () => {
    const simSpy = vi.spyOn(apiClient, "simulateQuarantineConflict").mockResolvedValueOnce({
      success: true,
      message: "Simülasyon Çakışması Başarıyla Tetiklendi!",
      workOrderId: "wo-sim-123",
      workOrderNumber: "WO-SIM-88888",
      quarantineIncidentId: "inc-sim-123",
      status: "QuarantineReview",
    });

    renderWithSector(<HiQuarantineConsole />);

    const simBtn = screen.getByText("Çakışma Simüle Et");
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(simSpy).toHaveBeenCalled();
    });
  });
});
