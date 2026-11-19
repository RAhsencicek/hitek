"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserCheck,
  Package,
  Wrench,
  Check,
  Send,
  Building2,
  FileText,
  HelpCircle,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSector } from "@/lib/SectorContext";
import {
  apiClient,
  QuarantineIncidentDto,
  ResolveQuarantineRequest
} from "@/lib/api";

type FilterStatus = "all" | "PendingReview" | "ResolvedByManager";

export const HiQuarantineConsole: React.FC = () => {
  const { config } = useSector();
  const [incidents, setIncidents] = useState<QuarantineIncidentDto[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("PendingReview");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});
  const [offlineSimulated, setOfflineSimulated] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getQuarantineIncidents();
      setIncidents(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleSimulateConflict = async () => {
    setSimulating(true);
    try {
      const res = await apiClient.simulateQuarantineConflict();
      setNotification({
        type: "success",
        message: `${res.workOrderNumber} için ofis/saha çakışması simüle edildi ve karantinaya alındı!`
      });
      await fetchIncidents();
      setFilter("PendingReview");
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Simülasyon başlatılamadı."
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleResolve = async (
    incidentId: string,
    action: ResolveQuarantineRequest["resolutionAction"]
  ) => {
    setActionLoadingId(incidentId);
    try {
      const note = managerNotes[incidentId] || "";
      const res = await apiClient.resolveQuarantineIncident(incidentId, {
        resolutionAction: action,
        managerNotes: note,
      });

      setNotification({
        type: "success",
        message: res.message,
      });

      // Switch filter to show resolved item with audit stamp
      setFilter("all");

      // Update local state
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId
            ? {
                ...inc,
                resolutionStatus: "ResolvedByManager",
                resolutionAction: action,
                managerNotes: note || (action === "AcceptClientState" ? "Saha onaylandı" : "Ofis korundu"),
                resolvedAt: new Date().toISOString(),
                resolvedByUserName: "Servis Müdürü (Hakan Danışman)",
              }
            : inc
        )
      );
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Hakemlik kararı kaydedilemedi.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === "all") return true;
    return inc.resolutionStatus.toLowerCase() === filter.toLowerCase();
  });

  const pendingCount = incidents.filter(
    (i) => i.resolutionStatus === "PendingReview"
  ).length;
  const resolvedCount = incidents.filter(
    (i) => i.resolutionStatus === "ResolvedByManager"
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAŞLIK & KONTROL PANELİ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Karantina Çakışma Yönetimi & Hakemlik Konsolu
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Faz 3 Canlı
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bodrum katı / sinyalsiz sahadan gelen çevrimdışı (Drift SQLite) mutasyonlar ile ofis kararları arasındaki çakışmaları inceleyin ve karara bağlayın.
                </p>
              </div>
            </div>
          </div>

          {/* Aksiyonlar: Yenile & Çakışma Simülasyonu */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchIncidents}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span>Yenile</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateConflict}
              disabled={simulating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-98"
            >
              <AlertTriangle className={cn("w-4 h-4", simulating && "animate-bounce")} />
              <span>{simulating ? "Simüle Ediliyor..." : "Çakışma Simüle Et"}</span>
            </button>
          </div>
        </div>

        {/* 2. ÇEVRİMDİŞİ (BODRUM KATI) ÇALIŞMA SİMÜLATÖRÜ BANNERI */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
                offlineSimulated
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {offlineSimulated ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{offlineSimulated ? "Bodrum Katı / Çevrimdışı Mod Aktif" : "Saha Cihazları Çevrimiçi (Canlı Sync)"}</span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-md",
                    offlineSimulated
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  )}
                >
                  {offlineSimulated ? "Drift SQLite Kuyrukluyor" : "HLC Monotonik Senkron"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {offlineSimulated
                  ? "Teknisyen tableti internet kesikken yapılan işleri yerel SQLite veri tabanında saklar. Bağlantı kurulduğunda mutasyonlar tek paket halinde sunucuya gönderilir."
                  : "Mobil teknisyen tableti ve merkez sunucu saat farkı (skew) bağımsız Hybrid Logical Clock (HLC) ile mutabık kalmaktadır."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOfflineSimulated(!offlineSimulated)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border select-none",
              offlineSimulated
                ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            {offlineSimulated ? "📡 Çevrimiçine Dön & Senkronize Et" : "📶 Bodrum Katına İn (Çevrimdışı Simüle Et)"}
          </button>
        </div>
      </div>

      {/* BİLDİRİM BANNERI */}
      {notification && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs transition-all",
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800"
          )}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. FİLTRELEME SEKMELERİ & SAYI ROZETLERİ */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("PendingReview")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
              filter === "PendingReview"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <span>İnceleme Bekleyenler</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                filter === "PendingReview" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              )}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("ResolvedByManager")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
              filter === "ResolvedByManager"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <span>Çözümlenen Olaylar</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                filter === "ResolvedByManager" ? "bg-blue-800 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              {resolvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-bold transition-all",
              filter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Tümü ({incidents.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          {filteredIncidents.length} vaka listeleniyor
        </span>
      </div>

      {/* 4. ÇAKIŞMA VAKALARI LİSTESİ */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Bekleyen Karantina Çakışması Yok!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tüm ofis ve saha mutasyonları uyumlu şekilde senkronize edildi. Gerçekçi bir senaryo test etmek için yukarıdaki &quot;Çakışma Simüle Et&quot; butonuna basabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredIncidents.map((incident) => {
            let serverState: any = {};
            let clientState: any = {};
            try {
              serverState = JSON.parse(incident.serverStateJson);
            } catch {
              serverState = { raw: incident.serverStateJson };
            }
            try {
              clientState = JSON.parse(incident.clientStateJson);
            } catch {
              clientState = { raw: incident.clientStateJson };
            }

            const isPending = incident.resolutionStatus === "PendingReview";
            const isActing = actionLoadingId === incident.id;

            return (
              <div
                key={incident.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl border transition-all shadow-xs overflow-hidden",
                  isPending
                    ? "border-amber-300 dark:border-amber-700/60 shadow-amber-500/5 ring-1 ring-amber-400/20"
                    : "border-slate-200 dark:border-slate-800 opacity-90"
                )}
              >
                {/* Kart Üst Bilgi Başlığı */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-black tracking-wider">
                      {incident.workOrderNumber}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-slate-400">Varlık / Plaka:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
                        {incident.assetIdentifier}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Çakışma: Ofis İptal vs Saha Tamamlandı
                    </span>

                    <span
                      className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-full",
                        isPending
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      )}
                    >
                      {isPending ? "Hakem Kararı Bekleniyor" : `Çözümlendi (${incident.resolutionAction})`}
                    </span>
                  </div>
                </div>

                {/* YAN YANA KARŞILAŞTIRMA (OFİS VS SAHA) */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SOL: OFİS DANIŞMANI (SUNUCU KAYDI) */}
                  <div className="rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <h4 className="font-black text-sm text-rose-900 dark:text-rose-200 tracking-tight">
                          1. OFİS SERVİS DANIŞMANI (Sunucu Kararı)
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100">
                        {serverState.Status || "Cancelled"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-900/30">
                        <span className="text-slate-500 dark:text-slate-400">İş Emri Durumu:</span>
                        <span className="font-bold text-rose-700 dark:text-rose-300">İPTAL EDİLDİ (Cancelled)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-900/30">
                        <span className="text-slate-500 dark:text-slate-400">İptal Gerekçesi:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {serverState.CancelledReason || "Müşteri vazgeçtiğini bildirdi, işlem durduruldu."}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-rose-100 dark:border-rose-900/30">
                        <span className="text-slate-500 dark:text-slate-400">Kayıtlı Tutar:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₺{Number(serverState.GrandTotal || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 dark:text-slate-400">İptal Zamanı:</span>
                        <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {serverState.UpdatedAt ? new Date(serverState.UpdatedAt).toLocaleTimeString("tr-TR") : "10 dk önce"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SAĞ: SAHA TEKNİSYENİ (DRIFT SQLITE / ÇEVRİMDİŞİ MUTASYON) */}
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200 tracking-tight">
                          2. SAHA TEKNİSYENİ (Drift SQLite Çevrimdışı)
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                        {clientState.status || "Completed"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-slate-500 dark:text-slate-400">Teknisyen / Usta:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          {clientState.completedBy || "Ahmet Usta (LIFT-1)"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-slate-500 dark:text-slate-400">Fiili İşçilik Süresi:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {clientState.elapsedSeconds ? `${Math.round(clientState.elapsedSeconds / 60)} dakika` : "80 dakika"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-slate-500 dark:text-slate-400">Takılan Parçalar:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {clientState.installedParts && clientState.installedParts.length > 0
                            ? clientState.installedParts.map((p: any) => `${p.partName} (${p.quantity} adet)`).join(", ")
                            : "Bosch Ön Fren Balata Takımı (1 adet)"}
                        </span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Usta Saha Notu:</span>
                        <span className="italic text-slate-700 dark:text-slate-300">
                          &quot;{clientState.technicianNotes || "Bodrum katında internet yokken parçalar monte edildi ve işlem bitirildi."}&quot;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SERVİS MÜDÜRÜ HAKEMLİK KARARI VE 56PX AKSİYON BUTONLARI */}
                <div className="px-6 pb-6 pt-2 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                  {isPending ? (
                    <div className="space-y-4">
                      {/* Müdür Gerekçe Notu Girişi */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Servis Müdürü Hakemlik Gerekçesi (İsteğe Bağlı)
                        </label>
                        <input
                          type="text"
                          value={managerNotes[incident.id] || ""}
                          onChange={(e) =>
                            setManagerNotes({
                              ...managerNotes,
                              [incident.id]: e.target.value,
                            })
                          }
                          placeholder="Örn: Müşteri ile telefon görüşmesi yapıldı, usta müdahalesi onaylandı..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* 3 Hakemlik Butonu (Min 56px Yükseklik / Ergonomik) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. SAHAYI ONAYLA */}
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleResolve(incident.id, "AcceptClientState")}
                          className="h-14 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <div className="text-left">
                            <div className="leading-tight">SAHAYI ONAYLA</div>
                            <div className="text-[10px] font-normal opacity-90">İşçilik & Parça Kabul Edilsin</div>
                          </div>
                        </button>

                        {/* 2. OFİSİ KORU */}
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleResolve(incident.id, "AcceptServerState")}
                          className="h-14 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5 shrink-0" />
                          <div className="text-left">
                            <div className="leading-tight">OFİSİ KORU (İPTAL ET)</div>
                            <div className="text-[10px] font-normal opacity-90">Parçayı Depoya İadeye Çek</div>
                          </div>
                        </button>

                        {/* 3. MANUEL DÜZENLE */}
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleResolve(incident.id, "ManualCorrection")}
                          className="h-14 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                        >
                          <Wrench className="w-5 h-5 shrink-0" />
                          <div className="text-left">
                            <div className="leading-tight">MANUEL DÜZELT</div>
                            <div className="text-[10px] font-normal opacity-90">Usta-Ofis Mutabakatına Al</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ÇÖZÜMLENMİŞ AUDIT DAMGASI */
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Karar Uygulandı:{" "}
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                              {incident.resolutionAction === "AcceptClientState"
                                ? "Saha Onaylandı (Tamamlandı)"
                                : incident.resolutionAction === "AcceptServerState"
                                ? "Ofis Korundu (İptal Edildi)"
                                : "Manuel Düzeltme"}
                            </span>
                          </span>
                          {incident.managerNotes && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              Gerekçe: &quot;{incident.managerNotes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 text-right">
                        <div>Hakem: {incident.resolvedByUserName || "Servis Müdürü (Hakan Danışman)"}</div>
                        <div>
                          {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString("tr-TR") : "Az önce"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
