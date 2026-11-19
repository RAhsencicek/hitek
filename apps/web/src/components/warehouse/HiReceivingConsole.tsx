"use client";

import React, { useState, useEffect } from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import { HiStatusBadge } from "@/components/ui/HiStatusBadge";
import { HiSealedLabelModal } from "@/components/warehouse/HiSealedLabelModal";
import {
  Barcode,
  Search,
  PackageCheck,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient, PartMatchCandidate, AllocatePartResponse } from "@/lib/api";

export const HiReceivingConsole: React.FC = () => {
  const [barcodeInput, setBarcodeInput] = useState<string>("4047024185242");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<PartMatchCandidate[]>([]);
  const [searchedBarcode, setSearchedBarcode] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<PartMatchCandidate | null>(null);

  // Allocation & Modal State
  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [labelModalOpen, setLabelModalOpen] = useState<boolean>(false);
  const [printedLabelData, setPrintedLabelData] = useState<AllocatePartResponse | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Search on initial load with the test barcode from TEST-WAREHOUSE-01
  useEffect(() => {
    handleSearch("4047024185242");
  }, []);

  const handleSearch = async (ean: string) => {
    if (!ean.trim()) return;
    setIsSearching(true);
    setSearchedBarcode(ean.trim());
    try {
      const results = await apiClient.matchWarehouseRequests(ean.trim());
      setCandidates(results);
      if (results.length > 0) {
        setSelectedCandidate(results[0]);
      } else {
        setSelectedCandidate(null);
      }
    } catch {
      setCandidates([]);
      setSelectedCandidate(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAllocate = async (candidate: PartMatchCandidate) => {
    setIsAllocating(true);
    try {
      const res = await apiClient.allocatePart({
        partRequestId: candidate.partRequestId,
        scannedBarcode: searchedBarcode || candidate.partSku,
        printLabelImmediately: true,
      });

      setPrintedLabelData(res);
      setLabelModalOpen(true);
      setNotification(`✅ Parça ${candidate.plate} plakalı araca tahsis edildi! Mühür basıldı.`);

      // Update candidate list to mark allocated
      setCandidates((prev) =>
        prev.map((c) =>
          c.partRequestId === candidate.partRequestId
            ? { ...c, allocatedQuantity: Math.min(c.requestedQuantity, c.allocatedQuantity + 1) }
            : c
        )
      );

      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert("Hata: " + (err.message || "Tahsis yapılamadı"));
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Üst Başlık & Donanım Durumu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shrink-0">
            <Barcode className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">Konsolide Mal Kabul &amp; Parça Eşleştirme</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Faz 2 Modül 3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kutudaki genel EAN barkodunu okutarak açık iş emirlerine tahsis edin ve mühür basın.
            </p>
          </div>
        </div>

        {/* Termal Yazıcı Bağlantı Durumu */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-xs shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <Printer className="w-4 h-4 text-slate-300" />
          <span className="font-semibold text-slate-200">Termal Yazıcı (50x30mm):</span>
          <span className="text-emerald-400 font-bold">Çevrimiçi</span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* BARKOD TARAMA & GİRİŞ ALANI */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-600" />
            <span>El Terminali / Kamera Barkod Girişi:</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">EAN-13 / OEM Referans</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(barcodeInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Kutudaki üretici EAN barkodunu girin veya okutun..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
            />
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>

          <HiButton56
            leftIcon={<Search className="w-5 h-5" />}
            type="submit"
            disabled={isSearching}
            className="sm:w-56"
          >
            {isSearching ? "Aranıyor..." : "İş Emirlerini Eşle"}
          </HiButton56>
        </form>

        {/* Hızlı Test Barkodları Butonları */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-semibold">Test Kılavuzu Barkodları:</span>
          <button
            type="button"
            onClick={() => {
              setBarcodeInput("4047024185242");
              handleSearch("4047024185242");
            }}
            className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-200 dark:border-blue-900 transition-colors"
          >
            4047024185242 (Bosch Balata)
          </button>
          <button
            type="button"
            onClick={() => {
              setBarcodeInput("0242236565");
              handleSearch("0242236565");
            }}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono font-bold text-[11px] border border-slate-300 dark:border-slate-700 transition-colors"
          >
            0242236565 (Bosch Buji)
          </button>
        </div>
      </div>

      {/* EŞLEŞEN AÇIK İŞ EMİRLERİ HAVUZU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Bu Parçayı Bekleyen Açık Araçlar ({candidates.length})
            </h2>
            <span className="text-xs text-slate-400">Aciliyet Sırasına Göre Dizildi</span>
          </div>
          {searchedBarcode && (
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              Barkod: {searchedBarcode}
            </span>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <PackageCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Bu barkod için bekleyen parça talebi bulunamadı
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Okutulan barkod hiçbir açık iş emrindeki bekleyen buji, balata veya filtre talebiyle eşleşmedi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {candidates.map((cand, index) => {
              const isAllocated = cand.allocatedQuantity >= cand.requestedQuantity;
              return (
                <div
                  key={cand.partRequestId}
                  className={cn(
                    "p-5 rounded-3xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm",
                    cand.isUrgent
                      ? "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 ring-1 ring-red-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    isAllocated && "opacity-60 bg-emerald-50/30"
                  )}
                >
                  {/* Sol Bilgiler */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <HiPlateBadge plate={cand.plate} size="md" />
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        #{cand.workOrderNumber}
                      </span>
                      {cand.isUrgent ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
                          <span>🔴 ACİL</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Normal Sıra
                        </span>
                      )}
                      {isAllocated && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tahsis Edildi</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {cand.vehicleDescription} • {cand.customerName}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          Talep: {cand.partName}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">SKU: {cand.partSku}</span>
                        <span>•</span>
                        <span>İstasyon: {cand.bayName || "Lift Bekliyor"}</span>
                        {cand.technicianName && (
                          <>
                            <span>•</span>
                            <span>Usta: {cand.technicianName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Aksiyon: Tahsis Et & Mühür Bas */}
                  <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      disabled={isAllocating || isAllocated}
                      onClick={() => handleAllocate(cand)}
                      className={cn(
                        "w-full md:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95",
                        isAllocated
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400"
                          : cand.isUrgent
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      )}
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isAllocated ? "Mühürlendi" : "Bu Araca Tahsis Et & Mühür Bas"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MÜHÜRLÜ TERMAL ETİKET CANLI MODALI */}
      <HiSealedLabelModal
        isOpen={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        labelData={printedLabelData}
      />
    </div>
  );
};
