# HiServis AI — Mühendis ve Ekip Devir Teslim Rehberi

> **Durum:** Yaşayan Ana Devir Belgesi (Living Handover Hub)  
> **Sürüm:** v1.2 (Multi-Industry Agnostic Architecture & Production-Ready)  
> **Son Güncelleme:** 19 Kasım 2026  
> **Sorumlu:** Kurucu Ortaklar (Lead Architect & CPO)  
> **İlgili Referanslar:** [PROJE_ANAYASASI.md](../../PROJE_ANAYASASI.md) · [Dokümantasyon Bilgi Haritası](../README.md) · [Yol Haritası](DURUM_VE_YOL_HARITASI.md)

Bu rehber, HiServis AI platformunu devralacak, üzerinde mimari geliştirme yapacak veya modül ekleyecek tüm mühendislik ve ürün ekipleri için **ana başlangıç ve devir teslim merkezidir**.

---

## 1. Sistemin Özü ve Varlık Sebebi (What & Why)

Türkiye ve küresel pazarda bağımsız özel oto servisleri, asansör periyodik bakım firmaları, endüstriyel jeneratör & kompresör servisleri ve iklimlendirme/HVAC sağlayıcıları olmak üzere yüz binlerce teknik saha ve atölye operasyonu bulunmaktadır. Bu işletmelerin %80'i hâlâ kağıt defter, WhatsApp grupları veya 2000'li yıllardan kalma statik masaüstü yazılımlarla yönetilmektedir.

Mevcut çözümlerin sahada patladığı 3 büyük kronik yara vardır:
1. **İnternet Kesintisinde Kilitlenme:** Sanayi sitelerinin bodrum katlarında, bina altı asansör kuyularında veya kırsal jeneratör kabinlerinde GSM çekmediğinde bulut tabanlı yazılımlar çalışmaz; teknisyen iş emrini açamaz veya parça düşemez.
2. **Sahipsiz Parça ve Yanlış Montaj:** Parçacıdan gelen koliler depoya atılır; hangi parçanın hangi lifteki araca veya hangi asansör ünitesine ait olduğu bilinemez. Ahmet Usta'nın aracı için gelen parça yanlışlıkla Mehmet Usta'nın liftindeki araca takılır.
3. **Müşteri İletişim Maliyeti ve Güvensizlik:** Müşteri servise bıraktığı aracın/makinenin durumunu bilemez; usta telefonda saatlerce laf anlatır. Gönderilen her WhatsApp mesajı ise işletmeye döviz maliyeti yükler.

**HiServis AI bu 3 sorunu agnostik endüstriyel çekirdeğiyle kökten çözer:**
* **Agnostik Çok Sektörlü Varlık Yönetimi:** `Assets` tablosundaki `primary_identifier`, `secondary_identifier` ve `dynamic_attributes JSONB` ile oto servis (Plaka/Şase), asansör (Bakanlık UAVT/Kimlik No), jeneratör (Seri No/Hourmeter) ve fabrikaları sıfır kod değişikliğiyle destekler.
* **Offline-First:** Flutter + Drift SQLite ile bodrumda ve asansör kuyusunda sıfır gecikmeyle çalışır.
* **Kapalı Devre Mühürlü Parça:** Toptancıdan gelen kutu, depoya girdiği saniye Varlık Kimliği + İş Emri QR kodu ile termal yazıcıdan mühürlenir.
* **Akıllı İletişim & PWA:** Kabulde atılan tek bir bildirimle müşteri PWA ekranına yönlendirilir; tüm fotoğraf, teklif ve durum onayları ücretsiz web üzerinden yürütülür.

---

## 2. Mimari Prensipler ve Değiştirilemez Kurallar

HiServis AI kod tabanında geliştirme yapacak her mühendisin uymak zorunda olduğu 5 teknik kural:

### Kural 1: Sessiz Karantina (Silent Quarantine over Silent Overwrite)
Çevrimdışı teknisyen cihazı internete bağlandığında, eğer sunucudaki iş emri ofis tarafından iptal edilmişse veya stok eksiye düşmüşse; sistem asla "Son Yazılan Kazanır (LWW)" mantığıyla veriyi ezemez. Olay derhal `QuarantineIncidents` tablosuna yazılır ve Servis Müdürünün paneline tek tıkla onaylanacak/düzeltilecek bir hakemlik kartı olarak düşürülür.

### Kural 2: Hiyerarşik Veri İzolasyonu (Tenant $\rightarrow$ Branch $\rightarrow$ Warehouse)
Veritabanında hiçbir tablo salt `TenantId` ile korunamaz. Her işlem zorunlu olarak bir `BranchId` (Şube/Atölye) ve `WarehouseLocationId` (Merkez Depo, Şube Rafı, Gezici Araç *Van Stock*) ile ilişkilendirilir. Bostancı şubesindeki danışman, Maslak rafındaki parçayı doğrudan tüketemez; transfer irsaliyesi gerekir.

