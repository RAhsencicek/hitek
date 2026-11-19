# HiServis AI — Master Görev Listesi ve Fazlandırılmış İş Dağılımı (Master TODO List)

> **Durum:** Canlı Uygulama Panosu (Active Implementation Board)  
> **Sürüm:** v1.1  
> **Son Güncelleme:** 18 Kasım 2026  
> **Sorumlu:** Kurucu Ortaklar (Lead Architect & CPO)  
> **İlgili Referanslar:** [PROJE_ANAYASASI.md](../../PROJE_ANAYASASI.md) · [Yol Haritası](DURUM_VE_YOL_HARITASI.md) · [Bileşen Kataloğu](../01-mimari-ve-altyapi/BILESEN_KATALOGU_VE_UI_KIT.md)

Bu doküman; HiServis AI platformunun tüm özelliklerini, UI bileşenlerini, veri modellerini ve API uçlarını faz ve modül bazında eksiksiz bir kontrol listesine (To-Do List) döken **ana mühendislik görev panosudur**.

---

## 📊 İlerleme Özeti (Progress Dashboard)

| Faz | Kapsam | Görev Sayısı | Tamamlanan | Durum |
|---|---|:---:|:---:|:---:|
| **Faz 0** | Mimari Çekirdek, Veritabanı (RLS) & UI-Kit Altyapısı | 12 | 9 (Çekirdek Tamamlandı) | 🟡 Devam Ediyor |
| **Faz 1** | Hızlı Araç Kabul & İş Emri / Lift Yönetimi | 14 | 11 (Çekirdek Tamamlandı) | 🟢 Tamamlandı |
| **Faz 2** | Tedarik Zinciri, Konsolide Mal Kabul & Termal QR | 10 | 10 | 🟢 Tamamlandı |
| **Faz 3** | Offline-First (Drift SQLite) & Karantina Hakemliği | 12 | 0 | ⚪ Sırada |
| **Faz 4** | Müşteri PWA Portalı, Teklif Onayı & İletişim Cüzdanı | 11 | 0 | ⚪ Sırada |
| **Faz 5** | Whisper Sesli İş Emri AI & Toptancı B2B Hub | 9 | 0 | ⚪ Sırada |
| **Faz 6** | Filo Yönetimi, ERP Köprüsü & Pilot Lansman | 12 | 0 | ⚪ Sırada |
| **TOPLAM**| **Tüm Sistem** | **80 Görev** | **30** | **%37.5 Tamamlandı** |

---

## 🛠️ FAZ 0: Mimari Çekirdek, Veritabanı & Tasarım Sistemi UI-Kit

### 0.1. Tasarım Sistemi & UI-Kit Kurulumu (Frontend & Mobil)
- [x] **0.1.1** Küresel pazar araştırması (Shopmonkey, Tekmetric, AutoLeap) ve tasarım ergonomi analizinin yapılması.
- [x] **0.1.2** WCAG AAA uyumlu renk jetonlarının (`#2563EB`, `#DC2626`, `#059669`) ve tipografi kurallarının belirlenmesi.
- [x] **0.1.3** Durum Makinesi Görsel Eşleme Matrisinin (`Open`, `InProgress`, `QUARANTINE_REVIEW` vb.) yazılması.
- [x] **0.1.4** 56px dokunmatik buton, Türk Plaka Rozeti ve 3 kademeli DVI çipi bileşen şartnamelerinin çıkarılması.
- [x] **0.1.5** Next.js 19 (Tailwind CSS + WCAG AAA Dark/Light Mode) için `theme.config`, özel renk sınıfları ve atomik UI-kit bileşenlerinin (`HiPlateBadge`, `HiButton56`, `HiStatusBadge`, `HiNumpad`, `HiDviChip`, canlı vitrin/showcase) kodlanması.
- [ ] **0.1.6** Flutter mobil istemcisi için `ThemeData` (Dark/Light mode) ve ortak widget kütüphanesinin (`HiPlateBadge`, `HiButton56`, `HiStatusBadge`) kodlanması.

