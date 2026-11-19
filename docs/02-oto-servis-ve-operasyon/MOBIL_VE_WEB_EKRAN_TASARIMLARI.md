# HiServis AI — Mobil ve Web Ekran Tasarımları & Tel Çerçeve Kılavuzu (Wireframes)

> **Durum:** Canlı Arayüz Şartnamesi (UI/UX Blueprint) · Sürüm: v1.1  
> **Sorumlu:** Kurucu Ortaklar (Lead Architect & CPO)  
> **İlgili Referanslar:** [PROJE_ANAYASASI.md](../../PROJE_ANAYASASI.md) · [Tasarım Sistemi](../01-mimari-ve-altyapi/TASARIM_SISTEMI_VE_MOBIL_ERGONOMI.md) · [Hızlı Araç Kabul](../00-devir-rehberi/MODUL_01_HIZLI_ARAC_KABUL_VE_RUHSAT.md)

---

## 1. Ekran 1: Lift & Atölye Kanban Görünümü (Workshop Bay View)

Servis müdürü ve danışmanın atölyedeki tüm liftleri, çalışma istasyonlarını ve açık iş emirlerini kuş bakışı izlediği ana kumanda ekranı.

### Tel Çerçeve (Wireframe):
```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  HiServis AI   [MASLAK MERKEZ]     🔍 [Plaka, Şase veya RO Ara...]     🔔 (2)   👨‍💼 Mehmet Danışman│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Filtreler: [ Hepsi (24) ] [ 🔴 Acil (3) ] [ ⏳ Müşteri Onayı Bekleyen (4) ] [ 📦 Parça Yolda (2) ] │
├────────────────────────────────┬───────────────────────────────┬────────────────────────────┤
│  LİFT 1 (Mekanik / Ağır Bakım) │  LİFT 2 (Periyodik Hızlı Bakım)│  LİFT 3 (Rot-Balans / Ön Takım)│
│  Teknisyen: Ahmet Usta         │  Teknisyen: Can Usta          │  Teknisyen: Murat Usta     │
├────────────────────────────────┼───────────────────────────────┼────────────────────────────┤
│  ┌───────────────────────────┐ │  ┌───────────────────────────┐ │  ┌──────────────────────────┐│
│  │ 34 ABC 123                │ │  │ 06 BCD 456                │ │  │ 35 CDE 789               ││
│  │ Passat 1.6 TDI (2018)     │ │  │ Megane 1.5 dCi (2020)     │ │  │ Corolla 1.8 Hybrid (2022)││
│  │ RO: #WO-10492             │ │  │ RO: #WO-10495             │ │  │ RO: #WO-10498            ││
│  │ ───────────────────────── │ │  │ ───────────────────────── │ │  │ ──────────────────────── ││
│  │ [🔴 Acil] [📦 Parça Geldi] │ │  │ [🟢 Tüm Onaylar Tamam]    │ │  │ [⏳ Müşteri Onayı Bekliyor]│
│  │ İlerleme: [██████░░] %75  │ │  │ İlerleme: [████████] %100 │ │  │ İlerleme: [██░░░░░░] %25 ││
│  │ Süreç: 01:45 / Hedef: 02:00│ │  │ Süreç: 00:40 / Hedef: 00:45│ │  │ Süreç: 00:15 / Hedef: 01:00││
│  └───────────────────────────┘ │  └───────────────────────────┘ │  └──────────────────────────┘│
│  [ + Bu Lifte Araç Ata ]       │  [ ✅ Aracı İndir & Teslime Al]│  [ 📞 Müşteriyi Ara / Hatırlat]│
└────────────────────────────────┴───────────────────────────────┴────────────────────────────┘
```

---

## 2. Ekran 2: Teknisyen "Tech Board" & İşçilik Sayacı (Mobile First)

Atölyedeki teknisyenin telefonunda veya lift yanındaki tablette açılan, sadece kendi görevlerine odaklanmış temiz arayüz.