### Kural 3: Servis Operasyonunda HiServis Tek Gerçek Kaynaktır (SSOT)
İş emri açılışı, parça sarfiyatı, teknisyen işçilik süresi ve servis fişi taslağında tek yetkili kaynak HiServis'tir. Harici muhasebe sistemleri (HiCariTakip, Logo, Mikro) sadece resmi faturanın ve cari tahsilatın kesildiği alıcı uçlardır.

### Kural 4: Ağır AI Asenkron Outbox ile Çalışır
Telefon donanımında internetsiz ortamda yalnızca hafif modeller (Plaka/Barkod OCR) yerel çalışır. Whisper sesli iş emri ve Llama-3 yapılandırılmış JSON çıkarımı sunucu tarafında asenkron `OutboxEvents` işleyicileri tarafından yürütülür. Teknisyene çevrimdışıyken anlık transkripsiyon sözü verilmez.

### Kural 5: 30 Saniyenin Altında Araç Kabul
Araç kabul formu hiçbir zaman kullanıcının 15 tane metin kutusu doldurmasını gerektirecek şekilde tasarlanamaz. Kamera plakayı okur, varsa geçmiş gelir; yoksa Ruhsat OCR + TSB Araç Kodu ile marka/model/motor tipi tek saniyede otomatik doldurulur.

---

## 3. Modül Envanteri ve Canlı Durum

| Modül No | Modül Adı | Durum | Şartname Belgesi | Kritik Bağımlılıklar |
|---|---|---|---|---|
| **01** | Hızlı Araç Kabul & Ruhsat | Şartname Hazır | [MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md](MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md) | On-Device OCR, TSB Kasko API |
| **02** | İş Emri & Atölye Yönetimi | Şartname Hazır | [MODUL_02_IS_EMRI_VE_ATOLYE_YONETIMI.md](MODUL_02_IS_EMRI_VE_ATOLYE_YONETIMI.md) | Lift Durum Makinesi, Teknisyen RBAC |
| **03** | Tedarik & Mühürlü Parça | Şartname Hazır | [MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md](MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md) | ESC-POS Termal QR, PO 1:N İlişkisi |
| **04** | Sesli Not & Whisper AI | Şartname Hazır | [MODUL_04_SESLI_NOT_VE_WHISPER_AI.md](MODUL_04_SESLI_NOT_VE_WHISPER_AI.md) | Python FastAPI, Whisper-large-v3 |
| **05** | Çevrimdışı Senkronizasyon | Şartname Hazır | [MODUL_05_CEVRIMDISI_SENKRONIZASYON.md](MODUL_05_CEVRIMDISI_SENKRONIZASYON.md) | Drift SQLite, Hybrid Logical Clock |
| **06** | Sihirli Link & PWA Portal | Şartname Hazır | [MODUL_06_SIHIRLI_LINK_VE_MUSTERI_PORTALI.md](MODUL_06_SIHIRLI_LINK_VE_MUSTERI_PORTALI.md) | Next.js 19 PWA, WebSockets, PayTR |
| **07** | ERP & Ön Muhasebe Köprüsü | Şartname Hazır | [MODUL_07_ERP_VE_ON_MUHASEBE_KOPRUSU.md](MODUL_07_ERP_VE_ON_MUHASEBE_KOPRUSU.md) | Outbox Pattern, Logo/HiCari API |

---

## 4. Kalite Kapıları ve "Bitti (Definition of Done)" Kriterleri

Bir mühendis geliştirdiği özelliği tamamladım diyebilmek için şu 4 kalite kapısından geçmek zorundadır:

1. **Çevrimdışı Dayanıklılık Testi:** Cihaz uçak moduna alındığında geliştirilen ekran beyaz ekran vermemeli, veri kaybı yaşamamalı ve internet geldiğinde Outbox kuyruğu üzerinden hatasız senkronize olmalıdır.
2. **Çok Şubeli RLS İzolasyon Testi:** A şubesindeki kullanıcının token'ı ile B şubesinin verisi sorgulandığında PostgreSQL seviyesinde `0 satır` dönmelidir.
3. **Idempotent API Garantisi:** Ağ kopması nedeniyle aynı sipariş veya ödeme isteği 3 kez art arda gönderildiğinde sistem asla çift tahsilat veya mükerrer stok düşümü yapmamalıdır.
4. **Manuel Test Kılavuzu:** Özelliğin [04-test-ve-rehberler/](../04-test-ve-rehberler/) altında adım adım test adımları ve beklenen ekran görüntüleri tarif edilmiş olmalıdır.
