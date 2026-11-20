"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiVehicleIntakeForm } from "@/components/intake/HiVehicleIntakeForm";
import { HiWorkshopKanban } from "@/components/kanban/HiWorkshopKanban";
import { HiTechBoard } from "@/components/techboard/HiTechBoard";
import { HiReceivingConsole } from "@/components/warehouse/HiReceivingConsole";
import { HiProcurementPanel } from "@/components/procurement/HiProcurementPanel";
import { HiQuarantineConsole } from "@/components/quarantine/HiQuarantineConsole";
import {
  Car,
  Flame,
  Bike,
  Building2,
  Zap,
  Wrench,
  Kanban,
  Barcode,
  ShoppingCart,
  Printer,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSector } from "@/lib/SectorContext";
import { HiSectorSwitcher } from "@/components/ui/HiSectorSwitcher";

const SECTOR_ICONS: Record<string, React.ElementType> = {
  Car,
  Flame,
  Bike,
  Building2,
  Zap,
  Wrench,
};

type ActiveTab = "intake" | "kanban" | "techboard" | "receiving" | "procurement" | "quarantine";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("intake");
  const { config } = useSector();

  const IntakeIcon = SECTOR_ICONS[config.iconName] || Car;

  const TABS = [
    {
      id: "intake" as const,
      label: config.id === "automotive" ? "Hızlı Araç Kabul" : `Hızlı ${config.assetTypeName} Kabul`,
      shortLabel: "Kabul",
      icon: IntakeIcon,
    },
    {
      id: "kanban" as const,
      label: config.id === "automotive" ? "Lift & Atölye Kanban" : "İstasyon & Saha Kanban",
      shortLabel: "Kanban",
      icon: Kanban,
    },
    {
      id: "techboard" as const,
      label: "Teknisyen Paneli",
      shortLabel: "Teknisyen",
      icon: Wrench,
    },
    {
      id: "receiving" as const,
      label: "Konsolide Mal Kabul",
      shortLabel: "Mal Kabul",
      icon: Barcode,
    },
    {
      id: "procurement" as const,
      label: "Satınalma & Tedarik",
      shortLabel: "Tedarik",
      icon: ShoppingCart,
    },
    {
      id: "quarantine" as const,
      label: "Karantina & Çakışma Yönetimi",
      shortLabel: "Karantina",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* 2-KADEMELİ MODERN ENTERPRISE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Tier 1: Global Marka, Şube & Sektör Seçici, Sistem Durumu (h-14 / 56px) */}
        <div className="border-b border-slate-100 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            {/* Sol: Logo + Ayırıcı + Birleşik Sektör & Şube Seçici */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                  H
                </span>
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HiServis AI
                </span>
              </div>

              <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700 font-light">/</span>

              {/* Birleşik & Modern Sektör Switcher */}
              <div className="min-w-0">
                <HiSectorSwitcher />
              </div>
            </div>

            {/* Sağ: Atölye Tablet Modu & Canlı Sistem Durumu */}
            <div className="flex items-center gap-2.5 shrink-0 text-xs">
              <Link
                href="/tech"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 font-bold text-xs transition-colors shadow-xs"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>📱 Atölye Tableti (/tech)</span>
              </Link>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[11px]">Sistem Çevrimiçi</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                <Printer className="w-3.5 h-3.5" />
                <span>Termal: Hazır</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Modül Gezinme Sekmeleri (Geniş & Ferah) */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2" aria-label="Modül Gezinimi">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        {activeTab === "intake" && <HiVehicleIntakeForm />}

        {activeTab === "kanban" && (
          <HiWorkshopKanban
            onOpenTechBoard={() => setActiveTab("techboard")}
            onOpenIntake={() => setActiveTab("intake")}
          />
        )}

        {activeTab === "techboard" && (
          <div className="py-2">
            <HiTechBoard />
          </div>
        )}

        {activeTab === "receiving" && <HiReceivingConsole />}

        {activeTab === "procurement" && <HiProcurementPanel />}

        {activeTab === "quarantine" && <HiQuarantineConsole />}
      </main>

      {/* Mobil Alt Çubuk (Bottom Navigation Bar) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-1 px-1 shadow-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold transition-all",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  isActive ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-full text-center">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
