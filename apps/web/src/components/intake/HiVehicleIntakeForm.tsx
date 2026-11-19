"use client";

import React, { useState, useEffect } from "react";
import { HiPlateBadge, formatTurkishPlate } from "@/components/ui/HiPlateBadge";
import { HiAssetBadge } from "@/components/ui/HiAssetBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import { HiNumpad } from "@/components/ui/HiNumpad";
import { HiDamageInspection, DamageMarker } from "@/components/ui/HiDamageInspection";
import { HiReceiptModal } from "@/components/receipt/HiReceiptModal";
import { useSector } from "@/lib/SectorContext";
import {
  Camera,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Fuel,
  User,
  Phone,
  AlertTriangle,
  History,
  Car,
  Wrench,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export interface PastServiceRecord {
  id: string;
  date: string;
  workOrderNumber: string;
  meter: number;
  complaint: string;
  totalAmount: number;
}

export const HiVehicleIntakeForm: React.FC = () => {
  const { config, sector } = useSector();

  // Form State
  const [plate, setPlate] = useState("34 ABC 123");
  const [vin, setVin] = useState("WVWZZZ3CZWE104921");
  const [brand, setBrand] = useState("Volkswagen");
  const [model, setModel] = useState("Passat 1.6 TDI Comfortline");
  const [modelYear, setModelYear] = useState(2021);
  const [tsbCode, setTsbCode] = useState("1531245");
  const [meter, setMeter] = useState(145200);
  const [customerName, setCustomerName] = useState("Mehmet Yılmaz");
  const [customerPhone, setCustomerPhone] = useState("0532 999 8877");
  const [complaint, setComplaint] = useState("Ön takımdan kasislerde gıcırtı ve frene basınca titreme geliyor.");
  const [fuelLevel, setFuelLevel] = useState<number>(0.5);
  const [priority, setPriority] = useState<string>("Urgent");
  const [selectedBay, setSelectedBay] = useState<string>("LIFT-1");
  const [industrialInspection, setIndustrialInspection] = useState<Record<string, "pass" | "attention" | "fail">>({});
  const [damageMarkers, setDamageMarkers] = useState<DamageMarker[]>([
    {
      id: "dmg-1",
      zone: "FrontBumper",
      zoneName: "Ön Tampon",
      damageType: "scratch",
      xPercent: 50,
      yPercent: 12,
      notes: "Kaldırıma hafif sürtme",
    },
  ]);

  // Sektör Değiştiğinde Formu Dinamik Güncelle
  useEffect(() => {
    if (sector !== "automotive" && config.demoSamples.length > 0) {
      const sample = config.demoSamples[0];
      setPlate(sample.primaryId);
      setVin(sample.secondaryId);
      setBrand(sample.brand);
      setModel(sample.model);
      setModelYear(sample.modelYear);
      setMeter(sample.meter);
      setCustomerName(sample.customerName);
      setCustomerPhone(sample.customerPhone);
      setComplaint(sample.complaint);
      if (config.bayStations.length > 0) {
        setSelectedBay(config.bayStations[0].id);
      }
      setIsRecognized(true);
      setOutstandingBalance(0);
      setPastServices([]);
      setOcrSuccessMsg(null);
    } else if (sector === "automotive") {
      setPlate("34 ABC 123");
      setVin("WVWZZZ3CZWE104921");
      setBrand("Volkswagen");
      setModel("Passat 1.6 TDI Comfortline");
      setModelYear(2021);
      setTsbCode("1531245");
      setMeter(145200);
      setCustomerName("Mehmet Yılmaz");
      setCustomerPhone("0532 999 8877");
      setComplaint("Ön takımdan kasislerde gıcırtı ve frene basınca titreme geliyor.");
      setSelectedBay("LIFT-1");
      setIsRecognized(true);
    }
  }, [sector, config]);

  // Lookup / OCR UI states
  const [isRecognized, setIsRecognized] = useState<boolean>(true);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);
  const [pastServices, setPastServices] = useState<PastServiceRecord[]>([
    {
      id: "wo-prev-1",
      date: "12 Ekim 2025",
      workOrderNumber: "WO-2025-08112",
      meter: 130100,
      complaint: "130.000 KM Periyodik Bakım + Arka Balata",
      totalAmount: 3850,
    },
    {
      id: "wo-prev-2",
      date: "14 Nisan 2025",
      workOrderNumber: "WO-2025-04290",
      meter: 115400,
      complaint: "Klima gaz dolumu ve polen filtre değişimi",
      totalAmount: 1450,
    },
  ]);

  const [showNumpad, setShowNumpad] = useState<boolean>(false);
  const [isScanningPlate, setIsScanningPlate] = useState<boolean>(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  // Success / Receipt Modal
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [createdWoNumber, setCreatedWoNumber] = useState<string>("WO-2026-10493");

  // Presets for rapid demo testing
  const handleSelectPreset = (presetPlate: string) => {
    const formatted = formatTurkishPlate(presetPlate);
    setPlate(formatted);

    if (presetPlate.includes("34 ABC")) {
      setIsRecognized(true);
      setBrand("Volkswagen");
      setModel("Passat 1.6 TDI Comfortline");
      setModelYear(2021);
      setVin("WVWZZZ3CZWE104921");
      setTsbCode("1531245");
      setMeter(145200);
      setCustomerName("Mehmet Yılmaz");
      setCustomerPhone("0532 999 8877");
      setOutstandingBalance(0);
      setComplaint("Ön takımdan kasislerde gıcırtı ve frene basınca titreme geliyor.");
      setOcrSuccessMsg(null);
    } else if (presetPlate.includes("06 BCD")) {
      setIsRecognized(true);
      setBrand("Renault");
      setModel("Megane 1.5 Blue dCi Icon");
      setModelYear(2020);
      setVin("VF1RFB00858921045");
      setTsbCode("1042301");
      setMeter(89450);
      setCustomerName("Ayşe Demir");
      setCustomerPhone("0533 111 2233");
      setOutstandingBalance(1200);
      setComplaint("Periyodik yağ ve filtre bakımı, silecek değişimi.");
      setOcrSuccessMsg(null);
    } else {
      // New vehicle (35 CDE 789)
      setIsRecognized(false);
      setBrand("");
      setModel("");
      setModelYear(2022);
      setVin("");
      setTsbCode("");
      setMeter(42100);
      setCustomerName("Burak Kaya");
      setCustomerPhone("0535 777 8899");
      setOutstandingBalance(0);
      setPastServices([]);
      setComplaint("Frenlerden ses geliyor, 40.000 bakımı yapılacak.");
      setOcrSuccessMsg(null);
    }
  };

  // Sektöre Göre Hızlı Kamera / Barkod / QR Tarama Simülasyonu (< 300ms)
  const handleScanPlateCamera = () => {
    setIsScanningPlate(true);
    setTimeout(() => {
      if (sector === "automotive") {
        setPlate("34 ABC 123");
        handleSelectPreset("34 ABC 123");
      } else if (config.demoSamples.length > 0) {
        const sample = config.demoSamples[0];
        setPlate(sample.primaryId);
        setVin(sample.secondaryId);
        setBrand(sample.brand);
        setModel(sample.model);
        setModelYear(sample.modelYear);
        setMeter(sample.meter);
        setCustomerName(sample.customerName);
        setCustomerPhone(sample.customerPhone);
        setComplaint(sample.complaint);
        setIsRecognized(true);
      }
      setIsScanningPlate(false);
      setOcrSuccessMsg(config.scanActions?.cameraSuccessMsg || "Kamera taraması tamamlandı");
    }, 280);
  };

  // Sektöre Göre Resmi Katalog / Ruhsat / Künye OCR Eşleştirme Simülasyonu
  const handleRuhsatOcrSimulation = () => {
    setIsProcessingOcr(true);
    setTimeout(() => {
      const rec = config.sampleRecognition;
      if (rec) {
        setPlate(rec.primaryId);
        setVin(rec.secondaryId);
        setBrand(rec.brand);
        setModel(rec.model);
        setModelYear(rec.modelYear);
        setTsbCode(rec.technicalCode);
        setMeter(rec.meter);
        setCustomerName(rec.customerName);
        setCustomerPhone(rec.customerPhone);
      } else {
        setPlate("35 CDE 789");
        setVin("NMTEB3BE30R109823");
        setBrand("Toyota");
        setModel("Corolla 1.8 Hybrid Dream e-CVT");
        setModelYear(2022);
        setTsbCode("2081190");
        setMeter(42100);
        setCustomerName("Burak Kaya");
        setCustomerPhone("0535 777 8899");
      }
      setIsRecognized(true);
      setIsProcessingOcr(false);
      setOcrSuccessMsg(config.scanActions?.catalogSuccessMsg || "Katalog eşleşmesi tamamlandı");
    }, 450);
  };

  // Submit Intake
  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const newWo = `WO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setCreatedWoNumber(newWo);
    setIsReceiptOpen(true);

    // Asynchronously synchronize with backend API
    apiClient.createIntake({
      asset: {
        plateNumber: plate,
        vin,
        brand,
        model,
        modelYear,
        tsbCode,
        currentMeter: meter,
      },
      customer: {
        fullName: customerName,
        phone: customerPhone,
      },
      intakeDetails: {
        intakeMeter: meter,
        customerComplaint: complaint,
        fuelLevelRatio: fuelLevel,
        damageInspectionMarkers: damageMarkers.map((m) => ({
          zone: m.zone,
          damageType: m.damageType,
          photoUrl: m.photoUrl,
          xPercent: m.xPercent,
          yPercent: m.yPercent,
          notes: m.notes,
        })),
      },
      priority,
    }).catch(() => {});
  };

  const COMPLAINT_PRESETS = [
    "10.000 KM Periyodik Bakım",
    "Frenlerden ötme sesi geliyor",
    "Klima soğutmuyor, gaz kontrolü",
    "Motor arıza lambası yanıyor",
    "Kasislerde ön takımdan lokurtu sesi",
    "Debriyaj kaçırıyor / vites geçişi sert",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Başlık ve Hızlı Eylemler */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {config.intakeTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {config.intakeSubtitle}
          </p>
        </div>

        {/* Demo Hızlı Şablon Butonları */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Demo Şablonlar:</span>
          {sector === "automotive" ? (
            <>
              <button
                type="button"
                onClick={() => handleSelectPreset("34 ABC 123")}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors"
              >
                34 ABC 123 (Passat)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("06 BCD 456")}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors"
              >
                06 BCD 456 (Megane)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset("35 CDE 789")}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
              >
                35 CDE 789 (Yeni Araç)
              </button>
            </>
          ) : (
            config.demoSamples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setPlate(sample.primaryId);
                  setVin(sample.secondaryId);
                  setBrand(sample.brand);
                  setModel(sample.model);
                  setModelYear(sample.modelYear);
                  setMeter(sample.meter);
                  setCustomerName(sample.customerName);
                  setCustomerPhone(sample.customerPhone);
                  setComplaint(sample.complaint);
                  setIsRecognized(true);
                  setOutstandingBalance(0);
                  setPastServices([]);
                }}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
              >
                {sample.label}
              </button>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitIntake} className="space-y-6">
        {/* ADIM 1: Tanıma & Kimlik Kartı */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {sector === "automotive" ? "Araç Tanıma & Ruhsat Bilgileri" : `${config.assetTypeName} Tanımlama & Kimlik Bilgileri`}
              </h2>
            </div>

            {isRecognized ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tanınan Kayıtlı {config.assetTypeName}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Yeni {config.assetTypeName} Kaydı</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Plaka / Kimlik Giriş & Rozet Alanı */}
            <div className="md:col-span-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {config.primaryIdentifier.label}:
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="shrink-0 self-start sm:self-auto">
                  <HiAssetBadge
                    identifier={plate}
                    badgeType={config.primaryIdentifier.badgeType}
                    size="hero"
                  />
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) =>
                      setPlate(
                        config.primaryIdentifier.badgeType === "plate"
                          ? formatTurkishPlate(e.target.value)
                          : e.target.value.toUpperCase()
                      )
                    }
                    placeholder={config.primaryIdentifier.placeholder}
                    className="w-full px-3 py-2.5 text-base font-mono font-bold tracking-wider uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Kamera & Ruhsat / Künye Aksiyon Butonları */}
            <div className="md:col-span-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleScanPlateCamera}
                disabled={isScanningPlate}
                className="flex-1 min-h-[52px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>
                  {isScanningPlate
                    ? "Okunuyor (<300ms)..."
                    : config.scanActions?.cameraButton || (sector === "automotive" ? "Kameradan Plaka Tara" : "Kameradan Karekod / QR Oku")}
                </span>
              </button>

              <button
                type="button"
                onClick={handleRuhsatOcrSimulation}
                disabled={isProcessingOcr}
                className="flex-1 min-h-[52px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isProcessingOcr
                    ? "Eşleniyor..."
                    : config.scanActions?.catalogButton || (sector === "automotive" ? "Ruhsat OCR & TSB Doldur" : "Resmi Künye / Model Doldur")}
                </span>
              </button>
            </div>
          </div>

          {ocrSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{ocrSuccessMsg}</span>
            </div>
          )}

          {/* Varlık Ayrıntıları (Model & Teknik Kod Alanları) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {sector === "automotive" ? "Marka" : "Üretici / Marka"}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={sector === "automotive" ? "Örn: Volkswagen" : sector === "elevator" ? "Örn: Otis / Kone" : "Örn: Üretici Marka"}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {sector === "automotive" ? "Model / Motor" : sector === "elevator" ? "Model / Kabin Tipi" : "Model / Seri"}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={sector === "automotive" ? "Örn: Passat 1.6 TDI" : sector === "elevator" ? "Örn: Gen2 (10 Kişi / 800 kg)" : "Örn: Model Tipi"}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {sector === "automotive" ? "Model Yılı" : "İmalat / Montaj Yılı"}
              </label>
              <input
                type="number"
                value={modelYear}
                onChange={(e) => setModelYear(parseInt(e.target.value) || 2020)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {config.scanActions?.technicalCodeLabel || (sector === "automotive" ? "TSB Kasko Kodu" : "Resmi Kimlik / Kayıt No")}
              </label>
              <input
                type="text"
                value={tsbCode}
                onChange={(e) => setTsbCode(e.target.value)}
                placeholder={config.scanActions?.technicalCodePlaceholder || "1531245"}
                className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {config.secondaryIdentifier.label}
            </label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder={config.secondaryIdentifier.placeholder}
              className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Tanınan Araç İçin Eski İş Emirleri ve Cari Bakiye */}
          {isRecognized && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Geçmiş Servis Ziyaretleri ({pastServices.length})</span>
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Cari Bakiye:{" "}
                  <span className={cn(outstandingBalance > 0 ? "text-red-600" : "text-emerald-600")}>
                    {outstandingBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                  </span>
                </span>
              </div>

              {pastServices.length > 0 ? (
                <div className="space-y-1.5">
                  {pastServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {service.workOrderNumber} • {service.date}
                        </div>
                        <div className="text-[11px] text-slate-500">{service.complaint}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {service.totalAmount.toLocaleString("tr-TR")} ₺
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{service.meter.toLocaleString("tr-TR")} KM</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">Eski servis geçmişi bulunmuyor.</div>
              )}
            </div>
          )}
        </div>

        {/* ADIM 2: Kilometre & Müşteri Bilgileri */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {sector === "automotive" ? "Kilometre, Müşteri & Yakıt Durumu" : `${config.meter.label} & Müşteri Bilgileri`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kilometre / Sayaç Alanı & Dev Numpad Tetikleyici */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {sector === "automotive" ? "Güncel Araç Kilometresi (KM):" : `${config.meter.label} (${config.meter.unit}):`}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={meter}
                  onChange={(e) => setMeter(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-3 text-lg font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNumpad(!showNumpad)}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                    showNumpad
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <span>Dev Numpad</span>
                </button>
              </div>

              {/* Dev Numpad Açılır Bileşeni */}
              {showNumpad && (
                <div className="pt-2 animate-in fade-in">
                  <HiNumpad
                    initialValue={meter}
                    label={sector === "automotive" ? "Dokunmatik Kilometre Girişi" : `Dokunmatik ${config.meter.label} Girişi`}
                    unit={config.meter.unit}
                    onConfirm={(val) => {
                      setMeter(val);
                      setShowNumpad(false);
                    }}
                    onCancel={() => setShowNumpad(false)}
                  />
                </div>
              )}
            </div>

            {/* Yakıt / Enerji Seviyesi Seçici (Sadece Deposu Olan Sektörler İçin) */}
            {config.hasFuelGauge && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {sector === "automotive"
                      ? "Depo Yakıt Seviyesi:"
                      : sector === "micromobility"
                      ? "Batarya Şarj Seviyesi:"
                      : "Yakıt / Enerji Doluluk Oranı:"}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.25, 0.50, 0.75, 1.0].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setFuelLevel(ratio)}
                      className={cn(
                        "py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1",
                        fuelLevel === ratio
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <span>%{Math.round(ratio * 100)}</span>
                      <span className="text-[10px] font-normal opacity-80">
                        {ratio === 1.0 ? "Tam Dolu" : ratio === 0.5 ? "Yarım Depo" : ratio === 0.25 ? "Çeyrek" : "3/4 Dolu"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Müşteri Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Müşteri Adı Soyadı:</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Müşteri Telefon Numarası:</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0532 111 2233"
                className="w-full px-3 py-2.5 text-sm font-mono font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ADIM 3: 2D Kaporta Hasar Şeması veya Sektörel DVI Muayenesi */}
        {sector === "automotive" ? (
          <div className="space-y-2">
            <HiDamageInspection
              markers={damageMarkers}
              onChange={setDamageMarkers}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  DVI
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {config.inspectionTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sektörel muayene ve kabul öncesi teknik kontrol listesi
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.inspectionItems.map((item) => {
                const currentStatus = industrialInspection[item.id] || "pass";

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIndustrialInspection((prev) => ({ ...prev, [item.id]: "pass" }))}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                          currentStatus === "pass"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50"
                        )}
                      >
                        🟢 Sorunsuz
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndustrialInspection((prev) => ({ ...prev, [item.id]: "attention" }))}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                          currentStatus === "attention"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-amber-50"
                        )}
                      >
                        🟡 Takip Et
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndustrialInspection((prev) => ({ ...prev, [item.id]: "fail" }))}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center",
                          currentStatus === "fail"
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-red-50"
                        )}
                      >
                        🔴 Arızalı / Acil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADIM 4: Şikayet, Öncelik & Sevk */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Müşteri Şikayeti, Öncelik &amp; İstasyon Sevk
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Müşteri Şikayeti / Talep Edilen İşlemler:
            </label>
            <textarea
              rows={3}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Örn: Periyodik bakım, parça değişimi veya arıza tespiti"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            {/* Hızlı Şikayet Hapları */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(config.complaintPresets || COMPLAINT_PRESETS).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setComplaint((prev) => (prev ? `${prev}, ${preset}` : preset))}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Öncelik Seçimi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                İş Emri Öncelik Rozeti:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "Normal", label: "Normal", color: "bg-slate-100 text-slate-700 border-slate-200" },
                  { key: "Urgent", label: "🔴 Acil", color: "bg-red-50 text-red-700 border-red-200" },
                  { key: "Waiter", label: "⏳ Müşteri Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200" },
                  { key: "Vip", label: "🚙 VIP Kurumsal", color: "bg-purple-50 text-purple-700 border-purple-200" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPriority(item.key)}
                    className={cn(
                      "py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-left",
                      priority === item.key
                        ? "ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-slate-900 font-black shadow-sm"
                        : "opacity-80 hover:opacity-100",
                      item.color
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sevk İstasyonu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {sector === "automotive" ? "Doğrudan Atölye Lifte Sevk:" : "Doğrudan İstasyon / Saha Ekibine Sevk:"}
              </label>
              <div className="space-y-1.5">
                {(sector === "automotive"
                  ? [
                      { code: "LIFT-1", name: "Lift 1 (Mekanik / Ağır Bakım)", tech: "Ahmet Usta" },
                      { code: "LIFT-2", name: "Lift 2 (Periyodik Hızlı Bakım)", tech: "Can Usta" },
                      { code: "LIFT-3", name: "Lift 3 (Rot-Balans / Ön Takım)", tech: "Murat Usta" },
                    ]
                  : config.bayStations.map((b) => ({ code: b.id, name: b.name, tech: "Atanacak" }))
                ).map((bay) => (
                  <button
                    key={bay.code}
                    type="button"
                    onClick={() => setSelectedBay(bay.code)}
                    className={cn(
                      "w-full py-2 px-3 rounded-lg border text-xs flex items-center justify-between transition-all",
                      selectedBay === bay.code
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-400 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <span>{bay.name}</span>
                    <span className="text-[11px] font-normal text-slate-500">{bay.tech}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BÜYÜK KABUL TAMAMLAMA BUTONU (56px Dokunmatik Buton) */}
        <div className="pt-2">
          <HiButton56
            type="submit"
            variant="primary"
            fullWidth
            className="text-base font-bold shadow-lg shadow-blue-500/20"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>
              {sector === "automotive"
                ? "KABULÜ TAMAMLA & LİFTE SEVK ET (30s)"
                : `KABULÜ TAMAMLA & SAHAYA SEVK ET (30s)`}
            </span>
          </HiButton56>
        </div>
      </form>

      {/* Müşteri Kabul Fişi Modalı */}
      <HiReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={{
          workOrderNumber: createdWoNumber,
          plate: plate,
          brand: brand,
          model: model,
          modelYear: modelYear,
          vin: vin,
          currentMeter: meter,
          customerName: customerName,
          customerPhone: customerPhone,
          complaint: complaint,
          fuelLevelRatio: fuelLevel,
          damageMarkers: damageMarkers,
          advisorName: "Hakan Danışman",
          branchName: config.branchDefaultName,
        }}
      />
    </div>
  );
};
