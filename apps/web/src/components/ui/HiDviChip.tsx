import React from "react";
import { cn, triggerHapticFeedback } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertOctagon, Camera } from "lucide-react";

export type HiDviStatus = "pass" | "warning" | "fail";

export interface HiDviChipProps {
  value?: HiDviStatus;
  onChange?: (status: HiDviStatus) => void;
  title?: string;
  className?: string;
}

/**
 * HiDviChip: Üç Kademeli DVI Muayene Denetim Çipi
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 3.3
 * 🟢 Sorunsuz (Pass) | 🟡 Takip Et (Attention) | 🔴 Acil Değiş (Fail + Kamera İsteği)
 */
export const HiDviChip: React.FC<HiDviChipProps> = ({
  value = "pass",
  onChange,
  title,
  className,
}) => {
  const handleSelect = (status: HiDviStatus) => {
    triggerHapticFeedback(status === "fail" ? [20, 50, 30] : 15);
    onChange?.(status);
  };

  const options: Array<{
    status: HiDviStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgActive: string;
    borderActive: string;
    textActive: string;
    requiresPhoto?: boolean;
  }> = [
    {
      status: "pass",
      label: "SORUNSUZ",
      icon: CheckCircle2,
      bgActive: "bg-emerald-600 text-white shadow-emerald-500/30",
      borderActive: "border-emerald-600",
      textActive: "text-emerald-700 dark:text-emerald-300",
    },
    {
      status: "warning",
      label: "TAKİP ET",
      icon: AlertTriangle,
      bgActive: "bg-amber-500 text-white shadow-amber-500/30",
      borderActive: "border-amber-500",
      textActive: "text-amber-700 dark:text-amber-300",
    },
    {
      status: "fail",
      label: "ACİL DEĞİŞ",
      icon: AlertOctagon,
      bgActive: "bg-red-600 text-white shadow-red-500/30 animate-pulse",
      borderActive: "border-red-600",
      textActive: "text-red-700 dark:text-red-300",
      requiresPhoto: true,
    },
  ];

  return (
    <div className={cn("flex flex-col gap-2 select-none", className)}>
      {title && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
      )}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        {options.map((opt) => {
          const isSelected = value === opt.status;
          const Icon = opt.icon;

          return (
            <button
              key={opt.status}
              type="button"
              onClick={() => handleSelect(opt.status)}
              className={cn(
                "h-14 flex flex-col items-center justify-center gap-1 rounded-xl font-bold text-xs transition-all",
                "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected
                  ? cn(opt.bgActive, "shadow-md scale-[1.02]")
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : opt.textActive)} aria-hidden="true" />
                <span>{opt.label}</span>
              </div>
              {opt.requiresPhoto && (
                <div className="flex items-center gap-1 text-[10px] font-semibold opacity-90">
                  <Camera className="w-3 h-3" aria-hidden="true" />
                  <span>Foto Zorunlu</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
