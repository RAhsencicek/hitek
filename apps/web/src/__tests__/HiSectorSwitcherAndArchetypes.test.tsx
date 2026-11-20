import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HiSectorSwitcher } from "@/components/ui/HiSectorSwitcher";
import { HiAssetBadge } from "@/components/ui/HiAssetBadge";
import { SectorProvider, useSector } from "@/lib/SectorContext";
import { SECTOR_PRESETS, getSectorConfig } from "@/lib/sector-presets";
import { HiVehicleIntakeForm } from "@/components/intake/HiVehicleIntakeForm";

describe("HiSectorSwitcher & Çok Sektörlü Dinamik Şablon Mimarisi", () => {
  it("verifies SECTOR_PRESETS covers all 6 key sectors with required parameters", () => {
    expect(SECTOR_PRESETS.automotive).toBeDefined();
    expect(SECTOR_PRESETS.hvac).toBeDefined();
    expect(SECTOR_PRESETS.micromobility).toBeDefined();
    expect(SECTOR_PRESETS.elevator).toBeDefined();
    expect(SECTOR_PRESETS.generator).toBeDefined();
    expect(SECTOR_PRESETS.general).toBeDefined();

    const elevator = getSectorConfig("elevator");
    expect(elevator.primaryIdentifier.label).toContain("Bakanlık Asansör Kimlik");
    expect(elevator.primaryIdentifier.badgeType).toBe("industrial");
    expect(elevator.meter.unit).toBe("Kat / Ay");

    const hvac = getSectorConfig("hvac");
    expect(hvac.primaryIdentifier.label).toContain("Cihaz / Tesisat Barkod No");
    expect(hvac.meter.unit).toBe("Bar / Yıl");

    const generator = getSectorConfig("generator");
    expect(generator.meter.label).toBe("Çalışma Saati (Hourmeter)");
  });

  it("renders HiAssetBadge as Turkish plate for automotive and industrial badge for others", () => {
    // 1. Plate badge
    const { rerender } = render(
      <HiAssetBadge identifier="34 ABC 123" badgeType="plate" />
    );
    expect(screen.getByText("34 ABC 123")).toBeInTheDocument();
    expect(screen.getByText("TR")).toBeInTheDocument();

    // 2. Industrial badge
    rerender(
      <HiAssetBadge identifier="AS-34-10492" badgeType="industrial" />
    );
    expect(screen.getByText("AS-34-10492")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("renders HiSectorSwitcher and switches sector dynamically", () => {
    const TestComponent = () => {
      const { sector, config } = useSector();
      return (
        <div>
          <HiSectorSwitcher />
          <div data-testid="current-sector">{sector}</div>
          <div data-testid="current-branch">{config.branchDefaultName}</div>
        </div>
      );
    };

    render(
      <SectorProvider>
        <TestComponent />
      </SectorProvider>
    );

    // Initial default is micromobility (Ahmet Usta öncelikli saha satışı)
    expect(screen.getByTestId("current-sector").textContent).toBe("micromobility");
    expect(screen.getByText("Moto & Scooter")).toBeInTheDocument();

    // Click dropdown toggle
    const toggleBtn = screen.getByText("SEKTÖR DEĞİŞTİR");
    fireEvent.click(toggleBtn);

    // Should display all sectors in dropdown
    expect(screen.getByText("İklimlendirme, Kombi & Soğutma (HVAC)")).toBeInTheDocument();
    expect(screen.getByText("Asansör & Yürüyen Merdiven Sistemleri")).toBeInTheDocument();
    expect(screen.getByText("Jeneratör, Kompresör & Güç Sistemleri")).toBeInTheDocument();

    // Click on HVAC
    const hvacBtn = screen.getByText("İklimlendirme, Kombi & Soğutma (HVAC)");
    fireEvent.click(hvacBtn);

    // Sector and branch should update
    expect(screen.getByTestId("current-sector").textContent).toBe("hvac");
    expect(screen.getByTestId("current-branch").textContent).toContain("Kadıköy Isıtma");
  });

  it("adapts HiVehicleIntakeForm dynamically when switched to Elevator sector", () => {
    const CombinedWrapper = () => {
      const { setSector } = useSector();

      return (
        <div>
          <button type="button" onClick={() => setSector("elevator")}>
            Asansöre Geç
          </button>
          <HiVehicleIntakeForm />
        </div>
      );
    };

    render(
      <SectorProvider>
        <CombinedWrapper />
      </SectorProvider>
    );

    // Click switch to Elevator
    const switchBtn = screen.getByText("Asansöre Geç");
    fireEvent.click(switchBtn);

    // Intake title should adapt
    expect(screen.getByText("Asansör Periyodik Bakım & Arıza Kaydı")).toBeInTheDocument();
    expect(screen.getByText(/Bakanlık Asansör Kimlik/i)).toBeInTheDocument();
    expect(screen.getByText(/A-Tipi Muayene & Güvenlik DVI Kontrol Listesi/i)).toBeInTheDocument();
  });
});
