"use client";

import React, { useState, useEffect } from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import {
  Wrench,
  Play,
  Pause,
  CheckCircle2,
  Mic,
  Camera,
  Package,
  Wifi,
  Battery,
  Clock,
  Sparkles,
  Volume2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export interface ChecklistItem {
  id: string;
  title: string;
  isDone: boolean;
  type: "labor" | "part" | "inspection";
}

export const HiTechBoard: React.FC = () => {
  // Labor Timer State: start with 1 hour 24 minutes 35 seconds (5075s) per wireframe!
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(5075);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const targetSeconds = 7200; // 2 hours

  // Ticking timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Checklist Items (Wireframe Ekran 2)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "item-1", title: "Ön Fren Disk & Balata Değişimi", isDone: true, type: "labor" },
    { id: "item-2", title: "4 Litre 5W-30 Motor Yağı & Filtre Değişimi", isDone: false, type: "labor" },
    { id: "item-3", title: "Sağ Salıncak Burcu Kontrolü", isDone: false, type: "inspection" },
  ]);

  // Voice Dictation & Photo simulation state
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictatedText, setDictatedText] = useState<string>("");
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item))
    );
  };

  const handleToggleTimer = async () => {
    const nextState = !isTimerRunning;
    setIsTimerRunning(nextState);
    try {
      if (nextState) {
        await apiClient.clockInLabor("wo-10492");
      } else {
        await apiClient.clockOutLabor("wo-10492");
      }
    } catch {
      // offline fallback
    }
  };

  const handleSimulateVoice = () => {
    setIsDictating(true);
    setTimeout(() => {
      setDictatedText("Ön sağ salıncak burcunda aşırı boşluk tespit edildi, parça talebi açıldı.");
      setIsDictating(false);
    }, 1200);
  };

  const handleSimulatePhoto = () => {
    setIsTakingPhoto(true);
    setTimeout(() => {
      setCapturedPhoto("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&q=80");
      setIsTakingPhoto(false);
    }, 600);
  };

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100));

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[760px]">
      {/* Mobil Üst Çubuk (Status Bar) */}
      <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="font-bold flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-blue-400" />
          <span>HiServis Tech</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>94%</span>
          </div>
        </div>
      </div>

      {/* Teknisyen Kimlik Kartı */}
      <div className="px-5 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900 flex items-center justify-between">
        <div>
          <div className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1">
            <span>👨‍🔧 Ahmet Usta</span>
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
            Maslak Merkez • LİFT 1 (Mekanik)
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Vardiyada</span>
        </span>
      </div>

      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        {/* GÜNLÜK VERİMLİLİK HEDEFİ */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight text-[11px]">
              GÜNLÜK VERİMLİLİK HEDEFİ:
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">%81</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Hedef: 8.0 Saat</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Kazanılan: 6.5 Saat</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: "81%" }} />
          </div>
        </div>

        {/* ŞU AN ÜZERİNDE ÇALIŞILAN ARAÇ KARTI */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            ŞU AN ÜZERİNDE ÇALIŞILAN ARAÇ:
          </div>

          <div className="flex items-center justify-between">
            <HiPlateBadge plate="34 ABC 123" size="lg" />
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              #WO-10492
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Volkswagen Passat 1.6 TDI (2018)
          </div>

          {/* AKTİF İŞÇİLİK SAYACI */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>AKTİF İŞÇİLİK SAYAÇ</span>
            </div>

            {/* Büyük Dijital Saat */}
            <div
              className={cn(
                "text-3xl font-mono font-black tracking-wider transition-all",
                isTimerRunning
                  ? "text-blue-600 dark:text-blue-400 drop-shadow-sm"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              ⏱️ {formatTimer(elapsedSeconds)}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              (Hedef Süre: {formatTimer(targetSeconds)})
            </div>

            {/* Sayaç İlerleme Çubuğu */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  progressPercent >= 100
                    ? "bg-amber-500"
                    : isTimerRunning
                    ? "bg-blue-600 animate-pulse"
                    : "bg-blue-400"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Mola / Başla Butonu */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  isTimerRunning
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                )}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>⏸️ Mola / Duraklat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>▶️ İşe Devam Et / Başla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* YAPILACAK İŞLEMLER (CHECKLIST) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center justify-between">
            <span>YAPILACAK İŞLEMLER:</span>
            <span className="text-[11px] font-normal text-slate-400">
              {checklist.filter((i) => i.isDone).length}/{checklist.length} Tamam
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className={cn(
                  "w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition-all",
                  item.isDone
                    ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-500 line-through"
                    : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-400 shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                    item.isDone
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-slate-300 dark:border-slate-600"
                  )}
                >
                  {item.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PARÇA DURUMU */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
            <Package className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>[ 📦 4/4 Parça Mühürlü Teslim Alındı ]</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600">HAZIR</span>
        </div>

        {/* Sesli Dikte veya Fotoğraf Çıktısı Gösterimi */}
        {dictatedText && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2 animate-in fade-in">
            <Mic className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Sesli Not Kaydedildi (Whisper AI):</div>
              <div className="text-[11px] mt-0.5">{dictatedText}</div>
            </div>
          </div>
        )}

        {capturedPhoto && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 shrink-0" />
              <span>İşçilik kanıt fotoğrafı eklendi.</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedPhoto} alt="Kanıt" className="w-10 h-10 rounded-lg object-cover border" />
          </div>
        )}

        {isComplete && (
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>İş Emri Ahmet Usta Tarafından Tamamlandı &amp; Kalite Kontrole Sevk Edildi!</span>
          </div>
        )}
      </div>

      {/* SABİT ALT AKSİYON ÇUBUĞU (STICKY BAR - 72px) */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 h-[72px] grid grid-cols-3 gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSimulateVoice}
          disabled={isDictating}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Mic className="w-4 h-4 text-purple-600" />
          <span>{isDictating ? "Dinliyor..." : "🎙️ Dikte"}</span>
        </button>

        <button
          type="button"
          onClick={handleSimulatePhoto}
          disabled={isTakingPhoto}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-100 font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Camera className="w-4 h-4 text-blue-600" />
          <span>{isTakingPhoto ? "Çekiliyor..." : "📸 Fotoğraf"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsComplete(true);
            setIsTimerRunning(false);
          }}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>✅ Tamamla</span>
        </button>
      </div>
    </div>
  );
};
