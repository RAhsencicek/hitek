"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SectorId, SectorConfig, SECTOR_PRESETS, getSectorConfig } from "./sector-presets";

interface SectorContextValue {
  sector: SectorId;
  config: SectorConfig;
  setSector: (sector: SectorId) => void;
  allSectors: SectorConfig[];
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

const SectorContext = createContext<SectorContextValue | undefined>(undefined);

const STORAGE_KEY = "hiservis_active_sector_v1";

export const SectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sector, setSectorState] = useState<SectorId>("automotive");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SectorId;
      if (saved && SECTOR_PRESETS[saved]) {
        setSectorState(saved);
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, []);

  const setSector = (newSector: SectorId) => {
    setSectorState(newSector);
    try {
      localStorage.setItem(STORAGE_KEY, newSector);
    } catch {
      // Ignore
    }
  };

  const config = getSectorConfig(sector);
  const allSectors = Object.values(SECTOR_PRESETS);

  return (
    <SectorContext.Provider
      value={{
        sector,
        config,
        setSector,
        allSectors,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </SectorContext.Provider>
  );
};

export function useSector(): SectorContextValue {
  const context = useContext(SectorContext);
  if (!context) {
    // Graceful fallback for tests that might render components without Provider
    const fallbackConfig = getSectorConfig("automotive");
    return {
      sector: "automotive",
      config: fallbackConfig,
      setSector: () => {},
      allSectors: Object.values(SECTOR_PRESETS),
      isDemoMode: true,
      setIsDemoMode: () => {},
    };
  }
  return context;
}
