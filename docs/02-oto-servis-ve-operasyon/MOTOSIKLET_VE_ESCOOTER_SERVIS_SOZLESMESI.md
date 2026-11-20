# Motosiklet ve E-Scooter Servisleri İçin Master Satış & Uygulama Şartnamesi

Bu belge; acil satış yapılacak olan **Motosiklet ve E-Scooter Servis İşletmesi** için sistemin sahada kusursuz çalışmasını, dükkan sahibinin (Ahmet Usta) 5 dakikada ikna edilmesini ve geliştirici mühendislerin sıfır soru işaretiyle kodu yazmasını sağlayacak **4 kritik çekirdek maddenin** ayrıntılı şartnamesidir.

---

## 1. Rol Bazlı Mimari ve Ekran Ayrımı (Yönetici vs. Teknisyen)

Sistem tek ekranda sekmeler halinde değil; iki tamamen farklı amaca hizmet eden bağımsız kullanıcı arayüzü rotasına (route) bölünür:

```
                                [ HİSERVİS AI GİRİŞ ]
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 ▼                                                 ▼
     ┌───────────────────────┐                         ┌───────────────────────┐
     │  YÖNETİCİ & DANIŞMAN  │                         │   ATÖLYE TEKNİSYEN    │
     │   PORTALI (/portal)   │                         │    TABLETİ (/tech)    │
     ├───────────────────────┤                         ├───────────────────────┤
     │ • Ofis Masaüstü / PC  │                         │ • Duvar / El Tableti  │
     │ • Klavye & Mouse      │                         │ • Dokunmatik / 56px   │
     │ • Kasa, Ciro, Fatura  │                         │ • SIFIR Finansal Veri │
     │ • Kabul & Kanban      │                         │ • 4 Haneli Hızlı PIN  │
     └───────────────────────┘                         └───────────────────────┘
```

### 1.1. Yönetici & Servis Danışmanı Portalı (`/` veya `/portal`)
* **Hedef Cihaz:** Ofisteki masaüstü bilgisayar veya laptop (Geniş ekran, klavye/fare).
* **Erişebileceği Alanlar:**
  1. **Hızlı Motosiklet & Scooter Kabulü:** Plaka veya gövde QR ile 30 saniyede kabul, müşteri fişi çıkarma.
  2. **İstasyon / Lift Kanban Panosu:** Hangi liftte hangi motor var, kim çalışıyor, kim bekliyor.
  3. **Satınalma & Depo Konsolu:** Toptancı siparişleri, gelen parçaların mal kabulü ve stok takibi.
  4. **Kasa, Fatura & WhatsApp Onayları:** Müşteri cari hesapları, işçilik ve parça kâr marjları, e-fatura kesimi, tahsilat.
  5. **Karantina & İnceleme:** Ofis iptali ile atölye işçiliği çakışmalarının yönetici tarafından çözümlenmesi.
* **Gizlilik Kuralı:** Teknisyen hakedişleri, toptancı alış fiyatları ve dükkanın cirosu **SADECE** bu ekranda görünür.

### 1.2. Atölye Teknisyen Tableti (`/tech`)
* **Hedef Cihaz:** Atölyede liftin yanındaki duvara monte edilmiş tablet veya teknisyenin cebindeki telefon.
* **Ergonomi Kuralı:** Yağlı eldivenler için minimum 56px butonlar, dev yazılar, yüksek kontrast.
* **4 Haneli PIN Giriş Mekanizması (`PinAuthService`):**
  * Tablet sürekli açık kalır; ana ekranda dev bir Numpad bulunur: `"Usta Kodunuzu Girin"`.
  * Usta kodunu tuşlar (Örn: `1234` -> Ahmet Usta).
  * Sistem şifre sormaz, anında Ahmet Usta'nın üzerine atanmış aktif işleri açar.
* **Teknisyenin Karşısına Çıkan Yalın Arayüz:**
  * Ekranda sadece ustanın üzerindeki 1 veya 2 motor/scooter kartı görünür.
  * Kartın üzerinde: **Varlık (34 MTO 99 - Honda PCX)**, **Müşteri Şikayeti ("Varyatör titriyor, yağ değişecek")**, **İstasyon (MOTO-LIFT-1)**.
  * **3 Dev Buton:**
    1. 🟢 **[İŞE BAŞLA]** (Canlı çalışma sayacı - labor timer dönmeye başlar).
    2. 🟠 **[PARÇA TALEP ET]** (Listeden hızlıca "1L Castrol Yağ" veya "Varyatör Kayışı" seçilir).
    3. 🔴 **[İŞİ BİTİR & TESTE GÖNDER]** (Sayaç durur, usta işi tamamlar).
