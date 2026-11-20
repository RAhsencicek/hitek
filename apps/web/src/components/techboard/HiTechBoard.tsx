"use client";

import React, { useState, useEffect } from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { HiAssetBadge } from "@/components/ui/HiAssetBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import { useSector } from "@/lib/SectorContext";
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
  Check,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  X
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
  const { sector, config } = useSector();
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

  // Phase 2: Mühür Doğrulama & Çapraz Montaj Kilidi State
  const [qrVerifyModalOpen, setQrVerifyModalOpen] = useState<boolean>(false);
  const [qrInput, setQrInput] = useState<string>("HS-WO10492-P01");
  const [verifyResult, setVerifyResult] = useState<{
    isValid: boolean;
    isCrossAssemblyLocked: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Phase 2: Tersine Lojistik (Uyumsuz Parça İadesi) State
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>("Boyut Uyumsuz");
  const [returnNotes, setReturnNotes] = useState<string>("");
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  const handleVerifySeal = async (tokenToTest?: string) => {
    const token = tokenToTest || qrInput;
    setIsVerifying(true);
    try {
      const res = await apiClient.verifyPartInstallation({
        workOrderId: "wo-10492",
        scannedQr: token,
      });
      setVerifyResult(res);
      setQrVerifyModalOpen(false);
    } catch (err: any) {
      setVerifyResult({
        isValid: false,
        isCrossAssemblyLocked: false,
        message: err.message || "Doğrulama başarısız",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReturnPart = async () => {
    try {
      const res = await apiClient.returnPart({
        partRequestId: "req-passat-1",
        reason: returnReason,
        notes: returnNotes || "Usta tarafından montaj sırasında uyumsuzluk bildirildi.",
        requestNewPart: true,
      });
      setReturnSuccess(res.message);
      setReturnModalOpen(false);
      setVerifyResult(null);
    } catch (err: any) {
      alert("İade işlemi başarısız: " + err.message);
    }
  };

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
    <div className="max-w-md lg:max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Üst Teknisyen İstasyon Çubuğu */}
      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs select-none">
        <div className="font-bold flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-400" />
          <span className="font-extrabold text-sm tracking-tight">HiServis Tech</span>
          <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Canlı İş İstasyonu Paneli
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">İstasyon Çevrimiçi</span>
          </div>
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

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sol Kolon (5 Kolon): Hedef, Araç & Canlı Sayaç */}
          <div className="lg:col-span-5 space-y-4">
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

        {/* ŞU AN ÜZERİNDE ÇALIŞILAN VARLIK KARTI */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {sector === "automotive" ? "ŞU AN ÜZERİNDE ÇALIŞILAN ARAÇ:" : `ŞU AN ÜZERİNDE ÇALIŞILAN ${config.assetTypeName.toUpperCase()}:`}
          </div>

          <div className="flex items-center justify-between">
            {sector === "automotive" ? (
              <HiPlateBadge plate="34 ABC 123" size="lg" />
            ) : (
              <HiAssetBadge identifier={config.demoSamples[0]?.primaryId || "AS-34-10492"} size="lg" />
            )}
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              #WO-10492
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {sector === "automotive"
              ? "Volkswagen Passat 1.6 TDI (2018)"
              : `${config.demoSamples[0]?.brand || "Otis"} ${config.demoSamples[0]?.model || "Gen2"} (${config.demoSamples[0]?.modelYear || 2021})`}
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
              (Standart Süre: {formatTimer(targetSeconds)})
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
      </div>

      {/* Sağ Kolon (Masaüstü 7 Kolon): İşlemler, Parçalar & Kanıtlar */}
      <div className="lg:col-span-7 space-y-4">
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

        {/* PARÇA DURUMU & MÜHÜRLÜ PARÇA QR KARTI (Faz 2 Modül 3) */}
        <div className="space-y-3">
          <div className={cn(
            "p-3 rounded-xl border flex items-center justify-between text-xs transition-colors",
            returnSuccess
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
              : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
          )}>
            <div className={cn(
              "flex items-center gap-2 font-bold",
              returnSuccess ? "text-amber-800 dark:text-amber-200" : "text-emerald-800 dark:text-emerald-200"
            )}>
              <Package className="w-4 h-4 shrink-0" />
              <span>
                {returnSuccess
                  ? "[ ⚠️ 1 Parça Tedarikçiye İade Edildi (İkame Bekleniyor) ]"
                  : verifyResult?.isValid
                  ? "[ ✅ Parça Montajı Doğrulandı & Takıldı ]"
                  : "[ 📦 4/4 Parça Mühürlü Teslim Alındı ]"}
              </span>
            </div>
            <span className={cn(
              "text-[10px] font-semibold",
              returnSuccess ? "text-amber-600" : "text-emerald-600"
            )}>
              {returnSuccess ? "İADE" : verifyResult?.isValid ? "MONTE" : "HAZIR"}
            </span>
          </div>

          {/* MÜHÜRLÜ PARÇA KARTI ŞARTNAMESİ (BILESEN_KATALOGU 4.1) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                <Package className="w-4 h-4 text-blue-600" />
                <span>BOSCH ÖN FREN BALATASI</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                HS-WO10492-P01
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
              <span>OEM: 5Q0 698 151 B • Tedarikçi: Başbuğ Oto</span>
              <span className={cn(
                "font-bold",
                returnSuccess
                  ? "text-amber-600 dark:text-amber-400"
                  : verifyResult?.isValid
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-emerald-600"
              )}>
                Durum: [ {returnSuccess ? "İADE EDİLDİ" : verifyResult?.isValid ? "MONTE EDİLDİ" : "HAZIR"} ]
              </span>
            </div>

            <div className="pt-1 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span>{sector === "automotive" ? "Tahsis Edilen Araç:" : `Tahsis Edilen ${config.assetTypeName}:`}</span>
              {sector === "automotive" ? (
                <HiPlateBadge plate="34 ABC 123" size="sm" />
              ) : (
                <HiAssetBadge identifier={config.demoSamples[0]?.primaryId || "AS-34-10492"} size="sm" />
              )}
              <span className="text-[11px] font-semibold text-slate-500">
                ({sector === "automotive" ? "Passat B8 - Lift 1 / Ahmet U." : `${config.demoSamples[0]?.brand || "Otis"} - İstasyon 1 / Ahmet U.`})
              </span>
            </div>

            {/* Doğrulama Durum Rozeti */}
            {verifyResult && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs font-bold flex items-start gap-2 animate-in fade-in",
                  verifyResult.isValid
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
                    : "bg-red-100 text-red-900 border border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
                )}
              >
                {verifyResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div>{verifyResult.message}</div>
                  {verifyResult.isCrossAssemblyLocked && (
                    <div className="text-[10px] text-red-700 dark:text-red-300 font-normal mt-0.5">
                      Çapraz Montaj Kilidi Devrede! Parça başka araca aittir, takılamaz.
                    </div>
                  )}
                </div>
              </div>
            )}

            {returnSuccess && (
              <div className="p-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{returnSuccess}</span>
              </div>
            )}

            {/* Çapraz Montaj Doğrulama & İade Butonları (BILESEN_KATALOGU 4.1) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {returnSuccess ? (
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>İade Edildi</span>
                </button>
              ) : verifyResult?.isValid ? (
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>📸 Parça Montaj Fotoğrafı Çek</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setQrVerifyModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Mühür Doğrula (QR)</span>
                </button>
              )}

              <button
                type="button"
                disabled={Boolean(returnSuccess)}
                onClick={() => setReturnModalOpen(true)}
                className={cn(
                  "py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all",
                  returnSuccess
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    : "border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ Uyumsuz / İade</span>
              </button>
            </div>
          </div>
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
    </div>
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

      {/* MÜHÜR DOĞRULAMA MODALI (ÇAPRAZ MONTAJ KİLİDİ TESTİ) */}
      {qrVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Mühür QR Kodu Doğrula
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Kutunun üzerindeki 50x30mm mühür etiketinde yer alan QR kod tokenını girin veya okutun:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Örn: HS-WO10492-P01"
                className="w-full h-12 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-mono text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />

              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Hızlı Test Senaryoları:</span>
                <button
                  type="button"
                  onClick={() => {
                    setQrInput("HS-WO10492-P01");
                    handleVerifySeal("HS-WO10492-P01");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-left text-xs font-bold transition-colors"
                >
                  🟢 Doğru Mühür (34 ABC 123 Passat)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrInput("HS-WOMEGANE-P01");
                    handleVerifySeal("HS-WOMEGANE-P01");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-left text-xs font-bold transition-colors"
                >
                  🔴 Yanlış Araç Mührü (Çapraz Kilit Tetikle)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQrVerifyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleVerifySeal()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                {isVerifying ? "Kontrol Ediliyor..." : "Mührü Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UYUMSUZ PARÇA İADE MODALI (TERSİNE LOJİSTİK) */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Uyumsuz Parça / İade Akışı
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Parça iş emrinden düşülecek ve depodaki <span className="font-bold text-slate-700 dark:text-slate-300">&quot;ReturnToSupplier&quot;</span> sanal rafına sevk edilecektir.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                İade Nedeni Seçin:
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="Boyut Uyumsuz">Boyut Uyumsuz (Örn: 288mm vs 312mm)</option>
                <option value="Hasarlı/Kırık">Hasarlı / Kırık / Deforme</option>
                <option value="Katalog Hatası">Katalog / OEM Çapraz Kod Hatası</option>
                <option value="Müşteri Vazgeçti">Müşteri Parça Değişiminden Vazgeçti</option>
              </select>

              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block pt-1">
                Usta Notu (Opsiyonel):
              </label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Örn: Disk çapı araca küçük geldi, 312mm sipariş edilmeli..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleReturnPart}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                İadeyi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
