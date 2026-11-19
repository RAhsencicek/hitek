"use client";

import React, { useState, useEffect } from "react";
import { HiPlateBadge } from "@/components/ui/HiPlateBadge";
import { HiButton56 } from "@/components/ui/HiButton56";
import { HiStatusBadge, HiWorkOrderStatus, STATUS_MAP } from "@/components/ui/HiStatusBadge";
import { HiNumpad } from "@/components/ui/HiNumpad";
import { HiDviChip, HiDviStatus } from "@/components/ui/HiDviChip";
import {
  Sun,
  Moon,
  Camera,
  Mic,
  StopCircle,
  Plus,
  CheckCircle2,
  Wifi,
  WifiOff,
  Wrench,
  ShieldAlert,
  Smartphone,
  Layers,
  Sparkles,
} from "lucide-react";

export const ComponentShowcase: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [customPlate, setCustomPlate] = useState<string>("34 ABC 123");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<string>("Hazır — Herhangi bir butona veya tuşa basınız.");
  const [savedKm, setSavedKm] = useState<number>(145200);

  // DVI Items state
  const [dviStates, setDviStates] = useState<Record<string, HiDviStatus>>({
    balata: "fail",
    yag: "pass",
    rot: "warning",
  });

  // Apply dark mode class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleAction = (msg: string) => {
    setLastAction(`[${new Date().toLocaleTimeString("tr-TR")}] ${msg}`);
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* 1. Üst Çevrimdışı Uyarı Bandı (Şartname Madde 6.2) */}
      {isOffline && (
        <aside
          role="region"
          aria-label="Çevrimdışı Durum Uyarısı"
          className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md animate-pulse"
        >
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            ⚡ ÇEVRİMDISI MOD: İşlemleriniz yerel Drift SQLite belleğe kaydediliyor. İnternet geldiğinde otomatik eşitlenecektir.
          </span>
        </aside>
      )}

      {/* 2. Ana Başlık & Üst Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B]/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
              Hİ
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                HiServis AI <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Faz 0 UI-Kit</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Sanayi Tipi Dokunmatik Ergonomi & WCAG AAA Tasarım Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Çevrimdışı Simülatörü */}
            <button
              type="button"
              onClick={() => {
                setIsOffline((prev) => !prev);
                handleAction(isOffline ? "Çevrimiçi moda geçildi (Bulut Senkron)." : "Çevrimdışı moda geçildi (Yerel SQLite modu).");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Ağ Durumunu Değiştir"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Çevrimdışı</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Çevrimiçi</span>
                </>
              )}
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={() => {
                setIsDarkMode((prev) => !prev);
                handleAction(isDarkMode ? "Açık Moda geçildi (#F8FAFC)." : "Derin Koyu Moda geçildi (#0B0F19).");
              }}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={isDarkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Ana İçerik Gövdesi */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Canlı İşlem Bildirim Kutusu */}
        <section aria-label="Canlı Etkileşim Günlüğü" className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping shrink-0" />
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
              {lastAction}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Haptik & Dokunmatik Algılama Aktif</span>
        </section>

        {/* 1. TÜRK STANDART PLAKA ROZETİ (HiPlateBadge) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-mono">01.</span>
                Türkiye Standart Plaka Rozeti (HiPlateBadge)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                DIN 1451 / FE-Schrift benzeri kabartmalı font, sol #003399 TR bandı, #1E293B kömür çerçeve.
              </p>
            </div>
            {/* Canlı Plaka Değiştirici */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customPlate}
                onChange={(e) => setCustomPlate(e.target.value)}
                placeholder="Plaka yazın..."
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none w-36"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Küçük (sm - 28px)</span>
              <HiPlateBadge plate={customPlate} size="sm" />
              <span className="text-[11px] text-slate-500">Masaüstü Tablo ve Listeler</span>
            </div>

            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Standart (md - 36px)</span>
              <HiPlateBadge plate={customPlate} size="md" />
              <span className="text-[11px] text-slate-500">Mobil Liste & Parça Kartı</span>
            </div>

            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Büyük (lg - 44px)</span>
              <HiPlateBadge plate={customPlate} size="lg" />
              <span className="text-[11px] text-slate-500">Mobil Başlık & Kabul Fişi</span>
            </div>

            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Hero (hero - 56px)</span>
              <HiPlateBadge plate={customPlate} size="hero" />
              <span className="text-[11px] text-slate-500">2 Metreden Okunabilir Lift Ekranı</span>
            </div>
          </div>
        </section>

        {/* 2. DOKUNMATİK 56PX BUTONLAR (HiButton56) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-mono">02.</span>
                Dokunmatik Optimize 56px Butonlar (HiButton56)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Eldivenli teknisyenler için min 56x56 px, 16px Bold tipografi, dokunma haptik titreşimi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setButtonLoading((p) => !p)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Yükleniyor (Loading) Durumunu Değiştir: {buttonLoading ? "Açık" : "Kapalı"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Action Button */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">1. Primary Action (#2563EB)</span>
              <HiButton56
                variant="primary"
                size="56"
                fullWidth
                isLoading={buttonLoading}
                leftIcon={<Camera className="w-5 h-5" />}
                onClick={() => handleAction("Kamera tetiklendi (Ruhsat OCR).")}
              >
                RUHSAT FOTOĞRAFI ÇEK
              </HiButton56>
              <p className="text-[11px] text-slate-500">Birincil eylemler, kabul adımları ve kamera tetikleyici.</p>
            </div>

            {/* Danger / Stop Button */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">2. Danger / Stop Action (#DC2626)</span>
              <HiButton56
                variant="danger"
                size="56"
                fullWidth
                isLoading={buttonLoading}
                leftIcon={<StopCircle className="w-5 h-5" />}
                onClick={() => handleAction("İşçilik sayacı durduruldu & mola kaydedildi.")}
              >
                İŞÇİLİĞİ DURDUR & MOLA VER
              </HiButton56>
              <p className="text-[11px] text-slate-500">İşçilik durdurma, karantina iptali ve kritik silme adımları.</p>
            </div>

            {/* Success / Complete Button */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">3. Success Action (#059669)</span>
              <HiButton56
                variant="success"
                size="56"
                fullWidth
                isLoading={buttonLoading}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                onClick={() => handleAction("İş emri tamamlandı ve kalite kontrol onaylandı.")}
              >
                ONAYLA & LİFTTEN İNDİR
              </HiButton56>
              <p className="text-[11px] text-slate-500">İş emri kapama, ödeme tahsilatı ve teslimat onayı.</p>
            </div>

            {/* Secondary / Ghost Button */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">4. Secondary Action (Bordered)</span>
              <HiButton56
                variant="secondary"
                size="48"
                fullWidth
                isLoading={buttonLoading}
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => handleAction("Manuel kilometre modalı açıldı.")}
              >
                Manuel Kilometre Gir
              </HiButton56>
              <p className="text-[11px] text-slate-500">İkincil form eylemleri ve modal tetikleyiciler.</p>
            </div>

            {/* Sticky Action Footer Simülasyonu */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 lg:col-span-2">
              <span className="text-xs font-bold text-slate-400 uppercase block">5. Mobil Teknisyen Yapışkan Alt Bar (H: 72px)</span>
              <div className="grid grid-cols-2 gap-3">
                <HiButton56
                  variant="secondary"
                  size="56"
                  leftIcon={<Mic className="w-5 h-5 text-blue-600" />}
                  onClick={() => handleAction("Whisper sesli iş emri kaydı başlatıldı...")}
                >
                  Sesli Not
                </HiButton56>
                <HiButton56
                  variant="primary"
                  size="56"
                  leftIcon={<Camera className="w-5 h-5" />}
                  onClick={() => handleAction("Hızlı hasar fotoğrafı açıldı...")}
                >
                  Fotoğraf Çek
                </HiButton56>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DURUM MAKİNESİ GÖRSEL EŞLEME MATRİSİ (HiStatusBadge) */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-mono">03.</span>
              Durum Makinesi Görsel Eşleme Matrisi (HiStatusBadge)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Veritabanındaki 8 iş emri statüsünün arayüzdeki renk, kenarlık, ikon ve nabız kuralları sabittir (WCAG AAA uyumlu).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(STATUS_MAP) as HiWorkOrderStatus[]).map((statusKey) => (
              <div
                key={statusKey}
                onClick={() => handleAction(`Statü rozeti tıklandı: ${statusKey}`)}
                className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 cursor-pointer hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">{statusKey}</span>
                  {statusKey === "QUARANTINE_REVIEW" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">Hızlı Nabız</span>
                  )}
                  {statusKey === "InProgress" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">Sayaç Aktif</span>
                  )}
                </div>
                <div className="py-2">
                  <HiStatusBadge status={statusKey} size="md" showDot />
                </div>
                <span className="text-[11px] text-slate-500">
                  {statusKey === "QUARANTINE_REVIEW"
                    ? "İptal vs Tamamlama çakışması"
                    : statusKey === "WaitingParts"
                    ? "Depo / Tedarikçi siparişi bekleniyor"
                    : "Standart iş emri akışı"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SAYISAL DOKUNMATİK GİRİŞ PADİ (HiNumpad) VE DVI ÇİPLERİ */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-mono">04.</span>
              Sayısal Dokunmatik Numpad (HiNumpad) & DVI Muayene Çipleri (HiDviChip)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sanayi teknisyeninin minik sanal klavyeyle boğuşmaması için 70px tuşlu dev Numpad ve 3 kademeli DVI çipi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sol: Dev Numpad */}
            <div className="lg:col-span-5">
              <HiNumpad
                initialValue={savedKm}
                label="GÜNCEL ARAÇ KİLOMETRESİ:"
                unit="KM"
                onConfirm={(val, formatted) => {
                  setSavedKm(val);
                  handleAction(`Kilometre kaydedildi: ${formatted}`);
                }}
              />
            </div>

            {/* Sağ: 3 Kademeli DVI Çipleri & Lift Kartı Simülasyonu */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <HiPlateBadge plate="34 ABC 123" size="md" />
                    <div>
                      <h4 className="font-bold text-sm">Volkswagen Passat 1.6 TDI</h4>
                      <p className="text-xs text-slate-500">Lift 1 — Ahmet Usta</p>
                    </div>
                  </div>
                  <HiStatusBadge status="InProgress" size="sm" showDot />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    DVI Hızlı Muayene Listesi (Dokunmatik Trafik Işığı)
                  </h3>

                  <HiDviChip
                    title="Ön Fren Balataları & Disk Aşınması"
                    value={dviStates.balata}
                    onChange={(st) => {
                      setDviStates((prev) => ({ ...prev, balata: st }));
                      handleAction(`Ön Balatalar durumu güncellendi: ${st.toUpperCase()}`);
                    }}
                  />

                  <HiDviChip
                    title="Motor Yağı ve Filtre Seviyesi"
                    value={dviStates.yag}
                    onChange={(st) => {
                      setDviStates((prev) => ({ ...prev, yag: st }));
                      handleAction(`Motor Yağı durumu güncellendi: ${st.toUpperCase()}`);
                    }}
                  />

                  <HiDviChip
                    title="Ön Rot Başları ve Salıncak Burçları"
                    value={dviStates.rot}
                    onChange={(st) => {
                      setDviStates((prev) => ({ ...prev, rot: st }));
                      handleAction(`Rot başları durumu güncellendi: ${st.toUpperCase()}`);
                    }}
                  />
                </div>

                {/* Parça Mühürlü Kart Molekülü Simülasyonu (Madde 4.1) */}
                <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      📦 MÜHÜRLÜ PARÇA ETİKETİ
                    </span>
                    <span className="font-mono text-slate-400">HS-WO10492-P01</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm">BOSCH ÖN FREN BALATASI</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      HAZIR
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">OEM: 5Q0 698 151 B • Tedarikçi: Başbuğ Oto</p>
                  <div className="pt-2 flex gap-2">
                    <HiButton56
                      variant="primary"
                      size="48"
                      className="flex-1 text-xs"
                      leftIcon={<Camera className="w-4 h-4" />}
                      onClick={() => handleAction("Montaj öncesi parça QR kodu okundu & doğrulandı.")}
                    >
                      Montaj Fotoğrafı Çek
                    </HiButton56>
                    <HiButton56
                      variant="ghost"
                      size="48"
                      className="text-xs text-red-600 dark:text-red-400"
                      onClick={() => handleAction("Uyumsuz parça tersine lojistik deposuna yönlendirildi.")}
                    >
                      Uyumsuz / İade
                    </HiButton56>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Alt Bilgi Çubuğu */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6 mt-16 text-center text-xs text-slate-500">
        <p>HiServis AI v1.1 — Faz 0 Mimari Çekirdek & Tasarım Sistemi Doğrulama Vitrini</p>
        <p className="mt-1 font-mono text-[11px] text-slate-400">PostgreSQL 17 RLS + .NET 9 API + Next.js 19 + Tailwind CSS</p>
      </footer>
    </div>
  );
};