### Mobil Tel Çerçeve (390px x 844px):
```text
┌────────────────────────────────────────┐
│  HiServis Tech           📶 🔋 94%     │
│  👨‍🔧 Ahmet Usta (Maslak - Lift 1)       │
├────────────────────────────────────────┤
│  GÜNLÜK VERİMLİLİK HEDEFİ:              │
│  Hedef: 8.0 Saat  |  Kazanılan: 6.5 Saat │
│  [████████████████░░░░] %81            │
├────────────────────────────────────────┤
│  ŞU AN ÜZERİNDE ÇALIŞILAN ARAÇ:        │
│  ┌──────────────────────────────────┐  │
│  │ 34 ABC 123                       │  │
│  │ Volkswagen Passat 1.6 TDI (2018) │  │
│  │ RO: #WO-10492                    │  │
│  │                                  │  │
│  │ AKTİF İŞÇİLİK SAYAÇ:             │  │
│  │     ⏱️ 01:24:35                  │  │
│  │     (Hedef: 02:00:00)            │  │
│  │                                  │  │
│  │ [ ⏸️ Mola / Duraklat ]           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  YAPILACAK İŞLEMLER:                   │
│  [x] Ön Fren Disk & Balata Değişimi    │
│  [ ] 4 Litre 5-30 Yağ & Filtre Değişimi│
│  [ ] Sağ Salıncak Burcu Kontrolü       │
│                                        │
│  PARÇA DURUMU:                         │
│  [ 📦 4/4 Parça Mühürlü Teslim Alındı ]│
├────────────────────────────────────────┤
│  SABİT ALT AKSİYON (STICKY BAR - 72px): │
│  ┌──────────┬───────────┬────────────┐ │
│  │ 🎙️ Dikte  │ 📸 Foto   │ ✅ Tamamla │ │
│  └──────────┴───────────┴────────────┘ │
└────────────────────────────────────────┘
```

---

## 3. Ekran 3: Mobil Dijital Muayene (DVI) & 2D Hasar Silueti

Teknisyenin aracı incelerken kusurları parmağıyla 2D araç şeması üzerine işaretlediği ve 3 kademeli durum seçtiği muayene arayüzü.

### Mobil Tel Çerçeve (DVI Inspection):
```text
┌────────────────────────────────────────┐
│  < Geri    DİJİTAL MUAYENE (DVI)       │
│  34 ABC 123 - Volkswagen Passat B8     │
├────────────────────────────────────────┤
│  İNTERAKTİF HASAR VE KUSUR ŞEMASI:     │
│       ┌──────────────────────┐         │
│       │       [ ÖN ]         │         │
│       │    ┌──────────┐      │         │
│  SOL  │    │  (🔴 Pin)│  SAĞ │         │
│       │    │          │      │         │
│       │    │  (🟡 Pin)│      │         │
│       │    └──────────┘      │         │
│       │       [ ARKA ]       │         │
│       └──────────────────────┘         │
│  [Pin 1]: Ön Sağ Disk Aşınmış (🔴 Acil) │
│  [Pin 2]: Sol Rot Başı Boşluk (🟡 Orta)│
├────────────────────────────────────────┤
│  KONTROL LİSTESİ MADDESİ (3/14):       │
│  ┌──────────────────────────────────┐  │
│  │ ÖN FREN BALATALARI VE DİSKLER    │  │
│  │                                  │  │
│  │ Durum Seçimi:                    │  │
│  │ [ 🟢 Sorunsuz ]                  │  │
│  │ [ 🟡 Takip Gerekir ]             │  │
│  │ [ 🔴 ACİL DEĞİŞİM (Seçildi) ]    │  │
│  │                                  │  │
│  │ Fotoğraf ve Kanıt:               │  │
│  │ ┌─────────┐  ┌─────────┐         │  │
│  │ │ [Görsel]│  │ [ + Ekle]│        │  │
│  │ └─────────┘  └─────────┘         │  │
│  │ Açıklama: "Disk kalınlığı 18mm   │  │
│  │ sınırının altına inmiş."         │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  [ 🎙️ Sesle Kusur Açıkla ] [ Sonraki >]│
└────────────────────────────────────────┘
```

---

## 4. Ekran 4: Müşteri PWA Sihirli Link & Kalem Bazlı Teklif Onayı