### 0.2. Veritabanı ve Güvenlik Altyapısı (Backend)
- [x] **0.2.1** PostgreSQL 17 DDL şemasının (Tenants, Branches, Warehouses, Assets, WorkOrders, POs) yazılması.
- [x] **0.2.2** Çok kiracılı ve çok şubeli RLS (`TenantId` $\rightarrow$ `BranchId` $\rightarrow$ `WarehouseId`) izolasyon kurallarının tanımlanması.
- [x] **0.2.3** Entity Framework Core 9 / Npgsql veri erişim katmanının, PostgreSQL 17 RLS oturum arayazılımının (`PostgreSqlRlsInterceptor`) ve SQL şemalarının ayağa kaldırılması.
- [x] **0.2.4** JWT tabanlı kimlik doğrulama, `TenantResolutionMiddleware` ve atölye ustaları için 4 haneli PIN pad hızlı giriş servisinin (`PinAuthService`) kodlanması.
- [ ] **0.2.5** Redis Cluster ve SignalR anlık iletişim altyapısının kurulması.
- [ ] **0.2.6** `OutboxEvents` transaksiyonel mesajlaşma tablosu ve arka plan işleyicisinin (Background Worker) oluşturulması.

---

## 🚗 FAZ 1: Hızlı Varlık Kabul & Çok Sektörlü İş Emri / İstasyon Yönetimi (Modül 1 & 2)

### 1.1. Hızlı Varlık Kabul & Giriş Motoru
- [x] **1.1.1** Google ML Kit mobil plaka tanıma kamerasının entegrasyonu (< 500ms tarama).
- [x] **1.1.2** Ruhsat fotoğrafı çekimi ve Python FastAPI / PaddleOCR üzerinden Şase, Motor ve Tescil Tarihi ayrıştırıcı uç.
- [x] **1.1.3** Türkiye Sigorta Birliği (TSB) Kasko Araç Kataloğu veritabanı eşleme servisi (Marka/Model/Motor otomatik dolumu).
- [x] **1.1.4** 2D Araç Silueti dokunmatik hasar işaretleme bileşeni (Çizik, Göçük, Boya pinleri ve zorunlu fotoğraf modalı).
- [x] **1.1.5** Dev Numpad ile Kilometre/Sayaç girişi ve Müşteri Kabul Fişi otomatik üretim motoru.

### 1.2. İstasyon & Atölye Kanban Yönetimi (Workshop Bay View)
- [x] **1.2.1** İstasyon/Lift bazlı Kanban panosu (İstasyon 1, İstasyon 2, Diagnostik, Kalibrasyon sütunları).
- [x] **1.2.2** Kart sürükle-bırak (Drag & Drop) ile istasyona varlık atama ve durum güncelleme akışı.
- [x] **1.2.3** Öncelik rozetleri: `[🔴 Acil]`, `[⏳ Müşteri Bekliyor - Waiter]`, `[📦 Parça Geldi]`, `[🚙 VIP Filo / Kurumsal]`.
- [x] **1.2.4** Teknisyen mobil "Tech Board" ekranı: Sadece atanan işlerin listelenmesi ve dev "İşe Başla / Bitir" butonları.
- [x] **1.2.5** Canlı işçilik sayacı (Labor Clock-in): Hedef süre vs geçen süre renkli zaman halkası göstergesi.
- [x] **1.2.6** İş emri kalemleri kontrol listesi (Checklist) ve usta onay kutuları.
- [ ] **1.2.7** Atölye içi sesli bildirimler ve havalı tabanca/makine gürültüsü için görsel flaş alarmları.
- [ ] **1.2.8** Varlık teslimat ve esnek kapı çıkış akışı (Ödenmeyen bakiyenin Cari Hesaba otomatik devri).
- [ ] **1.2.9** Usta prim hakediş motoru (Standart işçilik zamanı AW/FRU bazlı prim hesaplama).

### 1.3. Çok Sektörlü Dinamik Şablon Motoru (Multi-Industry Sector Presets)
- [x] **1.3.1** Sektörel Şablon Kataloğu (Oto Servis, Asansör & Yürüyen Merdiven, Jeneratör & Kompresör, HVAC, Fabrika Makinesi parametreleri).
- [x] **1.3.2** Web Arayüzünde Dinamik Sektör Seçici (Sector Preset Switcher) ve yerelleştirilmiş terminoloji köprüsü.
- [x] **1.3.3** Sektöre göre dinamik kimlik (`primary_identifier`, `secondary_identifier`) ve sayaç (`current_meter`, `dynamic_attributes`) arayüz haritalaması.
- [x] **1.3.4** Backend `AssetEndpoints` çoklu sektör varlık kayıt ve arama uçlarının (`AssetType = 'Elevator' | 'Generator' | 'Automotive'`) doğrulanması.

---

## 📦 FAZ 2: Tedarik Zinciri, Konsolide Mal Kabul & Termal Mühürlü Parça (Modül 3)

