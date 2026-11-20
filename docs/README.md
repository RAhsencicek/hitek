# HiServis AI — Dokümantasyon Dizini ve Bilgi Haritası

> **Durum:** Yaşayan Ana Belge (Living Document)  
> **Sürüm:** v1.2 (Multi-Industry Agnostic Architecture & Production-Ready)  
> **Son Güncelleme:** 19 Kasım 2026  
> **Sorumlu:** Kurucu Ortaklar (Lead Architect & CPO)  
> **Kapsam:** Çok Sektörlü Genel Endüstriyel Servis & Saha Yönetimi (Oto Servis, Asansör, Jeneratör, HVAC, Fabrika Makinesi)

Bu dizin; HiServis AI platformunun tüm mimari kararlarını, iş alanı şartnamelerini, çevrimdışı senkronizasyon ve karantina protokollerini, modüler API sözleşmelerini ve kabul testlerini kategorize edilmiş olarak barındırır.

---

## 📌 Doküman Rolleri ve Tek Kaynak Disiplini (Single Source of Truth)

Projeyi devralan bir kurucu ortak, mimar veya mühendisin hangi belgeye ne amaçla başvuracağı kesin çizgilerle ayrılmıştır:

* 🧭 **[docs/README.md](README.md) = "Belgeleri Nerede Bulurum?"** (Dizin, Taksonomi ve Belge Envanter Haritası)
* 📜 **[PROJE_ANAYASASI.md](../PROJE_ANAYASASI.md) = "Değiştirilemez Kurallar ve Çekirdek İlkeler"** (Kurucu Ortaklar Anayasası ve Temel İlkeler)
* 🚀 **[00-devir-rehberi/DEVIR_REHBERI.md](00-devir-rehberi/DEVIR_REHBERI.md) = "Proje Bugün Ne Durumda ve Nasıl Devralınır?"** (Ana Devir Merkezi)
* 🏛️ **[01-mimari-ve-altyapi/TEKNIK_MIMARI.md](01-mimari-ve-altyapi/TEKNIK_MIMARI.md) = "Sistem Omurgası ve Katmanlar"** (.NET 9, PostgreSQL 17, Flutter, Next.js 19 ve Python AI)
* 🗺️ **[00-devir-rehberi/DURUM_VE_YOL_HARITASI.md](00-devir-rehberi/DURUM_VE_YOL_HARITASI.md) = "Sprint Teslimatı ve Takvim"** (28 Haftalık Fazlar ve Teslimat Matrisi)

> [!IMPORTANT]
> **Tek Kaynak Kuralı:** Orijinal PDF dokümanındaki varsayımlar [05-gecmis-ve-arsiv/](05-gecmis-ve-arsiv/) klasöründe tarihsel referans olarak korunur. Güncel geliştirme kararları ve kod gerçekliği için yalnız yukarıdaki **canlı belgeler** ve ilgili modül şartnameleri esas alınır.

---

## 🧭 Hızlı Başlangıç & Okuma Sırası (Yeni Geliştirici Kılavuzu)

Projeye yeni katılan bir ekip üyesinin belgeleri şu sırayla okuması zorunludur:

1. 🚀 **1. Adım (Büyük Resmi ve Felsefeyi Anlama):**
   * 👉 [PROJE_ANAYASASI.md](../PROJE_ANAYASASI.md) — 10 Temel Anayasa Maddesi ve Çekirdek İlkeler
   * 👉 [Mühendis ve Ekip Devir Teslim Rehberi](00-devir-rehberi/DEVIR_REHBERI.md)
   * 👉 [Mevcut Durum ve Modüler Yol Haritası](00-devir-rehberi/DURUM_VE_YOL_HARITASI.md)
