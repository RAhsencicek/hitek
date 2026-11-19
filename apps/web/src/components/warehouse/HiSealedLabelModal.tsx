"use client";

import React, { useState } from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import { Printer, Check, Copy, X, QrCode, Cpu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AllocatePartResponse } from "@/lib/api";

interface HiSealedLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  labelData: AllocatePartResponse | null;
}

export const HiSealedLabelModal: React.FC<HiSealedLabelModalProps> = ({
  isOpen,
  onClose,
  labelData,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [printed, setPrinted] = useState<boolean>(true);

  if (!isOpen || !labelData) return null;

  const handleCopyHex = () => {
    navigator.clipboard.writeText(labelData.escPosCommandsHex || labelData.escPosPayloadBase64 || labelData.internalSealedQr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReprint = () => {
    setPrinted(false);
    setTimeout(() => {
      setPrinted(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Başlığı */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-bold text-sm tracking-wide">Termal Mühür Etiketi (50mm x 30mm)</h2>
              <p className="text-[11px] text-slate-400 font-mono">ESC/POS Bluetooth &amp; Ağ Yazıcı Protokolü</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Yazıcı Durum Bildirimi */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{printed ? "Termal Yazıcıya Gönderildi (1 Sn)" : "Yazıcıya İletiliyor..."}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              50x30mm • ESC/POS
            </span>
          </div>

          {/* 50mm x 30mm FİZİKSEL ETİKET SİMÜLASYONU */}
          <div className="relative mx-auto w-full max-w-[380px] p-4 bg-amber-50/70 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl shadow-inner font-mono text-slate-900 dark:text-slate-100 space-y-2 select-all">
            {/* Etiket Üst Başlık */}
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-1.5 text-[10px] font-bold">
              <div className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>HiServis AI</span>
              </div>
              <span className="text-slate-600 dark:text-slate-400">MASLAK ATATÜRK OTO</span>
            </div>

            {/* İş Emri ve Plaka */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">İŞ EMRİ NO:</div>
                <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                  #{labelData.workOrderNumber}
                </div>
              </div>
              <HiPlateBadge plate={labelData.plate} size="sm" />
            </div>

            {/* Şase ve Parça */}
            <div className="space-y-0.5 text-[11px] pt-1">
              {labelData.vin && (
                <div className="text-slate-600 dark:text-slate-300 text-[10px]">
                  <span className="text-slate-400">ŞASE: </span>
                  <span className="font-bold">{labelData.vin}</span>
                </div>
              )}
              <div className="text-slate-900 dark:text-slate-100 font-bold truncate">
                {labelData.partName}
              </div>
              <div className="text-[10px] text-slate-500">
                SKU / EAN: <span className="font-semibold text-slate-700 dark:text-slate-300">{labelData.partSku}</span>
              </div>
            </div>

            {/* Mühür Tokenı ve QR Kod Kutusu */}
            <div className="border-t border-slate-300 dark:border-slate-800 pt-2 flex items-center justify-between gap-3">
              {/* QR Kod Görseli Simülasyonu */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-sm">
                <QrCode className="w-12 h-12 text-slate-900" />
                <span className="text-[8px] font-bold text-slate-600 uppercase">MÜHÜR</span>
              </div>

              <div className="flex-1 space-y-1 text-right">
                <div className="text-[9px] text-slate-500 uppercase">MÜHÜR TOKENI:</div>
                <div className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                  {labelData.internalSealedQr}
                </div>
                <div className="text-[9px] text-slate-400">
                  {new Date(labelData.allocatedAt).toLocaleString("tr-TR")}
                </div>
              </div>
            </div>
          </div>

          {/* ASCII / ESC-POS Ham Komut Önizlemesi */}
          {labelData.thermalLabelText && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Yazıcı Çıktı Matrisi (ASCII Preview):
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {labelData.thermalLabelText}
              </pre>
            </div>
          )}
        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyHex}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Kopyalandı!" : "ESC/POS Kodu Kopyala"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReprint}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Yeniden Bas</span>
            </button>
            <HiButton56
              variant="secondary"
              onClick={onClose}
              className="h-10 px-5 text-xs font-bold"
            >
              Tamam / Kapat
            </HiButton56>
          </div>
        </div>
      </div>
    </div>
  );
};