* **Güvenlik ve İzolasyon:** Teknisyen asla toptancı alış fiyatını, faturayı veya kasanın durumunu göremez. 60 saniye dokunulmazsa tablet otomatik olarak PIN ekranına kilitlenir.

---

## 2. Motosiklet & E-Scooter DVI (Güvenlik Kontrolü) ve 2D SVG Hasar Şeması

Motosiklette 4 tekerlekli araba gibi sadece çiziğe bakılmaz; 2 teker üzerinde giden kuryenin **can güvenliği** söz konusudur. Dükkandan çıkan araçta kaza olursa sorumluluk servise kalır.

### 2.1. Motosiklet Hayati Güvenlik Kontrol Listesi (10 Kritik Nokta)
| No | Kontrol Noktası | Güvenlik Standardı | Durum Seçenekleri |
|---|---|---|:---:|
| 1 | **Ön Fren Manet & Balata** | Balata et kalınlığı $> 2.0\text{ mm}$, manet sertliği tam olmalı | `[Yeşil: İyi] / [Sarı: Yakın] / [Kırmızı: Tehlikeli]` |
| 2 | **Arka Fren Teli / Hidroliği** | Telde saçaklanma olmamalı, kampana ayarı boşluksuz olmalı | `[Yeşil: İyi] / [Sarı: Ayar Gerek] / [Kırmızı: Kopuk/Bitişik]` |
| 3 | **Lastik Basıncı & Diş Derinliği** | Ön: 29 PSI, Arka: 33 PSI, diş derinliği $> 1.6\text{ mm}$ | `[Basınç Değeri Girilir] / [Kırmızı: Kabak Lastik]` |
| 4 | **Gidon Bilyası & Ön Maşa** | Gidon ortada kilitlenmemeli, amortisör keçelerinde yağ kaçağı olmamalı | `[Yeşil: Boşluksuz] / [Kırmızı: Bilya Bozuk / Keçe Patlak]` |
| 5 | **Tahrik Kayışı & Bagalar** | Kayışta çatlak olmamalı, bagalarda düzleşme olmamalı | `[Yeşil: Sağlam] / [Sarı: Aşınmış] / [Kırmızı: İptal]` |
| 6 | **Akü & Şarj Voltajı** | Rölantide $12.4\text{V}$, gaz verince $13.8\text{V} - 14.4\text{V}$ olmalı | `[Voltaj Değeri Girilir]` |
| 7 | **Buji & Ateşleme** | Elektrot aralığı $0.7\text{ mm} - 0.8\text{ mm}$, kurum bağlamamış olmalı | `[Yeşil: Temiz] / [Kırmızı: Yağlanmış/Bitik]` |
| 8 | **Motor Yağı Seviyesi** | Yağ çubuğu tırtıklı alanda olmalı, metal çapağı olmamalı | `[Yeşil: Seviye Tam] / [Kırmızı: Yağsız/Eksik]` |
| 9 | **Zincir Gerginliği & Yağlama** | Vitesli modellerde $20 - 30\text{ mm}$ esneme payı olmalı | `[Yeşil: Gergin] / [Kırmızı: Gevşek/Kuru]` |
| 10 | **Aydınlatma & Korna** | Ön far, fren stop lambası, sinyaller ve korna çalışmalı | `[Yeşil: Eksiksiz] / [Kırmızı: Yanmıyor]` |