2. 📦 **2. Adım (Üzerinde Çalışılacak Modülün Şartnamesini İnceleme):**
   * Hızlı Araç Kabul & Ruhsat OCR üzerinde çalışacaksanız: 👉 [Modül 1: Hızlı Araç Kabul](00-devir-rehberi/MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md)
   * İş Emri ve Atölye Yönetimi üzerinde çalışacaksanız: 👉 [Modül 2: İş Emri ve Atölye](00-devir-rehberi/MODUL_02_IS_EMRI_VE_ATOLYE_YONETIMI.md)
   * Depo ve Mühürlü Parça üzerinde çalışacaksanız: 👉 [Modül 3: Tedarik ve Mühürlü Parça](00-devir-rehberi/MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md)
   * Sesli İş Emri ve Whisper AI üzerinde çalışacaksanız: 👉 [Modül 4: Sesli Not ve Whisper](00-devir-rehberi/MODUL_04_SESLI_NOT_VE_WHISPER_AI.md)
   * Çevrimdışı Senkronizasyon üzerinde çalışacaksanız: 👉 [Modül 5: Çevrimdışı Senkronizasyon](00-devir-rehberi/MODUL_05_CEVRIMDISI_SENKRONIZASYON.md)
   * Müşteri Portalı ve WhatsApp üzerinde çalışacaksanız: 👉 [Modül 6: Sihirli Link ve İletişim](00-devir-rehberi/MODUL_06_SIHIRLI_LINK_VE_MUSTERI_PORTALI.md)
   * ERP ve Ön Muhasebe üzerinde çalışacaksanız: 👉 [Modül 7: ERP Entegrasyonu](00-devir-rehberi/MODUL_07_ERP_VE_ON_MUHASEBE_KOPRUSU.md)
3. 🏛️ **3. Adım (Teknik Omurga ve Veritabanı Mimarisi):**
   * 👉 [Teknik Mimari](01-mimari-ve-altyapi/TEKNIK_MIMARI.md)
   * 👉 [Veritabanı Şeması ve RLS Politikaları](01-mimari-ve-altyapi/VERITABANI_SEMASI_VE_RLS_KURALLARI.md)
   * 👉 [Çevrimdışı ve Karantina Mimarisi](01-mimari-ve-altyapi/CEVRIMDISI_VE_KARANTINA_MIMARISI.md)
   * 👉 [Termal Yazıcı ve Donanım Protokolü](01-mimari-ve-altyapi/DONANIM_VE_TERMAL_YAZICI_PROTOKOLU.md)
4. 🧪 **4. Adım (Kabul Testleri ile Doğrulama):**
   * 👉 [Test ve Rehberler](04-test-ve-rehberler/) bölümündeki adımlarla doğrulama yapın.

---

## 📂 Dizin Yapısı ve Belge Envanteri

### 0. [00-devir-rehberi](00-devir-rehberi/) — Devir Teslim ve Modüler Şartnameler
* [DEVIR_REHBERI.md](00-devir-rehberi/DEVIR_REHBERI.md): **[ANA DEVİR HUB]** Sistemin ne iş yaptığı, modül modül yetenekler, yol haritası ve kalite kapıları.
* [MASTER_TODO_LIST.md](00-devir-rehberi/MASTER_TODO_LIST.md): **[CANLI GÖREV PANOSU]** Faz ve modül bazında 80 maddelik eksiksiz mühendislik görev ve iş dağılım listesi.
* [DURUM_VE_YOL_HARITASI.md](00-devir-rehberi/DURUM_VE_YOL_HARITASI.md): 28 haftalık sprint takvimi, fazlandırma ve canlı teslimat durumu.
* [MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md](00-devir-rehberi/MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md): **[Modül 1 Şartnamesi]** Plaka OCR, Ruhsat OCR, TSB Kasko eşleştirmesi, 30 saniyenin altında araç kabul.
* [MODUL_02_IS_EMRI_VE_ATOLYE_YONETIMI.md](00-devir-rehberi/MODUL_02_IS_EMRI_VE_ATOLYE_YONETIMI.md): **[Modül 2 Şartnamesi]** Lift koordinasyonu, iş emri durum makinesi, teknisyen mobil iş akışı.
* [MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md](00-devir-rehberi/MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md): **[Modül 3 Şartnamesi]** Konsolide mal kabul, ortak EAN eşleme, termal QR mühürleme ve sıfır sahipsiz parça.
* [MODUL_04_SESLI_NOT_VE_WHISPER_AI.md](00-devir-rehberi/MODUL_04_SESLI_NOT_VE_WHISPER_AI.md): **[Modül 4 Şartnamesi]** Sanayi ortamında gürültü filtreleme, yerel ses kaydı, asenkron Whisper ve Llama-3 yapılandırılmış JSON çıktısı.
* [MODUL_05_CEVRIMDISI_SENKRONIZASYON.md](00-devir-rehberi/MODUL_05_CEVRIMDISI_SENKRONIZASYON.md): **[Modül 5 Şartnamesi]** Bodrum katında SQLite Drift, Outbox kuyruğu, Hybrid Logical Clocks ve Karantina Hakemliği.
* [MODUL_06_SIHIRLI_LINK_VE_MUSTERI_PORTALI.md](00-devir-rehberi/MODUL_06_SIHIRLI_LINK_VE_MUSTERI_PORTALI.md): **[Modül 6 Şartnamesi]** PWA canlı araç takip ekranı, usta fotoğrafları, anlık teklif onayı ve sanal POS.
* [MODUL_07_ERP_VE_ON_MUHASEBE_KOPRUSU.md](00-devir-rehberi/MODUL_07_ERP_VE_ON_MUHASEBE_KOPRUSU.md): **[Modül 7 Şartnamesi]** HiCariTakip, Logo, Mikro ile hibrit yetki ayrımı, fatura aktarımı ve finansal kilitler.

