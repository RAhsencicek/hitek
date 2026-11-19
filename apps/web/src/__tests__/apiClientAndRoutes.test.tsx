import { describe, it, expect } from "vitest";
import { apiClient } from "@/lib/api";

describe("apiClient — Hızlı Araç Kabul & Atölye API İstemcisi", () => {
  it("looks up known asset from fallback / mock when API is offline", async () => {
    const passat = await apiClient.lookupAsset("34 ABC 123");
    expect(passat.found).toBe(true);
    expect(passat.asset?.brand).toBe("Volkswagen");
    expect(passat.asset?.model).toBe("Passat 1.6 TDI Comfortline");
    expect(passat.recentWorkOrders.length).toBeGreaterThan(0);
  });

  it("returns found: false for unregistered vehicle", async () => {
    const unknown = await apiClient.lookupAsset("99 XYZ 999");
    expect(unknown.found).toBe(false);
    expect(unknown.totalOutstandingBalance).toBe(0);
  });

  it("processes simulated registration card OCR for Corolla", async () => {
    const ocr = await apiClient.processRegistrationOcr({ mockVehiclePreset: "corolla" });
    expect(ocr.plateNumber).toBe("35 CDE 789");
    expect(ocr.brand).toBe("TOYOTA");
    expect(ocr.tsbVehicle?.tsbCode).toBe("2081190");
    expect(ocr.confidenceScore).toBeGreaterThan(0.9);
  });

  it("creates intake work order and returns work order summary", async () => {
    const intake = await apiClient.createIntake({
      asset: {
        plateNumber: "34 TEST 123",
        brand: "Volkswagen",
        model: "Passat",
        currentMeter: 125000,
      },
      customer: {
        fullName: "Ali Veli",
        phone: "0532 111 2233",
      },
      intakeDetails: {
        intakeMeter: 125000,
        customerComplaint: "Periyodik bakım",
        damageInspectionMarkers: [
          {
            zone: "FrontBumper",
            damageType: "scratch",
            xPercent: 50,
            yPercent: 10,
          },
        ],
      },
      priority: "Urgent",
    });

    expect(intake.workOrderNumber).toMatch(/^WO-2026-/);
    expect(intake.status).toBe("Open");
    expect(intake.damageMarkers.length).toBe(1);
    expect(intake.customerMagicLink).toContain("hiservis.link");
  });

  it("handles labor timer clock-in and clock-out fallbacks", async () => {
    const clockIn = await apiClient.clockInLabor("wo-10492");
    expect(clockIn.isLaborRunning).toBe(true);
    expect(clockIn.workOrderNumber).toBe("WO-2026-10492");

    const clockOut = await apiClient.clockOutLabor("wo-10492");
    expect(clockOut.isLaborRunning).toBe(false);
  });
});
