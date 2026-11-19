"use client";

import React from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { DamageMarker } from "@/components/ui/HiDamageInspection";
import { X, Printer, CheckCircle2, QrCode } from "lucide-react";

export interface HiReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    workOrderNumber: string;
    intakeDate?: string;
    plate: string;
    brand: string;
    model: string;
    modelYear?: number;
    vin?: string;
    currentMeter: number;
    customerName: string;
    customerPhone: string;
    complaint?: string;
    fuelLevelRatio?: number;
    damageMarkers?: DamageMarker[];
    advisorName?: string;
    branchName?: string;
  };
}

export const HiReceiptModal: React.FC<HiReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = data.intakeDate
    ? new Date(data.intakeDate).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })
    : new Date().toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:max-w-full">
        {/* Header - Screen only buttons */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden mb-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Araç Kabul Fişi Oluşturuldu</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="print:text-black">
          {/* Fiş Üst Anteti */}
          <div className="flex items-start justify-between border-b pb-4 mb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-blue-600">HiServis AI</h2>
              <p className="text-xs text-slate-500 font-medium">{data.branchName || "Maslak Atatürk Oto Sanayi Şubesi"}</p>
              <p className="text-[11px] text-slate-400">Tel: 0212 555 0101 • info@hiservis.ai</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">HIZLI ARAÇ KABUL FİŞİ</div>
              <div className="text-sm font-mono font-black text-blue-700 dark:text-blue-400">{data.workOrderNumber}</div>
              <div className="text-[11px] text-slate-500">{formattedDate}</div>
            </div>
          </div>

          {/* Araç ve Müşteri Özeti */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Araç Bilgileri</div>
              <div className="mb-2">
                <HiPlateBadge plate={data.plate} size="md" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {data.brand} {data.model} {data.modelYear ? `(${data.modelYear})` : ""}
              </div>
              {data.vin && <div className="text-[10px] font-mono text-slate-500">Şase: {data.vin}</div>}
              <div className="text-xs font-semibold text-blue-600 mt-1">
                Giriş KM: {data.currentMeter.toLocaleString("tr-TR")} KM
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Müşteri Bilgileri</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{data.customerName}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">{data.customerPhone}</div>
              <div className="mt-2 text-[11px] text-slate-500">
                Yakıt Seviyesi: %{Math.round((data.fuelLevelRatio ?? 0.5) * 100)}
              </div>
              <div className="text-[11px] text-slate-500">
                Danışman: {data.advisorName || "Hakan Danışman"}
              </div>
            </div>
          </div>

          {/* Şikayet Alanı */}
          <div className="mb-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Müşteri Şikayeti / Talep:</div>
            <div className="text-xs text-slate-800 dark:text-slate-200 italic font-medium">
              &quot;{data.complaint || "Genel periyodik kontrol ve bakım"}&quot;
            </div>
          </div>

          {/* Kaporta Hasar Tespitleri */}
          <div className="mb-5">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Giriş Anı Kaporta Hasar Tespitleri:</span>
              <span className="text-[10px] font-normal text-slate-400">
                {data.damageMarkers?.length ? `${data.damageMarkers.length} adet hasar kayıtlı` : "Hasarsız"}
              </span>
            </div>

            {(!data.damageMarkers || data.damageMarkers.length === 0) ? (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100">
                Girişte göze çarpan harici kaporta hasarı tespit edilmedi.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.damageMarkers.map((m, idx) => (
                  <div key={m.id || idx} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 mr-1.5">#{idx + 1}</span>
                      <span>{m.zoneName}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-200 dark:bg-slate-700">
                      {m.damageType === "scratch" ? "Çizik" : m.damageType === "dent" ? "Göçük" : "Boya"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Kod ve Sihirli Link Bilgisi */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 mb-5">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shrink-0 border border-blue-200">
              <QrCode className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-blue-900 dark:text-blue-200">Müşteri Canlı Takip Sihirli Linki</div>
              <div className="text-blue-700 dark:text-blue-400 font-mono text-[11px] break-all">
                https://hiservis.link/{data.workOrderNumber.toLowerCase()}
              </div>
              <div className="text-[10px] text-blue-600/80 dark:text-blue-300 mt-0.5">
                Kameranızla QR kodu okutarak servis adımlarını canlı takip edebilirsiniz.
              </div>
            </div>
          </div>

          {/* İmza Blokları */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <div>
              <div className="text-slate-500 mb-8 font-medium">Teslim Eden (Müşteri)</div>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[11px] text-slate-400">
                İmza: _______________________
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-8 font-medium">Teslim Alan (Servis Danışmanı)</div>
              <div className="border-t border-dashed border-slate-300 pt-1 text-[11px] text-slate-400">
                İmza: _______________________
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
