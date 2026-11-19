"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSector } from "@/lib/SectorContext";
import { SectorId } from "@/lib/sector-presets";
import {
  Car,
  Flame,
  Bike,
  Building2,
  Zap,
  Wrench,
  ChevronDown,
  Check,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  Car,
  Flame,
  Bike,
  Building2,
  Zap,
  Wrench,
};

export const HiSectorSwitcher: React.FC = () => {
  const { sector, setSector, config, allSectors, isDemoMode } = useSector();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = ICONS[config.iconName] || Wrench;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isDemoMode) {
    // In production mode for a locked paying tenant, we only show their sector badge
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900">
        <CurrentIcon className="w-3.5 h-3.5" />
        <span>{config.shortName}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs",
          "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80",
          "text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 max-w-full"
        )}
      >
        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <CurrentIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-extrabold tracking-tight truncate max-w-[120px] sm:max-w-[160px]">
          {config.shortName}
        </span>
        <span className="hidden lg:inline text-slate-300 dark:text-slate-600 font-normal">|</span>
        <span className="hidden lg:inline font-medium text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
          {config.branchDefaultName}
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0 shadow-xs">
          SEKTÖR DEĞİŞTİR
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Sektör &amp; İş Alanı Görünümü
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Canlı Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm formlar, şube adı ve istasyonlar seçilen sektöre anında bürünür.
            </p>
          </div>

          <div className="py-1 space-y-1">
            {allSectors.map((s) => {
              const IconComp = ICONS[s.iconName] || Wrench;
              const isSelected = sector === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSector(s.id as SectorId);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all",
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold leading-tight">{s.name}</div>
                      <div
                        className={cn(
                          "text-[10px] mt-0.5",
                          isSelected ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {s.primaryIdentifier.label.split("(")[0]} • {s.meter.unit}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
