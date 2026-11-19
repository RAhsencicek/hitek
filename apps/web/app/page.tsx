"use client";

import React, { useState } from "react";
import { ComponentShowcase } from "@/components/showcase/ComponentShowcase";
import { HiVehicleIntakeForm } from "@/components/intake/HiVehicleIntakeForm";
import { HiWorkshopKanban } from "@/components/kanban/HiWorkshopKanban";
import { HiTechBoard } from "@/components/techboard/HiTechBoard";
import { Car, Kanban, Wrench, Palette, Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveTab = "intake" | "kanban" | "techboard" | "showcase";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("intake");

  const TABS = [
    {
      id: "intake" as const,
      label: "Hızlı Araç Kabul",
      icon: Car,
      tag: "Modül 1",
    },
    {
      id: "kanban" as const,
      label: "Lift & Atölye Kanban",
      icon: Kanban,
      tag: "Modül 2",
    },
    {
      id: "techboard" as const,
      label: "Teknisyen Tech Board",
      icon: Wrench,
      tag: "Ekran 2",
    },
    {
      id: "showcase" as const,
      label: "UI-Kit Vitrini",
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
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  FAZ 1 CANLI
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-semibold pl-3 border-l border-slate-200 dark:border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Maslak Atatürk Oto Sanayi Şubesi</span>
            </div>
          </div>

          {/* Sekme Navigasyonu */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none",
                    isActive
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {activeTab === "showcase" && <ComponentShowcase />}
      </main>
    </div>
  );
}
