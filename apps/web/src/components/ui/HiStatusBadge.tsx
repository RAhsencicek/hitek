import React from "react";
import { cn } from "@/lib/utils";
import {
  Clock,
  Wrench,
  PackageSearch,
  Send,
  CheckCircle2,
  FileCheck,
  XCircle,
  ShieldAlert,
} from "lucide-react";

export type HiWorkOrderStatus =
  | "Open"
  | "InProgress"
  | "WaitingParts"
  | "CustomerApproval"
  | "Completed"
  | "Invoiced"
  | "Cancelled"
  | "QUARANTINE_REVIEW"
  | "QuarantineReview";

export interface HiStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: HiWorkOrderStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

interface StatusVisualConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  containerClass: string;
  dotClass?: string;
  animationClass?: string;
}

export const STATUS_MAP: Record<HiWorkOrderStatus, StatusVisualConfig> = {
  Open: {
    label: "Yeni Kabul / Açık",
    icon: Clock,
    containerClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800",
    dotClass: "bg-sky-500",
  },
  InProgress: {
    label: "Lifte Alındı / İşlemde",
    icon: Wrench,
    containerClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700",
    dotClass: "bg-blue-600 animate-ping",
    animationClass: "animate-slow-pulse ring-1 ring-blue-400/50",
  },
  WaitingParts: {
    label: "Parça Bekleniyor",
    icon: PackageSearch,
    containerClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  CustomerApproval: {
    label: "Müşteri Onayı Bekliyor",
    icon: Send,
    containerClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
    dotClass: "bg-purple-500",
  },
  Completed: {
    label: "Tamamlandı / Kalite Kontrol",
    icon: CheckCircle2,
    containerClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  Invoiced: {
    label: "Faturalandı / Teslim Edildi",
    icon: FileCheck,
    containerClass:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
    dotClass: "bg-slate-400",
  },
  Cancelled: {
    label: "İptal Edildi",
    icon: XCircle,
    containerClass:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  QUARANTINE_REVIEW: {
    label: "Karantinada / İnceleme Gerekli",
    icon: ShieldAlert,
    containerClass:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700",
    dotClass: "bg-rose-600 animate-ping",
    animationClass: "animate-fast-pulse ring-2 ring-rose-500 shadow-sm",
  },
  QuarantineReview: {
    label: "Karantinada / İnceleme Gerekli",
    icon: ShieldAlert,
    containerClass:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700",
    dotClass: "bg-rose-600 animate-ping",
    animationClass: "animate-fast-pulse ring-2 ring-rose-500 shadow-sm",
  },
};

/**
 * HiStatusBadge: Durum Makinesi Görsel Eşleme Rozeti
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 2
 * WCAG 1.4.1 Uyumlu: Asla sadece renk kullanılmaz, her rozette standart Lucide ikonu bulunur.
 */
export const HiStatusBadge: React.FC<HiStatusBadgeProps> = ({
  status,
  size = "md",
  showDot = false,
  className,
  ...props
}) => {
  const config = STATUS_MAP[status] || STATUS_MAP.Open;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5 rounded-md",
    md: "px-3 py-1 text-sm gap-2 rounded-lg font-semibold",
    lg: "px-4 py-1.5 text-base gap-2.5 rounded-xl font-bold",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center border font-medium transition-colors select-none",
        config.containerClass,
        config.animationClass,
        sizeClasses,
        className
      )}
      {...props}
    >
      {showDot && config.dotClass && (
        <span className={cn("w-2 h-2 rounded-full", config.dotClass)} aria-hidden="true" />
      )}
      <IconComponent className={cn("shrink-0", iconSizes)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