### 1. [01-mimari-ve-altyapi](01-mimari-ve-altyapi/) — Sistem Omurgası ve Altyapı
* [TEKNIK_MIMARI.md](01-mimari-ve-altyapi/TEKNIK_MIMARI.md): Katmanlı sistem topolojisi (.NET 9, PostgreSQL 17, Flutter, Next.js 19, Python AI).
* [TASARIM_SISTEMI_VE_MOBIL_ERGONOMI.md](01-mimari-ve-altyapi/TASARIM_SISTEMI_VE_MOBIL_ERGONOMI.md): **[Tasarım Sistemi]** Atölye ve sanayi ergonomisi, WCAG AAA renk jetonları, dokunmatik hedefler ve haptik kuralları.
* [BILESEN_KATALOGU_VE_UI_KIT.md](01-mimari-ve-altyapi/BILESEN_KATALOGU_VE_UI_KIT.md): **[Bileşen Kataloğu & UI-Kit]** Sıfır tasarım kopukluğu anayasası, atomik bileşenler (56px buton, Plaka rozeti, DVI çipi), durum-renk matrisi ve yeni modül kontrol listesi.
* [VERITABANI_SEMASI_VE_RLS_KURALLARI.md](01-mimari-ve-altyapi/VERITABANI_SEMASI_VE_RLS_KURALLARI.md): PostgreSQL 17 DDL şeması, `TenantId` $\rightarrow$ `BranchId` $\rightarrow$ `WarehouseId` çok seviyeli RLS politikaları.
* [CEVRIMDISI_VE_KARANTINA_MIMARISI.md](01-mimari-ve-altyapi/CEVRIMDISI_VE_KARANTINA_MIMARISI.md): Çakışma çözümleme protokolü, Karantina Olayları (`QuarantineIncidents`) ve hakemlik paneli.
* [DONANIM_VE_TERMAL_YAZICI_PROTOKOLU.md](01-mimari-ve-altyapi/DONANIM_VE_TERMAL_YAZICI_PROTOKOLU.md): Bluetooth SPP/BLE ESC-POS el terminali ve masaüstü ağ yazıcıları entegrasyonu.
* [KIMLIK_OTURUM_VE_YETKI_MATRISI.md](01-mimari-ve-altyapi/KIMLIK_OTURUM_VE_YETKI_MATRISI.md): Çok şubeli RBAC rolleri, JWT ve teknisyenler için 4 haneli PIN pad oturum açma akışı.