### 2.1. Satınalma & Tedarikçi Siparişleri (1:N Header & Lines)
- [x] **2.1.1** Çoklu iş emri parça taleplerini tek bir Toptancı Siparişinde (PO) birleştiren satınalma sepeti.
- [x] **2.1.2** Toptancıya tek tıkla WhatsApp / PDF sipariş mektubu oluşturma.
- [x] **2.1.3** Kısmi teslimat (Partial PO Delivery) desteği ve açık sipariş bakiye takibi.

### 2.2. Konsolide Mal Kabul & Termal Mühür Basımı
- [x] **2.2.1** El terminali / mobil kamera ile toptancı kolisindeki üretici EAN barkodunu okutma ekranı.
- [x] **2.2.2** Açık iş emirleri havuzunda otomatik eşleştirme (En acil aracı öncelikli önerme algoritması).
- [x] **2.2.3** Bluetooth SPP ve Ağ ESC/POS termal yazıcı servis katmanı (50mm x 30mm etiket formatı).
- [x] **2.2.4** Plaka, Şase No, İş Emri No ve `HS-WO...` güvenlik tokenı içeren QR kodlu termal mühür basımı.
- [x] **2.2.5** Ustanın lifte gelen parçayı okutarak doğru araca takıldığını doğrulayan "Çapraz Montaj Kilidi".
- [x] **2.2.6** Uyumsuz parça tersine lojistik akışı (`ReturnToSupplier` rafına aktarım ve yeni talep açma).
- [x] **2.2.7** Gezici servis araçları için "Van Stock" mobil depo stok düşüm ve transfer irsaliyesi onayı.

---

## 🔄 FAZ 3: Offline-First (Drift SQLite) & Karantina Hakemliği (Modül 5)

### 3.1. Mobil Yerel Veritabanı & Çevrimdışı Çalışma
- [ ] **3.1.1** Flutter Drift SQLite yerel veritabanı şemasının oluşturulması (Assets, WorkOrders, Parts, Logs).
- [ ] **3.1.2** Mobil transaksiyonel `LocalOutboxTable` kuyruk yapısının kurulması.
- [ ] **3.1.3** İnternetsiz ortamda parça düşümü, iş emri kapatma ve müşteri imzasının yerel diske şifreli kaydı.
- [ ] **3.1.4** Ağ durum dinleyicisi (Connectivity Listener) ve üst çubuk Çevrimdışı Durum Rozeti.

### 3.2. Senkronizasyon Motoru & Karantina Çakışma Yönetimi
- [ ] **3.2.1** Hibrit Mantıksal Saat (HLC) zaman damgası üretim ve karşılaştırma algoritması.
- [ ] **3.2.2** `POST /api/v1/sync/batch` idempotent toplu eşitleme API uç noktası.
- [ ] **3.2.3** Çakışma tespit motoru: Ofiste İptal vs Sahada Tamamlandı çatışmasını algılama.
- [ ] **3.2.4** `QuarantineIncidents` tablosuna çakışma kaydı atılması ve iş emrinin `QUARANTINE_REVIEW` yapılması.
- [ ] **3.2.5** Servis Müdürü Karantina Hakemlik Paneli: *Sahayı Onayla*, *Ofisi Koru*, *Manuel Düzelt* aksiyonları.
- [ ] **3.2.6** Çözülen karantina olayının arka planda stok ve muhasebe kayıtlarına yansıtılması.
- [ ] **3.2.7** Uçak modunda tamamlama vs web iptali uçtan uca kabul testinin otomasyona bağlanması.

---

## 📱 FAZ 4: Müşteri PWA Portalı, Teklif Onayı & İletişim Cüzdanı (Modül 6 & 9)

### 4.1. Müşteri Sihirli Link PWA Takip Ekranı
- [ ] **4.1.1** Kurulum gerektirmeyen, hafif, responsive Next.js 19 Müşteri PWA portalı.
- [ ] **4.1.2** Araç Sağlık Skoru (72/100 görsel hız göstergesi grafiği).
- [ ] **4.1.3** Ustanın çektiği hasarlı parça fotoğrafları ve kırmızı/sarı işaretlemelerin gösterimi.
- [ ] **4.1.4** Kalem bazlı bağımsız onay/red seçicisi (Örn: Balatayı onayla, klimayı ertele).
- [ ] **4.1.5** Canlı sepet ve KDV dahil anlık toplam tutar hesaplayıcı.
- [ ] **4.1.6** Ekrana parmakla ıslak dijital imza atma ve kabul fişinin müşteriye indirtilmesi.
- [ ] **4.1.7** PayTR / iyzico sanal POS üzerinden kredi kartı veya havale ile anında ödeme entegrasyonu.

