# HiServis AI — Mevcut Durum ve Modüler Yol Haritası

> **Durum:** Canlı Yol Haritası (Live Roadmap)  
> **Sürüm:** v1.2  
> **Planlama Süresi:** 28 Hafta (7 Faz)  
> **Hedef:** Çok Sektörlü Genel Endüstriyel Servis & Saha Yönetimi (Oto Servis, Asansör, Jeneratör, HVAC, Makine)

---

## 1. Teslimat Özeti ve Fazlandırma Matrisi

```mermaid
gantt
    title HiServis AI Geliştirme ve Teslimat Takvimi
    dateFormat  YYYY-MM-DD
    section Faz 0 - Altyapı & Çekirdek
    PostgreSQL 18 RLS & Multi-Branch     :done, f0_1, 2026-12-01, 2w
    .NET 10 Minimal API Gateway & Auth   :done, f0_2, after f0_1, 2w
    section Faz 1 - Varlık Kabul & Sektör Motoru
    Hızlı Varlık Kabul & Çok Sektörlü Giriş:done, f1_1, after f0_2, 3w
    İş Emri & Teknisyen/İstasyon Paneli    :done, f1_2, after f1_1, 3w
    section Faz 2 - Tedarik & QR Mühür
    Satınalma & Tedarikçi PO (1:N)        :done, f2_1, after f1_2, 3w
    Konsolide Mal Kabul & Termal Mühürleme:done, f2_2, after f2_1, 2w
    section Faz 3 - Offline-First Saha Servisi
    Flutter Drift SQLite Modeli           :active, f3_1, after f2_2, 3w
    Outbox Sync & Karantina Havuzu        :f3_2, after f3_1, 3w
    section Faz 4 - PWA & İletişim
    Sihirli Link PWA & Müşteri Onayı      :f4_1, after f3_2, 2w
    WhatsApp Cloud API & Cüzdan Motoru    :f4_2, after f4_1, 2w
    section Faz 5 - Yapay Zeka & B2B
    Whisper Sesli İş Emri Gateway         :f5_1, after f4_2, 2w
    Toptancı & Sanayi B2B Gateway         :f5_2, after f5_1, 2w
    section Faz 6 - Pilot Sahası
    Oto, Asansör & Jeneratör Pilot Lansmanı:f6_1, after f5_2, 2w
```

---

## 2. Faz Bazında Yetenek ve Teslimat Tablosu

| Faz | Hafta | Kapsam | Temel Çıktılar | Doğrulama Kriteri |
|---|---|---|---|---|
| **Faz 0** | H1 – H4 | **Mimari Çekirdek & Çok Şubeli Altyapı** | PostgreSQL 18 DDL, `TenantId` $\rightarrow$ `BranchId` $\rightarrow$ `WarehouseId` RLS politikaları, .NET 10 Minimal APIs, JWT & 4 Haneli PIN kimlik doğrulama. | Çapraz şube ve kiracı sorgusunda 0 satır dönmesi, token ve RLS güvenliği. |
| **Faz 1** | H5 – H10 | **Hızlı Varlık Kabul & Çok Sektörlü İş Emri Motoru** | Sektör-agnostik varlık modeli (`Assets`), Oto Servis (Plaka/Ruhsat OCR), Asansör (Bakanlık UAVT/Kimlik No), Jeneratör & Makine (Seri No/Hourmeter) şablonları, İstasyon/Bay Kanban, Teknisyen mobil paneli. | Kabul işleminin 30 saniyenin altında tamamlanabilmesi, sektör şablonları arasında dinamik geçiş. |
| **Faz 2** | H11 – H15 | **Tedarik Zinciri & Termal Mühürlü Parça** | 1:N `PurchaseOrders` ve `PurchaseOrderLines` tabloları, konsolide koli mal kabul ekranı, el terminali ESC-POS Bluetooth yazıcı entegrasyonu, iç QR mühür basımı ve Çapraz Montaj Kilidi. | Toptancıdan gelen ortak parçanın doğru araca/makineye mühürlenmesi ve yanlış montajın engellenmesi. |
| **Sprint M1** | **Acil Satış** | **Motosiklet & E-Scooter (Mikromobilite) Saha Satış Paketi** | 1. Ticari Müşteri satışı için 10+8 DVI muayene kontrolü, 2D Motosiklet/Scooter hasar krokisi, `/tech` bağımsız 4 haneli PIN pad teknisyen tableti, hazır parça kütüphanesi (`MICROMOBILITY_PARTS_SEED`), 15 dk kurye ekspres bakım butonu. | Ahmet Usta'ya 5 dakikalık canlı demoda kabul fişi, usta tableti ve mühürlü parça döngüsünün eksiksiz gösterilmesi ve satışın kapatılması. |
| **Faz 3** | H16 – H21 | **Offline-First Saha Servisi & Karantina Çakışma Yönetimi** | Flutter Drift SQLite yerel veritabanı, Outbox Sync Worker, Hybrid Logical Clocks, `QuarantineIncidents` tablosu ve Servis Müdürü Hakemlik Paneli. (Bodrum asansör kuyuları, yer altı otoparkları, jeneratör odaları). | İnternetsiz tamamlanan iş emrinin ofis iptaliyle çakışmasında karantina tetiklenmesi ve veri kaybının önlenmesi. |
| **Faz 4** | H22 – H25 | **Sihirli Link PWA & Akıllı İletişim Cüzdanı** | Müşteri mobil web takip ekranı (PWA), WebSockets canlı durum, usta fotoğrafları, ek parça onay/red arayüzü, Meta WhatsApp Cloud API, 200 mesaj taban kota, ön ödemeli cüzdan motoru. | Varlık sahibinin tek tıkla uygulamayı kurmadan ek parça/işçilik teklifini onaylayabilmesi. |
| **Faz 5** | H26 – H27 | **Yapay Zeka (Whisper) & Toptancı/Sanayi B2B Hub** | Python 3.12 FastAPI mikroservisi, Whisper-large-v3 Türkçe sanayi jargonu ince ayarı (fine-tuning), Llama-3 yapılandırılmış JSON çıkarımı, toptancı B2B robotları. | Teknisyenin gürültülü ses kaydından iş emri kalemlerinin %90+ doğrulukla ayrıştırılması. |
| **Faz 6** | H28 | **Pilot Saha Canlıya Alma & Lansman** | Seçilmiş pilot servis merkezlerinde (Oto Servis, Asansör Bakım Firması, Endüstriyel Jeneratör Servisi) tam kapsamlı saha testi, geri bildirimler, optimizasyon. | 1 hafta boyunca sıfır sahipsiz parça ve sıfır veri kaybı ile servis operasyonunun dönmesi. |
