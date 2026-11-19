"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Camera, Trash2, X, AlertCircle, Image as ImageIcon, Plus } from "lucide-react";

export type DamageType = "scratch" | "dent" | "repaint";

export interface DamageMarker {
  id: string;
  zone: string;
  zoneName: string;
  damageType: DamageType;
  xPercent: number;
  yPercent: number;
  photoUrl?: string;
  notes?: string;
}

export interface HiDamageInspectionProps {
  markers?: DamageMarker[];
  onChange?: (markers: DamageMarker[]) => void;
  readOnly?: boolean;
  className?: string;
}

const DAMAGE_TYPES: { type: DamageType; label: string; icon: string; color: string; badgeClass: string }[] = [
  {
    type: "scratch",
    label: "Çizik",
    icon: "🟡",
    color: "#EAB308",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700",
  },
  {
    type: "dent",
    label: "Göçük / Kırık",
    icon: "🔴",
    color: "#EF4444",
    badgeClass: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-700",
  },
  {
    type: "repaint",
    label: "Boyalı / Değişen",
    icon: "🔵",
    color: "#3B82F6",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700",
  },
];

export const HiDamageInspection: React.FC<HiDamageInspectionProps> = ({
  markers = [],
  onChange,
  readOnly = false,
  className,
}) => {
  const [selectedType, setSelectedType] = useState<DamageType>("scratch");
  const [selectedVehicleType, setSelectedVehicleType] = useState<"sedan" | "hatchback" | "suv">("sedan");
  const [pendingMarker, setPendingMarker] = useState<Omit<DamageMarker, "id"> | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoNote, setPhotoNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&q=80");
  const diagramRef = useRef<HTMLDivElement>(null);

  // Helper to resolve zone name from coordinate percentage
  const getZoneFromCoordinates = (x: number, y: number): { zone: string; zoneName: string } => {
    if (y < 18) return { zone: "FrontBumper", zoneName: "Ön Tampon" };
    if (y < 35) {
      if (x < 30) return { zone: "FrontLeftFender", zoneName: "Sol Ön Çamurluk" };
      if (x > 70) return { zone: "FrontRightFender", zoneName: "Sağ Ön Çamurluk" };
      return { zone: "Hood", zoneName: "Motor Kaputu" };
    }
    if (y < 48) {
      if (x < 25) return { zone: "FrontLeftDoor", zoneName: "Sol Ön Kapı" };
      if (x > 75) return { zone: "FrontRightDoor", zoneName: "Sağ Ön Kapı" };
      return { zone: "Windshield", zoneName: "Ön Cam" };
    }
    if (y < 68) {
      if (x < 25) return { zone: "RearLeftDoor", zoneName: "Sol Arka Kapı" };
      if (x > 75) return { zone: "RearRightDoor", zoneName: "Sağ Arka Kapı" };
      return { zone: "Roof", zoneName: "Tavan" };
    }
    if (y < 85) {
      if (x < 30) return { zone: "RearLeftFender", zoneName: "Sol Arka Çamurluk" };
      if (x > 70) return { zone: "RearRightFender", zoneName: "Sağ Arka Çamurluk" };
      return { zone: "Trunk", zoneName: "Bagaj Kapağı" };
    }
    return { zone: "RearBumper", zoneName: "Arka Tampon" };
  };

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (!diagramRef.current) return;

    const rect = diagramRef.current.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 280;
    const height = rect.height > 0 ? rect.height : 480;
    const clientX = typeof e.clientX === "number" ? e.clientX : 0;
    const clientY = typeof e.clientY === "number" ? e.clientY : 0;
    const left = rect.left || 0;
    const top = rect.top || 0;

    const rawX = Math.round(((clientX - left) / width) * 100);
    const rawY = Math.round(((clientY - top) / height) * 100);
    const x = isNaN(rawX) ? 50 : Math.max(0, Math.min(100, rawX));
    const y = isNaN(rawY) ? 50 : Math.max(0, Math.min(100, rawY));

    const { zone, zoneName } = getZoneFromCoordinates(x, y);

    const markerData = {
      zone,
      zoneName,
      damageType: selectedType,
      xPercent: x,
      yPercent: y,
    };

    // Spec Section 4: If Göçük/Kırık (Dent), mandatory photo modal must open
    if (selectedType === "dent") {
      setPendingMarker(markerData);
      setPhotoNote("");
      setIsPhotoModalOpen(true);
    } else {
      const newMarker: DamageMarker = {
        ...markerData,
        id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      onChange?.([...markers, newMarker]);
    }
  };

  const handleSavePhotoModal = () => {
    if (!pendingMarker) return;
    const newMarker: DamageMarker = {
      ...pendingMarker,
      id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&q=80",
      notes: photoNote.trim() || "Göçük / Kırık hasar kaydı",
    };
    onChange?.([...markers, newMarker]);
    setPendingMarker(null);
    setIsPhotoModalOpen(false);
  };

  const handleRemoveMarker = (id: string) => {
    if (readOnly) return;
    onChange?.(markers.filter((m) => m.id !== id));
  };

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>2D İnteraktif Kaporta Hasar Şeması</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
              {markers.length} Hasar Pini
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aracın üzerindeki hasarlı noktaya dokunarak pin ekleyin. Göçük seçiminde fotoğraf zorunludur.
          </p>
        </div>

        {/* Siluet Tipi Seçici */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start md:self-auto">
          {(["sedan", "hatchback", "suv"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedVehicleType(type)}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium capitalize transition-all",
                selectedVehicleType === type
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {!readOnly && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            İşaretlenecek Hasar Türünü Seçin:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DAMAGE_TYPES.map(({ type, label, icon, badgeClass }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs md:text-sm font-semibold transition-all min-h-[44px]",
                  badgeClass,
                  selectedType === type
                    ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 shadow-sm"
                    : "opacity-75 hover:opacity-100"
                )}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2D Araç Silueti & İnteraktif Tuval */}
      <div className="relative flex justify-center py-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 select-none overflow-hidden">
        <div
          ref={diagramRef}
          onClick={handleDiagramClick}
          className={cn(
            "relative w-[280px] h-[480px] cursor-crosshair transition-all",
            readOnly && "cursor-default"
          )}
          style={{ touchAction: "manipulation" }}
        >
          {/* Yön Göstergeleri */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ▲ ÖN (FRONT)
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ▼ ARKA (REAR)
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest origin-left">
            SOL
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest origin-right">
            SAĞ
          </div>

          {/* Vektör Araç Silueti (Top-down Blueprint) */}
          <svg
            viewBox="0 0 280 480"
            className="w-full h-full drop-shadow-sm pointer-events-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Araç Dış Gövde Çerçevesi */}
            <path
              d="M 80 40 
                 C 100 25, 180 25, 200 40 
                 C 220 55, 235 90, 235 150 
                 C 235 240, 235 340, 235 410 
                 C 235 440, 210 460, 190 465 
                 C 160 470, 120 470, 90 465 
                 C 70 460, 45 440, 45 410 
                 C 45 340, 45 240, 45 150 
                 C 45 90, 60 55, 80 40 Z"
              className="fill-slate-100 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="3"
            />

            {/* Ön Tampon Hattı */}
            <path
              d="M 60 70 C 100 50, 180 50, 220 70"
              className="stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Motor Kaputu */}
            <path
              d="M 70 85 C 90 75, 190 75, 210 85 L 205 160 C 180 155, 100 155, 75 160 Z"
              className="fill-slate-200/50 dark:fill-slate-700/50 stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="1.5"
            />

            {/* Ön Cam */}
            <path
              d="M 75 165 C 100 160, 180 160, 205 165 L 195 210 C 175 205, 105 205, 85 210 Z"
              className="fill-sky-100/70 dark:fill-sky-950/70 stroke-sky-400 dark:stroke-sky-600"
              strokeWidth="1.5"
            />

            {/* Tavan (Roof) */}
            <rect
              x="85"
              y="215"
              width="110"
              height="105"
              rx="8"
              className="fill-slate-200/40 dark:fill-slate-700/40 stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="1.5"
            />

            {/* Arka Cam */}
            <path
              d="M 85 325 C 105 328, 175 328, 195 325 L 205 365 C 180 370, 100 370, 75 365 Z"
              className="fill-sky-100/70 dark:fill-sky-950/70 stroke-sky-400 dark:stroke-sky-600"
              strokeWidth="1.5"
            />

            {/* Bagaj Kapağı */}
            <path
              d="M 75 370 C 100 375, 180 375, 205 370 L 200 430 C 180 435, 100 435, 80 430 Z"
              className="fill-slate-200/50 dark:fill-slate-700/50 stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="1.5"
            />

            {/* Sol & Sağ Yan Aynalar */}
            <path d="M 45 165 C 30 165, 30 185, 45 185 Z" className="fill-slate-300 dark:fill-slate-600 stroke-slate-400" />
            <path d="M 235 165 C 250 165, 250 185, 235 185 Z" className="fill-slate-300 dark:fill-slate-600 stroke-slate-400" />

            {/* Tekerlekler (Wheels) */}
            <rect x="35" y="80" width="12" height="40" rx="3" className="fill-slate-800 dark:fill-slate-900" />
            <rect x="233" y="80" width="12" height="40" rx="3" className="fill-slate-800 dark:fill-slate-900" />
            <rect x="35" y="360" width="12" height="40" rx="3" className="fill-slate-800 dark:fill-slate-900" />
            <rect x="233" y="360" width="12" height="40" rx="3" className="fill-slate-800 dark:fill-slate-900" />
          </svg>

          {/* Konumlandırılmış Hasar Pinleri */}
          {markers.map((marker, index) => {
            const config = DAMAGE_TYPES.find((d) => d.type === marker.damageType) || DAMAGE_TYPES[0];
            return (
              <div
                key={marker.id}
                style={{
                  left: `${marker.xPercent}%`,
                  top: `${marker.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900 transition-transform transform hover:scale-125 cursor-pointer"
                  style={{ backgroundColor: config.color }}
                >
                  {index + 1}
                </div>

                {/* Tooltip & Aksiyon Balonu */}
                <div className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 bottom-full mb-2 flex-col items-center bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-auto">
                  <div className="font-bold flex items-center gap-1">
                    <span>{config.icon}</span>
                    <span>{marker.zoneName}</span>
                    <span className="text-slate-400 font-normal">({config.label})</span>
                  </div>
                  {marker.notes && <div className="text-slate-300 text-[10px] mt-0.5">{marker.notes}</div>}
                  {marker.photoUrl && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                      <ImageIcon className="w-3 h-3" />
                      <span>Fotoğraf Mevcut</span>
                    </div>
                  )}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMarker(marker.id);
                      }}
                      className="mt-1.5 flex items-center gap-1 text-red-400 hover:text-red-300 text-[10px] font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Pini Kaldır</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kaydedilen Hasar Listesi */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
          <span>İşaretlenen Hasar Listesi ({markers.length}):</span>
          {markers.length > 0 && !readOnly && (
            <button
              type="button"
              onClick={() => onChange?.([])}
              className="text-[11px] text-red-600 hover:text-red-700 font-medium"
            >
              Tümünü Temizle
            </button>
          )}
        </div>

        {markers.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            Henüz kaporta hasarı işaretlenmedi. Çizik veya göçük varsa araç silueti üzerine tıklayınız.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {markers.map((marker, index) => {
              const config = DAMAGE_TYPES.find((d) => d.type === marker.damageType) || DAMAGE_TYPES[0];
              return (
                <div
                  key={marker.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: config.color }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{marker.zoneName}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border", config.badgeClass)}>
                      {config.label}
                    </span>
                    {marker.photoUrl && (
                      <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 text-[10px]">
                        <ImageIcon className="w-3 h-3" />
                        <span>Foto</span>
                      </span>
                    )}
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMarker(marker.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      aria-label="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Photo Modal for Dent/Crack (🔴) */}
      {isPhotoModalOpen && pendingMarker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>Zorunlu Hasar Fotoğrafı (Göçük / Kırık)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPendingMarker(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Şartname Madde 4 gereği: &apos;{pendingMarker.zoneName}&apos; bölgesindeki göçük/kırık hasarı için en az 1 görsel kanıt fotoğrafı çekilmesi zorunludur.
            </p>

            {/* Photo preview / upload simulation */}
            <div className="mb-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video flex flex-col items-center justify-center">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Hasar Kanıtı" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1">
                    <Camera className="w-8 h-8" />
                    <span className="text-xs">Kamera Başlatılıyor...</span>
                  </div>
                )}

                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&q=80")}
                    className="px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded-md backdrop-blur-sm flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Örnek Fotoğraf</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hasar Açıklama Notu */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hasar Açıklaması (Opsiyonel):
              </label>
              <input
                type="text"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                placeholder="Örn: 5cm derin göçük, boya çatlağı var"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPendingMarker(null);
                }}
                className="flex-1 py-2.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSavePhotoModal}
                className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Fotoğrafı Onayla & Pini Ekle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
