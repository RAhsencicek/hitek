"use client";

import React, { useState, useEffect } from "react";
import { HiAssetBadge } from "@/components/ui/HiAssetBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import {
  ShoppingCart,
  Building2,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient, PurchaseOrderDto, PartMatchCandidate } from "@/lib/api";

export const HiProcurementPanel: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PartMatchCandidate[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("Başbuğ Oto Tic. A.Ş.");
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingPo, setIsCreatingPo] = useState<boolean>(false);

  // WhatsApp / PDF Simulation Modal
  const [activePoForExport, setActivePoForExport] = useState<PurchaseOrderDto | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pos, pendings] = await Promise.all([
        apiClient.getPurchaseOrders(),
        apiClient.getPendingPartRequests(),
      ]);
      setPurchaseOrders(pos);
      setPendingRequests(pendings);
      // Preselect all pending requests by default for rapid consolidation
      setSelectedRequestIds(pendings.map((p) => p.partRequestId));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectRequest = (id: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateConsolidatedPo = async () => {
    if (selectedRequestIds.length === 0) {
      alert("Lütfen sepete eklenecek en az bir parça talebi seçin.");
      return;
    }

    setIsCreatingPo(true);
    try {
      const chosenRequests = pendingRequests.filter((p) => selectedRequestIds.includes(p.partRequestId));
      const lines = chosenRequests.map((req) => ({
        partSku: req.partSku,
        partDescription: req.partName,
        orderedQuantity: req.requestedQuantity,
        unitPrice: 850, // default unit price estimate
        workOrderPartRequestId: req.partRequestId,
      }));

      const newPo = await apiClient.createPurchaseOrder({
        supplierName: selectedSupplier,
        supplierTaxNo: "1234567890",
        lines,
      });

      setPurchaseOrders((prev) => [newPo, ...prev]);
      // Remove consolidated requests from pool
      setPendingRequests((prev) => prev.filter((p) => !selectedRequestIds.includes(p.partRequestId)));
      setSelectedRequestIds([]);
      setActivePoForExport(newPo);
    } catch (err: any) {
      alert("PO oluşturulamadı: " + err.message);
    } finally {
      setIsCreatingPo(false);
    }
  };

  const handleReceiveLine = async (poId: string, lineId: string) => {
    try {
      await apiClient.receivePoLine(poId, lineId, 1);
      // Refresh list locally
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id !== poId) return po;
          const updatedLines = po.lines.map((l) => {
            if (l.id !== lineId) return l;
            const newRec = Math.min(l.orderedQuantity, l.receivedQuantity + 1);
            return {
              ...l,
              receivedQuantity: newRec,
              status: newRec >= l.orderedQuantity ? "Received" : "PartiallyReceived",
            };
          });
          const allRec = updatedLines.every((l) => l.receivedQuantity >= l.orderedQuantity);
          return {
            ...po,
            totalReceivedQuantity: updatedLines.reduce((acc, l) => acc + l.receivedQuantity, 0),
            status: allRec ? "Completed" : "PartialReceived",
            lines: updatedLines,
          };
        })
      );
    } catch (err: any) {
      alert("Teslim alma başarısız: " + err.message);
    }
  };

  const generateWhatsAppMessage = (po: PurchaseOrderDto) => {
    return [
      `*HiServis AI — Maslak Atatürk Oto Sanayi Şubesi*`,
      `*Satınalma Sipariş No:* #${po.poNumber}`,
      `*Tedarikçi:* ${po.supplierName}`,
      `*Tarih:* ${new Date(po.createdAt).toLocaleDateString("tr-TR")}`,
      `---------------------------------`,
      ...po.lines.map(
        (l, i) =>
          `${i + 1}. ${l.partDescription} (SKU: ${l.partSku}) - *${l.orderedQuantity} Adet* ${
            l.linkedPlate ? `[Araç: ${l.linkedPlate}]` : ""
          }`
      ),
      `---------------------------------`,
      `*Toplam Tutar:* ${po.totalAmount.toLocaleString("tr-TR")} TL`,
      `Acil kurye sevkiyatı rica ederiz. İyi çalışmalar.`,
    ].join("\n");
  };

  const handleCopyWhatsApp = (po: PurchaseOrderDto) => {
    const text = generateWhatsAppMessage(po);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 rounded-2xl shrink-0">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">Tedarikçi Sipariş &amp; Satınalma Havuzu (PO)</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                1:N Konsolide Sepet
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Farklı araçların bekleyen parça taleplerini tek bir toptancı siparişinde birleştirin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold">Toptancı:</span>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Başbuğ Oto Tic. A.Ş.">Başbuğ Oto Tic. A.Ş.</option>
            <option value="Martaş Otomotiv">Martaş Otomotiv</option>
            <option value="Dinçer Otomotiv">Dinçer Otomotiv</option>
          </select>
        </div>
      </div>

      {/* 1:N KONSOLİDE SEPET ALANI (BEKLEYEN TALEPLERDEN PO ÜRETME) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Açık Araçlardan Gelen Parça Talepleri ({pendingRequests.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sepete eklemek istediğiniz parça taleplerini seçerek tek tıkla sipariş oluşturun.
            </p>
          </div>

          <HiButton56
            leftIcon={<ShoppingCart className="w-5 h-5" />}
            onClick={handleCreateConsolidatedPo}
            disabled={isCreatingPo || selectedRequestIds.length === 0}
            className="text-xs"
          >
            {isCreatingPo ? "Oluşturuluyor..." : `Seçilenleri Sepete At & Sipariş Ver (${selectedRequestIds.length})`}
          </HiButton56>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Tüm parça talepleri toptancılara sipariş edildi veya tahsis edildi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map((req) => {
              const isSelected = selectedRequestIds.includes(req.partRequestId);
              return (
                <div
                  key={req.partRequestId}
                  onClick={() => toggleSelectRequest(req.partRequestId)}
                  className={cn(
                    "p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 select-none",
                    isSelected
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500"
                      : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <HiAssetBadge identifier={req.plate} size="sm" />
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          #{req.workOrderNumber}
                        </span>
                        {req.isUrgent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">
                            ACİL
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {req.partName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        SKU: {req.partSku} • Adet: {req.requestedQuantity}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {req.vehicleDescription}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SİPARİŞ LİSTESİ (PO HEADER & LINES - KISMİ TESLİMAT TAKİBİ) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Açık &amp; Tamamlanan Siparişler (PO Listesi)
          </h2>
          <span className="text-xs text-slate-500">Kısmi ve Tam Teslimat Göstergesi</span>
        </div>

        <div className="space-y-4">
          {purchaseOrders.map((po) => {
            const isCompleted = po.status === "Completed";
            const percent = po.totalOrderedQuantity > 0
              ? Math.round((po.totalReceivedQuantity / po.totalOrderedQuantity) * 100)
              : 0;

            return (
              <div
                key={po.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* PO Header Bilgileri */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                      #{po.poNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{po.supplierName}</span>
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : po.status === "PartialReceived"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      )}
                    >
                      {isCompleted
                        ? "Tamamlandı (100%)"
                        : po.status === "PartialReceived"
                        ? "Kısmi Teslimat"
                        : "Sipariş Verildi"}
                    </span>
                  </div>

                  {/* WhatsApp ve PDF Çıktı Butonları */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePoForExport(po)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp / PDF Mektubu</span>
                    </button>
                    <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-100">
                      {po.totalAmount.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                </div>

                {/* Teslimat İlerleme Çubuğu */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>
                      Teslimat İlerlemesi: {po.totalReceivedQuantity}/{po.totalOrderedQuantity} Parça
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">%{percent}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isCompleted ? "bg-emerald-500" : "bg-blue-600"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* PO Satırları (1:N Lines) */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase text-slate-400">Sipariş Kalemleri:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {po.lines.map((line) => {
                      const lineDone = line.receivedQuantity >= line.orderedQuantity;
                      return (
                        <div
                          key={line.id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{line.partDescription}</span>
                              {line.linkedPlate && <HiAssetBadge identifier={line.linkedPlate} size="sm" />}
                              {line.linkedWorkOrderNumber && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  #{line.linkedWorkOrderNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              SKU: {line.partSku} • Birim: {line.unitPrice.toLocaleString("tr-TR")} TL • Toplam:{" "}
                              {line.lineTotal.toLocaleString("tr-TR")} TL
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={cn(
                                "font-mono font-bold px-2 py-1 rounded-lg text-xs",
                                lineDone
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              )}
                            >
                              {line.receivedQuantity} / {line.orderedQuantity} Adet
                            </span>

                            {!lineDone && (
                              <button
                                type="button"
                                onClick={() => handleReceiveLine(po.id, line.id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors active:scale-95 shadow-sm"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Teslim Al (+1)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHATSAPP & PDF MEKTUBU SİMÜLASYON MODALI */}
      {activePoForExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-sm">Toptancı Sipariş Mektubu (WhatsApp &amp; PDF)</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePoForExport(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-500">
                Toptancı temsilcisine tek tıkla iletebileceğiniz formatlanmış sipariş mesajı:
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-slate-950 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                {generateWhatsAppMessage(activePoForExport)}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopyWhatsApp(activePoForExport)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Kopyalandı!" : "WhatsApp Mesajını Kopyala"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert("PDF Sipariş Mektubu İndirildi (Simülasyon)");
                  setActivePoForExport(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>PDF İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