### 2.2. E-Scooter Hayati Güvenlik Kontrol Listesi (8 Kritik Nokta)
| No | Kontrol Noktası | Güvenlik Standardı | Durum Seçenekleri |
|---|---|---|:---:|
| 1 | **Katlama Mekanizması / Boyun Pimi** | Boyunda ve kilit mandalında milimetrik boşluk dahi olmamalı *(Kırılma Riski!)* | `[Yeşil: Kilitli] / [Kırmızı: Boşluk Var / Çatlak]` |
| 2 | **Batarya Sağlığı (SoH) & Denge** | Hücre grupları arası voltaj farkı $\Delta V < 0.05\text{V}$ olmalı | `[SoH %] / [Hücre Dengesizliği: Var/Yok]` |
| 3 | **Elektronik Gaz Kolu (Hall Sensör)** | Parmak bırakıldığında anında sıfır noktasına yaylanmalı | `[Yeşil: Akıcı] / [Kırmızı: Takılı Kalıyor (Tehlike!)]` |
| 4 | **Fren Kesici Sensör (E-ABS)** | Fren manetine dokunulduğu an motor enerjiyi kesmeli | `[Yeşil: Kesiyor] / [Kırmızı: Motor Kesmiyor]` |
| 5 | **Dolgu/Pnömatik Lastik & Jant** | Jant kenarında çatlak, dolgu lastikte yerinden atma olmamalı | `[Yeşil: Düzgün] / [Kırmızı: Jant Eğri / Lastik Çatlak]` |
| 6 | **Şasi Alt Taban / Batarya Kapağı** | Sıvı teması indikatörü kırmızıya dönmemiş olmalı, vida eksiksiz olmalı | `[Yeşil: Kuru/Tam] / [Kırmızı: Darbeli/Sıvı Teması]` |
| 7 | **Anakart (ESC) Isı & MOSFET** | Soketlerde erime/kararma olmamalı, E10/E16 hata kodu vermemeli | `[Yeşil: Temiz] / [Kırmızı: Yanık Kokusu / Lehim Açık]` |
| 8 | **Şarj Portu & Su Yalıtım Tapası** | Şarj soketi pinleri sağlam ve korozyonsuz olmalı | `[Yeşil: Temiz] / [Kırmızı: Oksitli/Kırık Pin]` |

### 2.3. 2D Hasar ve Bölge SVG Koordinat Haritası (`HiDamageInspection.tsx`)
Otomobil silueti yerine tıklanabilir 2 tekerlekli şema entegre edilir:

* **Motosiklet (7 Bölge):**
  1. `FRONT_FORK`: Ön Çamurluk & Amortisör Maşası
  2. `HANDLEBAR`: Gidon, Manetler & Gösterge Paneli
  3. `FAIRING_LEFT`: Sol Yan Grenaj & Ayna
  4. `FAIRING_RIGHT`: Sağ Yan Grenaj & Ayna
  5. `SEAT_TANK`: Sele, Akü Haznesi & Yakıt Deposu
  6. `EXHAUST_SWINGARM`: Egzoz Koruma & Arka Salıncak
  7. `TAIL_LIGHT`: Arka Çamurluk, Stop Lambası & Plakalık
* **E-Scooter (5 Bölge):**
  1. `STEM_DISPLAY`: Gidon, Gaz Kolu & Ekran
  2. `FOLDING_JOINT`: Katlama Boynu & Ön Tekerlek Maşası
  3. `DECK_BATTERY`: Basamak Gövdesi & Batarya Haznesi
  4. `REAR_FENDER`: Arka Çamurluk & Fren Stop Lambası
  5. `HUB_MOTOR`: Arka Motor Tekerlek & Fren Diski

---

## 3. Motosiklet & E-Scooter Hazır Parça Kataloğu, Depo Mühürleme ve Toptancı Entegrasyonu

Dükkan sahibi sistemi açtığında bomboş bir stok ekranıyla karşılaşmaz. En çok tüketilen parçalar sisteme hazır şablon olarak gömülüdür:

### 3.1. Hazır Parça Kütüphanesi
```typescript
export const MICROMOBILITY_PARTS_SEED = [
  // --- Motosiklet Parçaları ---
  { oem: "CAS-10W40-4T", name: "Castrol Power1 10W-40 4T Sentetik Motor Yağı (1L)", unit: "Adet", category: "Yağ & Sıvı", defaultPrice: 380 },
  { oem: "MOT-7100-10W40", name: "Motul 7100 10W-40 4T Tam Sentetik Motor Yağı (1L)", unit: "Adet", category: "Yağ & Sıvı", defaultPrice: 490 },
  { oem: "BAN-BELT-PCX", name: "Bando Varyatör Tahrik Kayışı (Honda PCX/Activa Uyumlu)", unit: "Adet", category: "Şanzıman", defaultPrice: 650 },
  { oem: "DRP-ROLL-15G", name: "Dr.Pulley Varyatör Baga Ağırlık Seti (15 Gr - 6'lı)", unit: "Takım", category: "Şanzıman", defaultPrice: 420 },
  { oem: "NGK-CPR8EA9", name: "NGK CPR8EA-9 Standart Enjeksiyonlu Scooter Bujisi", unit: "Adet", category: "Ateşleme", defaultPrice: 180 },
  { oem: "BRN-PAD-FRONT", name: "Brenta Organik Ön Disk Fren Balatası", unit: "Takım", category: "Fren", defaultPrice: 280 },
  { oem: "YUA-YTX7LBS", name: "Yuasa YTX7L-BS 12V 6Ah Kuru Bakımsız Motosiklet Aküsü", unit: "Adet", category: "Elektrik", defaultPrice: 1250 },
  { oem: "ANL-WG2-1008014", name: "Anlas Winter Grip 2 Ön Lastik (100/80-14 Kurye Özel)", unit: "Adet", category: "Lastik", defaultPrice: 1450 },

  // --- E-Scooter Parçaları ---
  { oem: "SCT-SOLID-10X2", name: "10x2.125 inç Delikli Petek Dolgu Patlamaz Dış Lastik", unit: "Adet", category: "Scooter Lastik", defaultPrice: 450 },
  { oem: "ESC-36V-350W", name: "36V 350W Fırçasız Motor ESC Anakart Devresi", unit: "Adet", category: "Scooter Beyin", defaultPrice: 950 },
  { oem: "BMS-36V-15AH", name: "36V 15.3Ah Akıllı İletişimli Batarya Koruma Kartı (BMS)", unit: "Adet", category: "Batarya", defaultPrice: 680 },
  { oem: "DISC-120MM-SCT", name: "120mm Paslanmaz Çelik Fren Diski + Kaliper Seti", unit: "Takım", category: "Scooter Fren", defaultPrice: 380 },
  { oem: "THROTTLE-HALL", name: "Manyetik Hall Sensörlü Parmak Gaz Kolu Mandalı", unit: "Adet", category: "Scooter Kumanda", defaultPrice: 220 },
  { oem: "FOLD-HOOK-STEEL", name: "Güçlendirilmiş Çelik Katlama Boyun Mandalı & Kilit Pimi", unit: "Adet", category: "Gövde", defaultPrice: 290 }
];
```

### 3.2. Hazır Standart İşçilik Paketleri
1. **[⚡ 15 Dk Kurye Ekspres Bakımı]:** 1L Yağ Değişimi + Buji Temizliği + Lastik Hava Basıncı Tamamlama + Fren Boşluk Ayarı.
2. **[Varyatör Revizyonu]:** Kayış Değişimi + Baga Makaraları Yenileme + Debriyaj Balatası Zımparalama (30 Dk).
3. **[E-Scooter Dolgu Lastik Değişimi]:** Eski lastik sökümü + Yeni dolgu lastiğin sıcak fırınlanıp hidrolik presle janta geçirilmesi (25 Dk).
4. **[BMS & Lityum Hücre Onarımı]:** Arızalı paralel grubun sökülüp nikel şerit punta kaynakla yenilenmesi (60 Dk).

### 3.3. Kapalı Devre Parça Mühürleme Akışı (Cross-Dock)
```
[Toptancı Kolisinden 5 Adet Bando Kayış Çıkar]
                      │
                      ▼
[Depocu El Terminaliyle Barkodu Okutur: 4047024...]
                      │
                      ▼
[Sistem Uyarısı: "1 Adet Kayış 34 MTO 99 (Kurye Ali) İçin Bekliyor!"]
                      │
                      ▼
[Termal Yazıcıdan 50x30mm QR Mühür Çıkar]
┌──────────────────────────────────────────────┐
│ HiServis MÜHÜRLÜ YEDEK PARÇA ETİKETİ         │
│ Varlık: 34 MTO 99 (Honda PCX 125)            │
│ İstasyon: MOTO-LIFT-1    Usta: Ahmet Usta    │
│ Parça: Bando Varyatör Kayışı   [QR KODU]     │
└──────────────────────────────────────────────┘
                      │
                      ▼
[Kutunun Üstüne Yapıştırılır ──► Usta Montajda Okutur ──► Hata Riski %0]
```

---

## 4. 5 Dakikalık Müşteri Canlı Demo Senaryosu (Ahmet Usta'ya Satış Reçetesi)

Motosikletçinin kapısından girildiğinde teknik terim kullanılmaz. Ahmet Usta'nın masasına oturup iPad/Laptop açılarak şu 5 dakikalık canlı oyun oynanır:

### ⏱️ Dakika 0 - Açılış ve Damardan Girme (30 Saniye)
> *"Ahmet Usta kolay gelsin. Sana bilgisayar programı anlatmaya gelmedim. Dükkandaki en büyük 2 derdini kökünden çözeceğim:  
> **1.** Kuryeler kapıda sıra olduğunda kimin yağı değişti, kimin kayışı takıldı, kimin parçası geldi derdine son veriyoruz.  
> **2.** Çırakların faturaya yazmayı unuttuğu kaçak işçiliklerin ve kaybolan yedek parçaların parasını kuruşu kuruşuna cebine geri koyuyoruz.  
> Gel sana 2 dakikada dükkanına bir motor girdiğinde ne olduğunu göstereyim."*

### ⏱️ Dakika 1 - Danışman Ekranında 20 Saniyede Hızlı Kabul (60 Saniye)
1. Ekrana (`/` veya `/portal`) girilir.
2. Plaka yazılır: `34 MTO 99`. Marka/Model otomatik gelir: `Honda PCX 125 (2023)`.
3. Tek dokunuşla buton seçilir: **[⚡ 15 Dk Kurye Ekspres Bakımı]**.  
   *(Ekranda otomatik olarak: 1L Castrol Yağ + Buji Kontrolü + 250 TL İşçilik satırları anında dolar).*
4. Dev Numpad ile KM girilir: `24,500`.
5. Müşteri Fişi Bas butonuna basılır.
> *"Usta bak, 20 saniye sürdü. Kağıt aramadın, hesap makinesi kurcalamadın. Kabul fişi müşterinin WhatsApp'ına gitti, motor da atölyedeki 1. Lift'e düştü."*

### ⏱️ Dakika 2 - Teknisyen Tableti ve PIN Girişi (60 Saniye)
1. Tablet ekranına (`/tech`) geçilir.
2. Numpad'den `1234` tuşlanır (Ahmet Usta giriş yapar).
3. Ekranda **SADECE** az önce kabul ettiğimiz `34 MTO 99` motoru görünür.
4. Dev yeşil **[İŞE BAŞLA]** butonuna basılır. Canlı kronometre saymaya başlar.
> *"Usta bak, çırağın senin kasanı, kârını, toplam cironu göremiyor. Çırak sadece önüne gelen motora bakıyor. Butona basıyor, işe başlıyor."*

### ⏱️ Dakika 3 - Parça Mührü ve Çapraz Montaj Kilidi (60 Saniye)
1. Usta motoru açar: *"Varyatör kayışı da kopmak üzere, değişmesi lazım"* der.
2. Ekranda **[Parça İste]**'ye basıp *"Bando Kayış"*ı seçer.
3. Depo ekranına geçilir, barkod okutulur ve termal etiket çıkar: `34 MTO 99 - MÜHÜRLÜ`.
4. Usta tabletiyle parçanın üstündeki QR'ı okutur: **"Eşleşme Başarılı ✓"**.
> *"Usta, toptancıdan gelen kayışı çırak gidip yandaki başka bir kuryenin motoruna takamaz. Sistem 'Bu parça bu motorun değil!' diye kırmızı alarm verir. Parça kaybolma ihtimali sıfıra iner."*

### ⏱️ Dakika 4 - B2B Filo / Kurye Toplu Kabul Senaryosu (60 Saniye)
1. Ekranda **[Filo / Toplu Kabul]** düğmesine basılır.
2. Firma seçilir: *Getir / Trendyol Go Esnaf Kurye Filosu*.
3. Barkod okuyucuyla 5 motorun plakası/gövde kodu peş peşe taranır (5 saniyede 5 iş emri açılır).
4. Teklif tek tıkla filo yöneticisine PDF dökümü olarak çıkar.
> *"Usta, filo sana 5 motor birden getirdiğinde yarım saat fatura yazmakla uğraşmıyorsun; tek tıkla filonun carisine borç geçiyorsun."*

### ⏱️ Dakika 5 - Kapanış ve Satışın Bitirilmesi (30 Saniye)
> *"Ahmet Usta; ayda sadece 3 tane parçanın kaybolmasını engellesek ve çırakların unuttuğu 5 tane işçiliği sisteme kaydettirsek, bu program kendi parasını ilk 10 günde çıkartıyor.  
> Kurulumu bugün yapıyoruz, yarın sabah liftlerinde çalışmaya başlıyorsun. Ne dersin?"*
