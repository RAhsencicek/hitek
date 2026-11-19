"use client";

import React, { useState } from "react";
import { HiAssetBadge } from "@/components/ui/HiAssetBadge";
import { HiStatusBadge, HiWorkOrderStatus } from "@/components/ui/HiStatusBadge";
import { useSector } from "@/lib/SectorContext";
import {
  Wrench,
  Clock,
  Package,
  AlertCircle,
  User,
  ArrowRight,
  Plus,
  Play,
  CheckCircle,
  Pause,
  Filter,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

export interface KanbanCardData {
  id: string;
  workOrderNumber: string;
  plate: string;
  brand: string;
  model: string;
  modelYear: number;
  customerName: string;
  complaint: string;
  status: HiWorkOrderStatus;
  priority: "Normal" | "Urgent" | "Waiter" | "PartsArrived" | "Vip";
  bayId: string;
  bayName: string;
  technicianName: string;
  progressPercent: number;
  elapsedMinutes: number;
  targetMinutes: number;
  isLaborRunning?: boolean;
}

export interface HiWorkshopKanbanProps {
  onOpenTechBoard?: (workOrderId: string) => void;
  onOpenIntake?: () => void;
}

const INITIAL_CARDS: KanbanCardData[] = [
  {
    id: "wo-1",
    workOrderNumber: "WO-2026-10492",
    plate: "34 ABC 123",
    brand: "Volkswagen",
    model: "Passat 1.6 TDI",
    modelYear: 2021,
    customerName: "Mehmet Yılmaz",
    complaint: "Ön disk ve balata değişimi, fren hidroliği testi",
    status: "InProgress",
    priority: "Urgent",
    bayId: "lift-1",
    bayName: "LİFT 1 (Mekanik / Ağır Bakım)",
    technicianName: "Ahmet Usta",
    progressPercent: 75,
    elapsedMinutes: 105,
    targetMinutes: 120,
    isLaborRunning: true,
  },
  {
    id: "wo-2",
    workOrderNumber: "WO-2026-10495",
    plate: "06 BCD 456",
    brand: "Renault",
    model: "Megane 1.5 dCi",
    modelYear: 2020,
    customerName: "Ayşe Demir",
    complaint: "10.000 KM periyodik yağ, filtre & buji bakımı",
    status: "Completed",
    priority: "Normal",
    bayId: "lift-2",
    bayName: "LİFT 2 (Periyodik Hızlı Bakım)",
    technicianName: "Can Usta",
    progressPercent: 100,
    elapsedMinutes: 40,
    targetMinutes: 45,
    isLaborRunning: false,
  },
  {
    id: "wo-3",
    workOrderNumber: "WO-2026-10498",
    plate: "35 CDE 789",
    brand: "Toyota",
    model: "Corolla 1.8 Hybrid",
    modelYear: 2022,
    customerName: "Burak Kaya",
    complaint: "Sağ salıncak burcu kontrolü & rot-balans ayarı",
    status: "WaitingParts",
    priority: "Waiter",
    bayId: "lift-3",
    bayName: "LİFT 3 (Rot-Balans / Ön Takım)",
    technicianName: "Murat Usta",
    progressPercent: 25,
    elapsedMinutes: 15,
    targetMinutes: 60,
    isLaborRunning: false,
  },
  {
    id: "wo-4",
    workOrderNumber: "WO-2026-10501",
    plate: "34 DEF 999",
    brand: "Fiat",
    model: "Egea 1.4 Fire",
    modelYear: 2023,
    customerName: "Filo Filo A.Ş.",
    complaint: "Son kalite kontrol testi ve teslimat temizliği",
    status: "CustomerApproval",
    priority: "Vip",
    bayId: "bay-qc",
    bayName: "Kalite Kontrol & Teslimat",
    technicianName: "Hakan Danışman",
    progressPercent: 90,
    elapsedMinutes: 50,
    targetMinutes: 60,
    isLaborRunning: false,
  },
];

export const HiWorkshopKanban: React.FC<HiWorkshopKanbanProps> = ({
  onOpenTechBoard,
  onOpenIntake,
}) => {
  const { config } = useSector();
  const [cards, setCards] = useState<KanbanCardData[]>(INITIAL_CARDS);
  const [filterPriority, setFilterPriority] = useState<string>("All");

  const BAYS = [
    { id: "lift-1", name: "LİFT 1 (Mekanik / Ağır Bakım)", tech: "Ahmet Usta" },
    { id: "lift-2", name: "LİFT 2 (Periyodik Hızlı Bakım)", tech: "Can Usta" },
    { id: "lift-3", name: "LİFT 3 (Rot-Balans / Ön Takım)", tech: "Murat Usta" },
    { id: "bay-qc", name: "Kalite Kontrol & Teslimat", tech: "Hakan Danışman" },
  ];

  const PRIORITY_FLAGS: Record<string, { label: string; badgeClass: string }> = {
    Urgent: { label: "🔴 Acil", badgeClass: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300" },
    Waiter: { label: "⏳ Müşteri Bekliyor", badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300" },
    PartsArrived: { label: "📦 Parça Geldi", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300" },
    Vip: { label: "🚙 VIP Filo", badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300" },
    Normal: { label: "Normal", badgeClass: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300" },
  };

  const handleStatusChange = async (cardId: string, newStatus: HiWorkOrderStatus) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c))
    );
    try {
      await apiClient.updateWorkOrderStatus(cardId, newStatus);
    } catch {
      // offline fallback
    }
  };

  const handleMoveBay = (cardId: string, newBayId: string) => {
    const bayObj = BAYS.find((b) => b.id === newBayId);
    if (!bayObj) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              bayId: bayObj.id,
              bayName: bayObj.name,
              technicianName: bayObj.tech,
            }
          : c
      )
    );
  };

  const filteredCards = cards.filter((c) => {
    if (filterPriority === "All") return true;
    return c.priority === filterPriority;
  });

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Üst Bar: Filtreler & Hızlı Kabul Butonu */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrele:</span>
          </span>
          {[
            { key: "All", label: `Hepsi (${cards.length})` },
            { key: "Urgent", label: `🔴 Acil (${cards.filter((c) => c.priority === "Urgent").length})` },
            { key: "Waiter", label: `⏳ Müşteri Bekliyor (${cards.filter((c) => c.priority === "Waiter").length})` },
            { key: "PartsArrived", label: `📦 Parça Geldi (${cards.filter((c) => c.priority === "PartsArrived").length})` },
            { key: "Vip", label: `🚙 VIP Filo (${cards.filter((c) => c.priority === "Vip").length})` },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilterPriority(item.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterPriority === item.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {onOpenIntake && (
          <button
            type="button"
            onClick={onOpenIntake}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm self-start md:self-auto active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{config.id === "automotive" ? "Hızlı Araç Kabul" : `Hızlı ${config.assetTypeName} Kabul`}</span>
          </button>
        )}
      </div>

      {/* 4 Kolonlu Kanban Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BAYS.map((bay) => {
          const bayCards = filteredCards.filter((c) => c.bayId === bay.id);

          return (
            <div
              key={bay.id}
              className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[500px]"
            >
              {/* Kolon Başlığı */}
              <div className="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h3 className="font-black text-xs md:text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                    {bay.name}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-blue-600" />
                    <span>{bay.tech}</span>
                  </div>
                </div>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  {bayCards.length}
                </span>
              </div>

              {/* Araç Kartları Listesi */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {bayCards.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                    <Wrench className="w-6 h-6 mb-1 opacity-40" />
                    <span>Bu lift şu anda boşta.</span>
                  </div>
                ) : (
                  bayCards.map((card) => {
                    const priorityConfig = PRIORITY_FLAGS[card.priority] || PRIORITY_FLAGS.Normal;

                    return (
                      <div
                        key={card.id}
                        className="bg-white dark:bg-slate-900 rounded-xl p-3.5 shadow-sm border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 transition-all space-y-2.5"
                      >
                        {/* Plaka / Kimlik ve RO No */}
                        <div className="flex items-start justify-between gap-2">
                          <HiAssetBadge
                            identifier={card.plate}
                            badgeType={config.primaryIdentifier.badgeType}
                            size="md"
                          />
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {card.workOrderNumber}
                          </span>
                        </div>

                        {/* Araç Modeli ve Müşteri */}
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {card.brand} {card.model} ({card.modelYear})
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>{card.customerName}</span>
                          </div>
                        </div>

                        {/* Müşteri Şikayeti */}
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic">
                          &quot;{card.complaint}&quot;
                        </p>

                        {/* Rozetler: Durum ve Öncelik */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <HiStatusBadge status={card.status} size="sm" />
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              priorityConfig.badgeClass
                            )}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>

                        {/* İlerleme ve Süreç Çubuğu */}
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                            <span>İlerleme: %{card.progressPercent}</span>
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>
                                {formatMinutes(card.elapsedMinutes)} / {formatMinutes(card.targetMinutes)}
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                card.progressPercent >= 100
                                  ? "bg-emerald-500"
                                  : card.isLaborRunning
                                  ? "bg-blue-600 animate-pulse"
                                  : "bg-blue-500"
                              )}
                              style={{ width: `${Math.min(100, card.progressPercent)}%` }}
                            />
                          </div>
                        </div>

                        {/* Hızlı Aksiyon Butonları */}
                        <div className="grid grid-cols-2 gap-1.5 pt-2">
                          {onOpenTechBoard && (
                            <button
                              type="button"
                              onClick={() => onOpenTechBoard(card.id)}
                              className="px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Tech Board</span>
                            </button>
                          )}

                          {card.status !== "Completed" ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(card.id, "Completed")}
                              className="px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Tamamla</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(card.id, "Invoiced")}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Teslim Et</span>
                            </button>
                          )}
                        </div>

                        {/* Başka Lifte Taşıma Seçicisi */}
                        <div className="pt-1">
                          <select
                            value={card.bayId}
                            onChange={(e) => handleMoveBay(card.id, e.target.value)}
                            className="w-full text-[10px] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
                          >
                            {BAYS.map((b) => (
                              <option key={b.id} value={b.id}>
                                Lifte Taşı: {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
