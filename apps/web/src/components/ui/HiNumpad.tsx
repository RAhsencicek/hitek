import React, { useState } from "react";
import { cn, triggerHapticFeedback } from "@/lib/utils";
import { HiButton56 } from "./HiButton56";
import { Delete, Check } from "lucide-react";

export interface HiNumpadProps {
  initialValue?: string | number;
  label?: string;
  unit?: "KM" | "TL" | "NUMERIC" | string;
  maxDigits?: number;
  onConfirm?: (value: number, formatted: string) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * HiNumpad: Sayısal Dokunmatik Giriş Padi (Full-Screen / Embedded Numpad)
 * Şartname: BILESEN_KATALOGU_VE_UI_KIT.md Madde 4.2
 * Her tuş: Min 70px x 70px, dev puntolu rakamlar, haptik titreşim desteği.
 */
export const HiNumpad: React.FC<HiNumpadProps> = ({
  initialValue = "",
  label = "GÜNCEL ARAÇ KİLOMETRESİ:",
  unit = "KM",
  maxDigits = 7,
  onConfirm,
  onCancel,
  className,
}) => {
  const [digits, setDigits] = useState<string>(() => {
    if (initialValue !== undefined && initialValue !== "") {
      return String(initialValue).replace(/\D/g, "");
    }
    return "";
  });

  React.useEffect(() => {
    if (initialValue !== undefined && initialValue !== "") {
      setDigits(String(initialValue).replace(/\D/g, ""));
    } else {
      setDigits("");
    }
  }, [initialValue]);

  const handleDigit = (digit: string) => {
    if (digits.length >= maxDigits) return;
    if (digits === "" && digit === "0") return; // Avoid leading zeros for odometer
    triggerHapticFeedback(12);
    setDigits((prev) => prev + digit);
  };

  const handleBackspace = () => {
    triggerHapticFeedback(15);
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerHapticFeedback(25);
    setDigits("");
  };

  const numericValue = digits ? parseInt(digits, 10) : 0;

  const formattedDisplay = () => {
    if (!digits) return `0 ${unit === "KM" ? "KM" : unit === "TL" ? "₺" : ""}`;
    const formattedNum = new Intl.NumberFormat("tr-TR").format(numericValue);
    if (unit === "KM") return `${formattedNum} KM`;
    if (unit === "TL") return `${formattedNum} ₺`;
    return formattedNum;
  };

  const handleConfirm = () => {
    triggerHapticFeedback([20, 40, 20]);
    onConfirm?.(numericValue, formattedDisplay());
  };

  const numpadKeys = [
    { label: "1", action: () => handleDigit("1") },
    { label: "2", action: () => handleDigit("2") },
    { label: "3", action: () => handleDigit("3") },
    { label: "4", action: () => handleDigit("4") },
    { label: "5", action: () => handleDigit("5") },
    { label: "6", action: () => handleDigit("6") },
    { label: "7", action: () => handleDigit("7") },
    { label: "8", action: () => handleDigit("8") },
    { label: "9", action: () => handleDigit("9") },
    { label: "C", action: handleClear, isSpecial: true, specialColor: "text-amber-600 dark:text-amber-400" },
    { label: "0", action: () => handleDigit("0") },
    { label: "⌫", action: handleBackspace, isSpecial: true, specialColor: "text-red-600 dark:text-red-400", icon: Delete },
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl max-w-sm w-full mx-auto select-none",
        className
      )}
    >
      {/* Başlık ve Dijital Ekran */}
      <div className="mb-4 text-center">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
        <div className="h-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950 border-2 border-blue-500/40 rounded-2xl px-4 shadow-inner">
          <span className="font-mono text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            {formattedDisplay()}
          </span>
        </div>
      </div>

      {/* Dev 70px x 70px Tuş Takımı */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {numpadKeys.map((key, idx) => {
          const Icon = key.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={key.action}
              className={cn(
                "h-[72px] min-w-[70px] flex items-center justify-center rounded-2xl text-2xl font-bold font-mono transition-all",
                "bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-800",
                "dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-blue-900/40 dark:text-slate-100",
                "active:scale-95 shadow-sm border border-slate-200/80 dark:border-slate-700/80",
                key.isSpecial && key.specialColor
              )}
            >
              {Icon ? <Icon className="w-7 h-7" aria-hidden="true" /> : key.label}
            </button>
          );
        })}
      </div>

      {/* Büyük Onay Butonu */}
      <HiButton56
        variant="primary"
        size="56"
        fullWidth
        leftIcon={<Check className="w-6 h-6" />}
        onClick={handleConfirm}
      >
        {unit === "KM" ? "KİLOMETREYİ KAYDET" : "ONAYLA & DEVAM ET"}
      </HiButton56>
    </div>
  );
};
