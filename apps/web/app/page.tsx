"use client";

import React, { useState } from "react";
import { ComponentShowcase } from "@/components/showcase/ComponentShowcase";
import { HiVehicleIntakeForm } from "@/components/intake/HiVehicleIntakeForm";
import { HiWorkshopKanban } from "@/components/kanban/HiWorkshopKanban";
import { HiTechBoard } from "@/components/techboard/HiTechBoard";
import { HiReceivingConsole } from "@/components/warehouse/HiReceivingConsole";
import { HiProcurementPanel } from "@/components/procurement/HiProcurementPanel";
import { Car, Kanban, Wrench, Palette, Sparkles, MapPin, Barcode, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSector } from "@/lib/SectorContext";
import { HiSectorSwitcher } from "@/components/ui/HiSectorSwitcher";

type ActiveTab = "intake" | "kanban" | "techboard" | "receiving" | "procurement" | "showcase";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("intake");
  const { config } = useSector();

  const TABS = [
    {
      id: "intake" as const,
      label: config.id === "automotive" ? "Hızlı Araç Kabul" : `Hızlı ${config.assetTypeName} Kabul`,
      shortLabel: "Kabul",
      icon: Car,
      tag: "Modül 1",
    },
    {
      id: "kanban" as const,
      label: config.id === "automotive" ? "Lift & Atölye Kanban" : "İstasyon & Saha Kanban",
      shortLabel: "Kanban",
      icon: Kanban,
      tag: "Modül 2",
    },
    {
      id: "techboard" as const,
      label: "Teknisyen Paneli",
      shortLabel: "Teknisyen",
      icon: Wrench,
      tag: "Ekran 2",
    },
    {
      id: "receiving" as const,
      label: "Mal Kabul & Mühür",
      shortLabel: "Mal Kabul",
      icon: Barcode,
      tag: "Modül 3",
    },
    {
      id: "procurement" as const,
      label: "Satınalma & Tedarik",
      shortLabel: "Tedarik",
      icon: ShoppingCart,
      tag: "Modül 3",
    },
    {
      id: "showcase" as const,
      label: "UI-Kit Vitrini",
      shortLabel: "Vitrin",
      icon: Palette,
      tag: "Faz 0",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Üst Global Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Şube */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                H
              </span>
              <div className="leading-tight">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HiServis AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  FAZ 2 CANLI
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-semibold pl-3 border-l border-slate-200 dark:border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="hidden xl:inline font-medium text-slate-700 dark:text-slate-300">{config.branchDefaultName}</span>
              <span className="xl:hidden truncate max-w-[160px] font-medium text-slate-700 dark:text-slate-300">
                {config.branchDefaultName.split(" ")[0]} Şubesi
              </span>
            </div>
          </div>

          {/* Sektör Seçici & Sekme Navigasyonu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <HiSectorSwitcher />

            <nav className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto max-w-[calc(100vw-220px)] md:max-w-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none whitespace-nowrap",
                      isActive
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">{tab.label}</span>
                    <span className="xl:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>
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

        {activeTab === "showcase" && <ComponentShowcase />}
      </main>

      {/* Mobil Alt Çubuk (Bottom Navigation Bar) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 shadow-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[11px] font-bold transition-all",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-extrabold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-transparent"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
