import React from "react";
import { cn } from "@/lib/utils";

export interface HiPlateBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  plate: string;
  size?: "sm" | "md" | "lg" | "hero";
  showBorder?: boolean;
}

/**
 * Normalizes Turkish license plates into standard spaced format (e.g., '34 ABC 123').
 */
export function formatTurkishPlate(rawPlate: string): string {
  if (!rawPlate) return "";
  const cleaned = rawPlate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Match standard Turkish plate format: 2 digits + 1-3 letters + 2-4 digits
  const match = cleaned.match(/^(\d{2})([A-Z]{1,3})(\d{2,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }

  // Fallback to cleaned uppercase with single spaces
  return rawPlate.trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * HiPlateBadge: Türkiye Standart Plaka Rozeti (DIN 1451 / FE-Schrift benzeri)
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 3.2
 * Sol mavi bant (#003399) + Beyaz Zemin (#FFFFFF) + Siyah Kabartma Yazı
 */
export const HiPlateBadge: React.FC<HiPlateBadgeProps> = ({
  plate,
  size = "md",
  showBorder = true,
  className,
  ...props
}) => {
  const normalized = (plate || "").trim();
  const formattedPlate = normalized ? formatTurkishPlate(normalized) : "";
  const displayPlate = formattedPlate || "34 ABC 123";

  const sizeStyles = {
    sm: {
      container: "h-7 text-xs rounded-sm",
      blueBand: "w-5 text-[9px] px-1",
      plateText: "px-2 py-0.5 tracking-wider font-bold text-xs",
    },
    md: {
      container: "h-9 text-sm rounded-md",
      blueBand: "w-6 text-[11px] px-1.5",
      plateText: "px-3 py-1 tracking-wider font-extrabold text-sm",
    },
    lg: {
      container: "h-11 text-lg rounded-md",
      blueBand: "w-8 text-xs px-2",
      plateText: "px-4 py-1.5 tracking-widest font-extrabold text-lg",
    },
    hero: {
      container: "h-14 text-2xl rounded-lg shadow-md",
      blueBand: "w-10 text-sm px-2.5",
      plateText: "px-5 py-2 tracking-widest font-black text-2xl",
    },
  }[size];

  return (
    <div
      role="img"
      aria-label={`Araç Plakası: ${displayPlate}`}
      className={cn(
        "inline-flex items-stretch overflow-hidden select-none",
        "bg-white text-slate-950 font-plate",
        showBorder && "border-[1.5px] border-[#1E293B]",
        sizeStyles.container,
        className
      )}
      {...props}
    >
      {/* Sol TR Mavi Bandı */}
      <div
        className={cn(
          "bg-[#003399] text-white flex flex-col items-center justify-center font-bold tracking-tighter shrink-0 select-none",
          sizeStyles.blueBand
        )}
      >
        <span>TR</span>
      </div>

      {/* Beyaz Zemin Üzeri Plaka Numarası */}
      <div
        className={cn(
          "flex items-center justify-center whitespace-nowrap bg-white text-slate-900 font-mono font-bold uppercase",
          sizeStyles.plateText
        )}
      >
        {displayPlate}
      </div>
    </div>
  );
};
