"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Wrench,
  Play,
  Pause,
  PackagePlus,
  CheckCircle2,
  Clock,
  Lock,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { MICROMOBILITY_PARTS_SEED, MicromobilityPart } from "@/lib/sector-presets";

const TECH_PIN = "1234";
const AUTO_LOCK_SECONDS = 60;

interface RequestedPartItem {
  oem: string;
  name: string;
  unit: string;
  category: string;
  sealQr: string;
  sealedToPlate: string;
  timestamp: string;
}

export default function TechTabletPage() {
  // Authentication & Pin State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);

  // Auto-lock timer state
  const [countdown, setCountdown] = useState<number>(AUTO_LOCK_SECONDS);

  // Active Work Order State
  const [workOrder, setWorkOrder] = useState({
    id: "WO-2026-10499",
    plate: "34 MTO 99",
    brandModel: "Honda PCX 125 (2022)",
    meter: "18.400 KM",
    customer: "Mert Yılmaz (Trendyol Go Kurye)",
    phone: "0532 999 8877",
    station: "Lift 1 (Motosiklet Hidrolik Lift)",
    priority: "⚡ 15 Dk Kurye Ekspres (Müşteri Bekliyor)",
    complaint: "Varyatörden ses geliyor, kalkışta titriyor. 15 Dk Kurye Ekspres Bakımı (Yağ + Buji + Lastik Basınç 29/33 PSI + Fren Ayarı) yapılacak.",
    status: "in_progress" as "waiting" | "in_progress" | "completed",
  });

  // Stopwatch Labor Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(504); // Default 08:24
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Parts Modal & Cross-Dock Sealed Parts
  const [isPartsModalOpen, setIsPartsModalOpen] = useState<boolean>(false);
  const [requestedParts, setRequestedParts] = useState<RequestedPartItem[]>([
    {
      oem: "BAN-BELT-PCX",
      name: "Bando Varyatör Tahrik Kayışı (Honda PCX)",
      unit: "Adet",
      category: "Şanzıman",
      sealQr: "MÜHÜR-34MTO99-BANDO-8891",
      sealedToPlate: "34 MTO 99",
      timestamp: "10:14",
    },
    {
      oem: "CAS-10W40-4T",
      name: "Castrol Power1 10W-40 4T Sentetik Yağ (1L)",
      unit: "Adet",
      category: "Yağ & Sıvı",
      sealQr: "MÜHÜR-34MTO99-CAS-1049",
      sealedToPlate: "34 MTO 99",
      timestamp: "10:15",
    },
  ]);
  const [selectedPartToAdd, setSelectedPartToAdd] = useState<MicromobilityPart | null>(null);
  const [justSealedPart, setJustSealedPart] = useState<RequestedPartItem | null>(null);

  // Completion Checklist Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [checklist, setChecklist] = useState({
    oilChanged: true,
    sparkPlugChecked: true,
    tirePsiAdjusted: true,
    variatorChecked: true,
    brakesTested: true,
  });

  // Reset Countdown on User Action
  const handleUserActivity = () => {
    setCountdown(AUTO_LOCK_SECONDS);
  };

  // Auto-lock countdown effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsAuthenticated(false);
          setPin("");
          return AUTO_LOCK_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Labor Stopwatch effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle PIN input
  const handleNumberPress = (num: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      if (newPin === TECH_PIN) {
        setIsAuthenticated(true);
        setPin("");
        setCountdown(AUTO_LOCK_SECONDS);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin("");
          setPinError(false);
        }, 800);
      }
    }
  };

  const handleClearPin = () => {
    setPin("");
    setPinError(false);
  };

  const handleBackspacePin = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleLockScreen = () => {
    setIsAuthenticated(false);
    setPin("");
  };

  // Format Stopwatch Time: HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Add Part with Cross-Dock Seal Simulation
  const handleConfirmPartRequest = (part: MicromobilityPart) => {
    const sealCode = `MÜHÜR-${workOrder.plate.replace(/\s+/g, "")}-${part.oem.replace(/-/g, "").slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newSealed: RequestedPartItem = {
      oem: part.oem,
      name: part.name,
      unit: part.unit,
      category: part.category,
      sealQr: sealCode,
      sealedToPlate: workOrder.plate,
      timestamp: timeStr,
    };

    setRequestedParts((prev) => [newSealed, ...prev]);
    setJustSealedPart(newSealed);
    setSelectedPartToAdd(null);
  };

  // Complete Work Order
  const handleFinalizeWorkOrder = () => {
    setIsTimerRunning(false);
    setWorkOrder((prev) => ({ ...prev, status: "completed" }));
    setIsCompleteModalOpen(false);
  };

  // -------------------------------------------------------------
  // EKRAN 1: 4 HANELİ TABLET PIN GİRİŞ EKRANI (LOCKED)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none">
        {/* Üst Bilgi Barı */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl shadow-lg">
              H
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">HiServis AI</h1>
              <p className="text-xs text-slate-400">Atölye Teknisyen Tableti</p>
            </div>
          </div>

          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Yönetici Portalı</span>
          </Link>
        </div>

        {/* PIN Pad Formu */}
        <div className="max-w-xs w-full mx-auto space-y-6 py-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Atölye Girişi</h2>
            <p className="text-xs text-slate-400">
              İş emrini görmek için 4 haneli PIN kodunuzu tuşlayın.
            </p>
          </div>

          {/* PIN Daireleri Göstergesi */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-200 border-2",
                    pinError
                      ? "bg-red-500 border-red-500 animate-shake"
                      : isFilled
                      ? "bg-blue-500 border-blue-500 scale-110 shadow-sm shadow-blue-500/50"
                      : "bg-slate-900 border-slate-700"
                  )}
                />
              );
            })}
          </div>

          {pinError && (
            <p className="text-center text-xs font-bold text-red-400 animate-shake">
              Hatalı PIN! Lütfen tekrar deneyin.
            </p>
          )}

          {/* 3x4 Dokunmatik Tuş Takımı (Min 64px Dev Butonlar) */}
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberPress(num)}
                className="h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-blue-600 border border-slate-800 text-2xl font-bold text-slate-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="h-16 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-400 flex items-center justify-center transition-all active:scale-95 border border-slate-800"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleNumberPress("0")}
              className="h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-blue-600 border border-slate-800 text-2xl font-bold text-slate-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspacePin}
              className="h-16 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-sm font-bold text-slate-400 flex items-center justify-center transition-all active:scale-95 border border-slate-800"
            >
              ⌫
            </button>
          </div>

          {/* Demo Giriş İpucu */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 text-center space-y-1">
            <div className="text-[11px] font-semibold text-blue-300">
              🔧 Ahmet Usta (Lift 1)
            </div>
            <div className="text-xs font-mono font-bold text-blue-400">
              Giriş PIN Kodu: <span className="underline">1234</span>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="text-center text-[11px] text-slate-500 py-2 border-t border-slate-900">
          HiServis AI • Yağlı El Tablet Modu • Sıfır Finansal Veri Gizliliği
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EKRAN 2: AHMET USTA ATÖLYE TABLETİ (UNLOCKED & OPERATIONAL)
  // -------------------------------------------------------------
  return (
    <div
      onClick={handleUserActivity}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none"
    >
      {/* 1. ÜST BAR: TEKNİSYEN KİMLİĞİ & 60s OTOMATİK KİLİT GERİ SAYIMI */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white">Ahmet Usta</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                Lift 1 Çevrimiçi
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Motosiklet &amp; Scooter Mekanik İstasyonu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Otomatik Kilit Sayacı */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Kilit: {countdown}s</span>
          </div>

          {/* Manuel Kilitle Butonu */}
          <button
            type="button"
            onClick={handleLockScreen}
            className="px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-200 flex items-center gap-1 transition-all active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kilitle</span>
          </button>

          {/* Yönetici Portalı Linki */}
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Yönetici</span>
          </Link>
        </div>
      </header>

      {/* 2. ANA ÇALIŞMA ALANI: AKTİF İŞ EMRİ KARTI */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Tamamlandı Başarı Bildirimi */}
        {workOrder.status === "completed" && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-black text-base text-white">İş Başarıyla Tamamlandı!</h3>
                <p className="text-xs text-emerald-300">
                  Araç test sürüşü ve son kontrol için sevk edildi. Yönetici portalına bilgi verildi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWorkOrder((prev) => ({ ...prev, status: "in_progress" }))}
              className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Yeniden Aç
            </button>
          </div>
        )}

        {/* Aktif Araç ve İş Kartı */}
        <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <HiPlateBadge plate={workOrder.plate} size="hero" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {workOrder.brandModel}
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  {workOrder.meter} • {workOrder.customer}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-950 text-blue-300 border border-blue-800">
                {workOrder.station}
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-950 text-amber-300 border border-amber-800">
                {workOrder.priority}
              </span>
            </div>
          </div>

          {/* Müşteri Şikayeti & İş Tanımı */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Talep Edilen İşlemler &amp; Şikayet:
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {workOrder.complaint}
            </p>
          </div>

          {/* Canlı İşçilik Kronometresi */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full transition-all",
                  isTimerRunning
                    ? "bg-emerald-500 animate-ping"
                    : "bg-slate-600"
                )}
              />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  İşçilik Süresi:
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={cn(
                "px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg",
                isTimerRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              )}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>DURAKLAT</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>KRONOMETREYİ BAŞLAT</span>
                </>
              )}
            </button>
          </div>

          {/* Mühürlü Parçalar Listesi (Cross-Dock QR Mühürleme) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bu Motora Tahsisli &amp; Mühürlü Parçalar ({requestedParts.length}):</span>
              </span>
              <span className="text-[10px] text-slate-500">Çapraz Parça Kaçağı Engellendi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requestedParts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <QrCode className="w-3 h-3 shrink-0" />
                      <span>{item.sealQr}</span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-md bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800">
                    MÜHÜRLÜ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. DEV BUTONLAR KONSOLU (MIN 56PX DOKUNMATİK ERGONOMİSİ) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* 1. BUTON: İŞE BAŞLA / DURDUR (YEŞİL) */}
          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={cn(
              "min-h-[64px] p-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl border",
              isTimerRunning
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500/50"
                : "bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800"
            )}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-6 h-6 shrink-0" />
                <span>İŞÇİLİK SAYIYOR</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 shrink-0" />
                <span>İŞE BAŞLA</span>
              </>
            )}
          </button>

          {/* 2. BUTON: PARÇA TALEP ET / BARKOD OKUT (TURUNCU) */}
          <button
            type="button"
            onClick={() => setIsPartsModalOpen(true)}
            className="min-h-[64px] p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl border border-amber-400"
          >
            <PackagePlus className="w-6 h-6 shrink-0" />
            <span>PARÇA TALEP ET</span>
          </button>

          {/* 3. BUTON: İŞİ BİTİR & TESTE SEVK ET (KIRMIZI) */}
          <button
            type="button"
            onClick={() => setIsCompleteModalOpen(true)}
            className="min-h-[64px] p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl border border-red-400"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>İŞİ BİTİR &amp; SEVK ET</span>
          </button>
        </div>
      </main>

      {/* 4. MODAL: PARÇA TALEP & CROSS-DOCK MÜHÜRLEME */}
      {isPartsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-amber-500" />
                  <span>Depodan Parça Talep Et</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Talep edilen parça {workOrder.plate} plakasına özel QR ile mühürlenir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {justSealedPart && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 mb-3 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>PARÇA BAŞARIYLA MÜHÜRLENDİ!</span>
                  </div>
                  <p className="text-xs text-emerald-300">
                    {justSealedPart.name} için termal barkod oluşturuldu: <span className="font-mono font-bold text-white">{justSealedPart.sealQr}</span>
                  </p>
                </div>
              )}

              <div className="text-xs font-bold text-slate-400 mb-1">
                Hazır Şablon Parçaları:
              </div>

              {MICROMOBILITY_PARTS_SEED.map((part) => (
                <div
                  key={part.oem}
                  className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-100">{part.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Kod: {part.oem} • Kategori: {part.category}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfirmPartRequest(part)}
                    className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all active:scale-95 shadow-md"
                  >
                    Talep Et
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: İŞİ BİTİR & GÜVENLİK KONTROL LİSTESİ */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-red-500" />
                <h3 className="font-black text-lg text-white">İşi Bitir &amp; Sevk Et</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {workOrder.plate} {workOrder.brandModel} aracını teslime göndermeden önce son güvenlik kontrollerini teyit edin:
            </p>

            <div className="space-y-2">
              {[
                { key: "oilChanged", label: "1L Castrol/Motul 10W-40 Motor Yağı Konuldu" },
                { key: "sparkPlugChecked", label: "Buji Temizlendi & Tırnak Boşluğu Ayarlandı" },
                { key: "tirePsiAdjusted", label: "Lastik Basınçları Tamamlandı (Ön 29 / Arka 33 PSI)" },
                { key: "variatorChecked", label: "Tahrik Kayışı & Bagalar Monte Edildi" },
                { key: "brakesTested", label: "Ön & Arka Fren Boşluğu ve E-ABS Test Edildi" },
              ].map(({ key, label }) => {
                const checked = (checklist as any)[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setChecklist((prev) => ({
                        ...prev,
                        [key]: !checked,
                      }))
                    }
                    className={cn(
                      "w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all",
                      checked
                        ? "bg-emerald-950/70 border-emerald-600 text-emerald-200"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    )}
                  >
                    <span>{label}</span>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center",
                        checked ? "bg-emerald-500 text-white" : "border border-slate-700"
                      )}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleFinalizeWorkOrder}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
              >
                ONAYLA &amp; BİTİR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alt Bilgi Barı */}
      <footer className="border-t border-slate-900 px-4 py-2 text-center text-[11px] text-slate-500">
        HiServis AI • Lift 1 Ahmet Usta Terminali • Sıfır Maliyet / Gizli Ciro Korumalı
      </footer>
    </div>
  );
}