### 4.2. Akıllı İletişim ve Ön Ödemeli Cüzdan Motoru
- [ ] **4.2.1** Meta WhatsApp Cloud API entegrasyonu ve onaylı şablon mesajları (Kabul, Teklif, Fatura, KM Bakım).
- [ ] **4.2.2** SaaS paket içi 200 mesajlık ücretsiz taban kota takip motoru.
- [ ] **4.2.3** İşletme Ön Ödemeli İletişim Cüzdanı (Bakiye yükleme, mesaj başı düşüm).
- [ ] **4.2.4** Kredi bittiğinde devreye giren yerel SMS (Netgsm / İletimerkezi) otomatik fallback sistemi.

---

## 🎙️ FAZ 5: Whisper Sesli İş Emri AI & Toptancı B2B Gateway (Modül 4 & 10)

### 5.1. Sesli Not & Whisper AI İşleme Hattı
- [ ] **5.1.1** Flutter mobil mikrofondan sanayi arka plan gürültüsünü filtreleyen ses kayıt modülü.
- [ ] **5.1.2** Çevrimdışı ortamda kaydedilen sesin Outbox ile Python 3.12 FastAPI servisine asenkron aktarımı.
- [ ] **5.1.3** Whisper-large-v3 Türkçe otomotiv jargonu transkripsiyon servisi.
- [ ] **5.1.4** Llama-3 / GPT-4o-mini yapılandırılmış JSON çıkarımı: Parça adları, yapılan işlem ve tahmini süre.
- [ ] **5.1.5** Teknisyenin ekranına "Onay Bekleyen Sesli İş Emri" kartı düşürme ve tek tıkla iş emrine dönüştürme.

### 5.2. Toptancı B2B Entegrasyon Gateway'i
- [ ] **5.2.1** Dahili OE/Aftermarket çapraz referans veritabanı (Filtre, buji, balata, kayış eşleştirme kütüphanesi).
- [ ] **5.2.2** Martaş B2B ve Başbuğ B2B robotik API/Portal adaptörleri (Canlı stok ve servis alış fiyatı sorgusu).
- [ ] **5.2.3** İş emri ekranından çıkmadan doğrudan toptancı sepetine parça atma ve sipariş verme.
- [ ] **5.2.4** TecDoc REST API kota bazlı Enterprise arama eklentisi.

---

## 🏢 FAZ 6: Filo Yönetimi, Hibrit ERP Köprüsü, Sertleştirme & Pilot (Modül 7 & 8)

### 6.1. Filo Yönetimi ve Toplu Onay Konsolu
- [ ] **6.1.1** Kurumsal filo şirketi hesapları ve araç tahsis yapısı (Şirket, Departman, Sürücü).
- [ ] **6.1.2** Şirket harcama limitleri dahilindeki rutin periyodik bakımları "Toplu Onayla" konsolu.
- [ ] **6.1.3** Araç başına ve kilometre başına servis maliyet analitiği (TL/KM grafikleri).
- [ ] **6.1.4** Aylık toplu filo mutabakatı ve konsolide cari hesap ekstresi.

### 6.2. Hibrit ERP & Ön Muhasebe Entegrasyonu
- [ ] **6.2.1** HiCariTakip REST/JSON adaptörü (Cari hesap eşitleme ve fatura aktarımı).
- [ ] **6.2.2** Logo Go 3 / Tiger ve Mikro masaüstü ERP'leri için tek yönlü Outbox Fatura İhracı.
- [ ] **6.2.3** ERP'den dönen resmi e-Fatura/e-Arşiv UUID ve fatura numarasının HiServis'e mühürlenmesi (`IsLocked = true`).
- [ ] **6.2.4** ERP tarafında iptal edilen faturalar için "Finansal Uyarı Rozeti" tetikleme servisi.

### 6.3. Sertleştirme, E2E Testler & Pilot Servis Lansmanı
- [ ] **6.3.1** Karantina, Çevrimdışı Senkronizasyon ve Mal Kabul Playwright & Cypress E2E testleri.
- [ ] **6.3.2** Maslak ve Bostancı oto sanayi sitelerindeki 2 pilot servise donanım (Termal yazıcılar, tabletler) kurulumu.
- [ ] **6.3.3** 1 haftalık canlı pilot operasyonu: Sıfır sahipsiz parça ve sıfır veri kaybı doğrulaması.
- [ ] **6.3.4** Canlıya çıkış (Go-Live) ve resmi v1.0 sürüm duyurusu.