### 2. [02-oto-servis-ve-operasyon](02-oto-servis-ve-operasyon/) — Saha ve Atölye Sözleşmeleri
* [MOTOSIKLET_VE_ESCOOTER_SERVIS_SOZLESMESI.md](02-oto-servis-ve-operasyon/MOTOSIKLET_VE_ESCOOTER_SERVIS_SOZLESMESI.md): **[1. Ticari Satış Şartnamesi]** Motosiklet ve E-Scooter servisi için 10+8 DVI muayenesi, 2D dokunmatik şema, hazır parça kataloğu ve bağımsız teknisyen tableti (`/tech`).
* [MOBIL_VE_WEB_EKRAN_TASARIMLARI.md](02-oto-servis-ve-operasyon/MOBIL_VE_WEB_EKRAN_TASARIMLARI.md): **[Ekran Tel Çerçeveleri]** Lift Kanban, Teknisyen Tech Board, Mobil DVI Muayene, Müşteri PWA Portalı ve Filo Paneli wireframe'leri.
* [ARAC_KABUL_VE_EKSPERTIZ_SOZLESMESI.md](02-oto-servis-ve-operasyon/ARAC_KABUL_VE_EKSPERTIZ_SOZLESMESI.md): 2D Araç silueti hasar işaretleme, kilometre artış projeksiyonu ve dijital kabul fişi.
* [KAPALI_DEVRE_PARCA_IZLENEBILIRLIGI.md](02-oto-servis-ve-operasyon/KAPALI_DEVRE_PARCA_IZLENEBILIRLIGI.md): Parçanın depoya girişinden araç liftten inene kadarki kapalı devre mühürleme döngüsü.
* [USTA_PRIM_VE_PERFORMANS_HAKEDISI.md](02-oto-servis-ve-operasyon/USTA_PRIM_VE_PERFORMANS_HAKEDISI.md): Standart işçilik zamanı (AW) ve teknisyen prim hakediş kuralları.
* [ARAC_TESLIMAT_VE_KAPI_CIKIS_IZNI.md](02-oto-servis-ve-operasyon/ARAC_TESLIMAT_VE_KAPI_CIKIS_IZNI.md): Esnek kapı çıkış izni, açık hesap cari devri ve dijital imza.

### 3. [03-is-alanlari-ve-yonetim](03-is-alanlari-ve-yonetim/) — İş Alanları ve B2B Entegrasyonlar
* [TOPTANCI_B2B_GATEWAY_SOZLESMESI.md](03-is-alanlari-ve-yonetim/TOPTANCI_B2B_GATEWAY_SOZLESMESI.md): Martaş, Başbuğ B2B robotları ile canlı stok/fiyat sorgusu ve otomatik sipariş.
* [DAHILI_OEM_CAPRAZ_REFERANS_KATALOGU.md](03-is-alanlari-ve-yonetim/DAHILI_OEM_CAPRAZ_REFERANS_KATALOGU.md): Filtre, buji, balata çapraz OE/Aftermarket eşleştirme kütüphanesi.
* [WHATSAPP_VE_ILETISIM_CUZDAN_MOTORU.md](03-is-alanlari-ve-yonetim/WHATSAPP_VE_ILETISIM_CUZDAN_MOTORU.md): Meta Cloud API, 200 mesaj taban kota, ön ödemeli cüzdan ve SMS fallback.
* [HIBRIT_ERP_SENKRONIZASYON_SOZLESMESI.md](03-is-alanlari-ve-yonetim/HIBRIT_ERP_SENKRONIZASYON_SOZLESMESI.md): Çift yönlü çatışmasız ERP köprüsü ve Tek Gerçek Kaynak (SSOT) kuralları.

### 4. [04-test-ve-rehberler](04-test-ve-rehberler/) — Manuel Testler ve Doğrulama
* [ARAC_KABUL_HIZI_MANUEL_TEST.md](04-test-ve-rehberler/ARAC_KABUL_HIZI_MANUEL_TEST.md): 30 saniye altında araç kabulü adım adım doğrulama senaryosu.
* [CEVRIMDISI_CALISMA_VE_KARANTINA_TESTI.md](04-test-ve-rehberler/CEVRIMDISI_CALISMA_VE_KARANTINA_TESTI.md): İnternetsiz tamamlama vs web iptali çakışma ve hakemlik testi.
* [MAL_KABUL_VE_QR_BASIM_TESTI.md](04-test-ve-rehberler/MAL_KABUL_VE_QR_BASIM_TESTI.md): Toptancı kolisinden el terminaliyle termal etiket basım testi.

### 5. [05-gecmis-ve-arsiv](05-gecmis-ve-arsiv/) — Arşiv ve Eski Taslaklar
* [AKILLI_SERVIS_V1_MASTER_BLUEPRINT.md](05-gecmis-ve-arsiv/AKILLI_SERVIS_V1_MASTER_BLUEPRINT.md): 20 sayfalık ilk PDF dokümanının analizi ve tarihsel dökümü.
