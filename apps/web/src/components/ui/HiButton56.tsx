import React from "react";
import { cn, triggerHapticFeedback } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface HiButton56Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary" | "ghost" | "success";
  size?: "56" | "48" | "72";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  enableHaptic?: boolean;
}

/**
 * HiButton56: Dokunmatik Optimize 56px Sanayi & Saha Butonu
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 3.1 & TASARIM_SISTEMI_VE_MOBIL_ERGONOMI.md
 * Sanayi eldivenleri ve yağlı parmaklar için minimum 48px, birincil eylemler için 56px.
 * Tıklama anında haptik geri bildirim titreşimi tetikler.
 */
export const HiButton56 = React.forwardRef<HTMLButtonElement, HiButton56Props>(
  (
    {
      children,
      variant = "primary",
      size = "56",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      enableHaptic = true,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      if (enableHaptic) {
        triggerHapticFeedback(18); // Medium impact tactile bump
      }
      onClick?.(e);
    };

    const variantStyles = {
      primary:
        "bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-sm border border-transparent dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]",
      danger:
        "bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-sm border border-transparent dark:bg-[#EF4444] dark:hover:bg-[#DC2626]",
      secondary:
        "bg-white hover:bg-slate-50 text-slate-900 border-[1.5px] border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600",
      ghost:
        "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 border border-transparent",
      success:
        "bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] text-white shadow-sm border border-transparent dark:bg-[#10B981] dark:hover:bg-[#059669]",
    }[variant];

    const sizeStyles = {
      "48": "h-12 min-h-[48px] px-5 text-sm font-semibold rounded-xl",
      "56": "h-14 min-h-[56px] px-6 text-base font-bold rounded-xl",
      "72": "h-[72px] min-h-[72px] px-8 text-lg font-bold rounded-2xl",
    }[size];

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
          "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          sizeStyles,
          variantStyles,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

HiButton56.displayName = "HiButton56";