Araç sahibinin telefonuna WhatsApp üzerinden gelen linke tıkladığında tarayıcıda açılan modern teklif onay portalı.

### Müşteri Mobil Web Portalı (PWA):
```text
┌────────────────────────────────────────┐
│  HiServis Takip       MASLAK OTO SERVİS│
├────────────────────────────────────────┤
│  Merhaba Sayın Ahmet Yılmaz,           │
│  34 ABC 123 plakalı aracınızın servis  │
│  muayenesi tamamlandı.                 │
│                                        │
│  ARAÇ SAĞLIK SKORU:                    │
│      72 / 100  [████████░░░]           │
├────────────────────────────────────────┤
│  İŞLEM VE TEKLİF LİSTESİ:              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 1. 10.000 KM PERİYODİK BAKIM     │  │
│  │ Motor Yağı, Yağ, Hava, Polen F.  │  │
│  │ Tutar: 3.450 ₺                   │  │
│  │ [ ✔️ ONAYLANDI ]                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 2. ÖN FREN BALATA & DİSK DEĞİŞİMİ│  │
│  │ 🔴 Usta Uyarısı: Güvenlik Riski  │  │
│  │ [Fotoğrafı Gör (Kırmızı İşaretli)]│  │
│  │ Tutar: 2.800 ₺                   │  │
│  │ Seçim: [ ✔️ ONAYLA ]  [ ✖️ REDDET ]│  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 3. KLİMA GAZI DOLUMU VE BAKIMI   │  │
│  │ 🟡 Tavsiye Edilen İşlem          │  │
│  │ Tutar: 950 ₺                     │  │
│  │ Seçim: [ ✔️ ONAYLA ]  [ ✖️ ŞİMDİLİK]│  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  GÜNCEL TOPLAM TUTAR (KDV Dahil):      │
│  💰 6.250 ₺                            │
│                                        │
│  [ ✍️ DİJİTAL İMZA AT VE ONAYLA ]      │
│  (Tek tıkla atölyeye onay iletilir)    │
└────────────────────────────────────────┘
```

---

## 5. Ekran 5: Filo Yönetimi ve Toplu Onay Paneli (Fleet View)

Kurumsal filo müşterileri (100+ araçlık kiralama veya lojistik firmaları) için masaüstü yönetim konsolu.

### Masaüstü Tel Çerçeve:
```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  HiServis Filo Portalı   [ABC LOJİSTİK A.Ş. - 142 Araç]   Dönem: Kasım 2026   👤 Filo Müdürü│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ÖZET KARTLAR:                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ Servisteki Araç│  │ Onay Bekleyen  │  │ Aylık Harcama  │  │ KM Başına Servis Maliyeti  │ │
│  │     14 Araç    │  │   6 Talep      │  │   248.500 ₺    │  │         1.42 ₺ / KM        │ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ONAY BEKLEYEN FİLO İŞ EMİRLERİ:                          [ Tüm Rutin Bakımları Toplu Onayla ]│
│  ┌──────────┬─────────────────┬──────────────────────┬──────────┬───────────┬─────────────┐ │
│  │ Plaka    │ Sürücü          │ Yapılacak İşlem      │ Tutar    │ Durum     │ Aksiyon     │ │
│  ├──────────┼─────────────────┼──────────────────────┼──────────┼───────────┼─────────────┤ │
│  │ 34 LOJ 01│ Ali Kaya        │ Periyodik 30.000 Bak.│ 4.200 ₺  │ Rutin     │ [ Onayla ]  │ │
│  │ 34 LOJ 08│ Veli Demir      │ Debriyaj Seti Değişim│ 14.500 ₺ │ Ağır Arıza│ [ İncele ]  │ │
│  │ 34 LOJ 19│ Selim Tekin     │ Kış Lastiği Montajı  │ 1.800 ₺  │ Rutin     │ [ Onayla ]  │ │
│  └──────────┴─────────────────┴──────────────────────┴──────────┴───────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---
*Bu ekran tasarımları ve tel çerçeveler, HiServis AI frontend ve mobil geliştirme ekiplerinin doğrudan uygulayacağı UI/UX şartnamesidir.*
