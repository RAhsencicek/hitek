import React from "react";
import { cn } from "@/lib/utils";
import { HiPlateBadge } from "./HiPlateBadge";

export interface HiAssetBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  identifier: string;
  badgeType?: "plate" | "industrial";
  prefixTag?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

/**
 * HiAssetBadge: Çok Sektörlü Varlık ve Kimlik Rozeti
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 3.2
 * Otomotiv için Türk Plaka Rozetini, Genel Sanayi/Asansör/Kombi/Jeneratör için
 * Endüstriyel Metalik/Monospace Ekipman Rozetini çizer.
 */
export const HiAssetBadge: React.FC<HiAssetBadgeProps> = ({
  identifier,
  badgeType = "plate",
  prefixTag,
  size = "md",
  className,
  ...props
}) => {
  if (badgeType === "plate") {
    return <HiPlateBadge plate={identifier} size={size} className={className} {...props} />;
  }

  const defaultPrefix = prefixTag || identifier.split("-")[0] || "ID";
  const displayId = identifier || "SN-DEV-2026-001";

  const sizeStyles = {
    sm: {
      container: "h-7 text-xs rounded",
      prefixBand: "w-7 text-[10px] px-1",
      codeText: "px-2 py-0.5 text-xs font-mono font-bold tracking-wider",
    },
    md: {
      container: "h-9 text-sm rounded-md",
      prefixBand: "w-9 text-xs px-1.5",
      codeText: "px-3 py-1 text-sm font-mono font-bold tracking-wider",
    },
    lg: {
      container: "h-11 text-base rounded-md",
      prefixBand: "w-11 text-xs px-2",
      codeText: "px-4 py-1.5 text-base font-mono font-black tracking-wider",
    },
    hero: {
      container: "h-14 text-xl rounded-lg",
      prefixBand: "w-14 text-sm px-2.5",
      codeText: "px-5 py-2 text-xl font-mono font-black tracking-wider",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden select-none",
        "bg-slate-900 text-white dark:bg-slate-950 dark:text-slate-100",
        "border-2 border-slate-700/80 dark:border-slate-600 shadow-sm",
        currentSize.container,
        className
      )}
      {...props}
    >
      {/* Sol Tanımlayıcı Bandı */}
      <div
        className={cn(
          "bg-blue-600 text-white font-black flex items-center justify-center shrink-0 uppercase tracking-tight",
          currentSize.prefixBand
        )}
      >
        {defaultPrefix.slice(0, 4)}
      </div>

      {/* Ana Ekipman / Cihaz Seri Numarası */}
      <div
        className={cn(
          "flex items-center justify-center bg-slate-800/90 text-slate-100 dark:bg-slate-900/90",
          currentSize.codeText
        )}
      >
        {displayId}
      </div>
    </div>
  );
};
