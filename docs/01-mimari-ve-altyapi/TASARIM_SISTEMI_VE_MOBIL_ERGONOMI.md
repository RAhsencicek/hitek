# HiServis AI — Tasarım Sistemi ve Mobil Ergonomi Şartnamesi (Design System)

> **Durum:** Canlı Tasarım Sözleşmesi (Living Design System) · Sürüm: v1.1  
> **Sorumlu:** Lead Architect & CPO (Kurucu Ortaklar)  
> **İlgili Referanslar:** [PROJE_ANAYASASI.md](../../PROJE_ANAYASASI.md) · [Ekran Tasarımları](../02-oto-servis-ve-operasyon/MOBIL_VE_WEB_EKRAN_TASARIMLARI.md) · [Teknik Mimari](TEKNIK_MIMARI.md)

---

## 1. Tasarım Felsefesi ve Saha Gerçekleri (Design Principles)

HiServis AI, steril ofis ortamlarında değil; **motor gürültüsünün, yağlı parmakların, zayıf ışıklı tamir çukurlarının ve güneş altındaki araç kabul otoparklarının** tam ortasında çalışmak üzere tasarlanmıştır.

Küresel liderler (**Shopmonkey**, **Tekmetric**, **AutoLeap**) incelenerek harmanlanan 4 temel tasarım ilkemiz:

1. **Parmak ve Leke Dostu (Touch & Grease First):** Teknisyen ekranı kirletmeden, yağlı eldiveniyle bile min. 56x56 px butonlara rahatça basabilmelidir. Serbest metin yazma gereksinimi %80 oranında elenmiş; yerine hazır çipler (chips), sesli dikte ve kamera OCR konulmuştur.
2. **Çift Modlu Aşırı Işık Adaptasyonu (Extreme Light Adaptation):**
   * *Atölye ve Çukur İçin:* Leke gizleyen, gözü yormayan derin **Dark Mode** (`#0B0F19` zemin, fosforlu durum aksanları).
   * *Dış Park ve Müşteri İçin:* Parlak gün ışığında bile parlamayı kıran yüksek kontrastlı **Light Mode** (`#FFFFFF` ve `#0F172A`).
3. **Görsel Flaş ve Haptik (Titreşim) Onayı:** Kompresör ve havalı tabanca gürültüsünde sesli bildirimler duyulmaz. Butona basıldığında telefon tok bir titreşim (haptic feedback) verir ve işlem yeşil onay halkasıyla doğrulanır.
4. **Kalem Bazlı Şeffaflık (Granular Transparency):** Müşteri ve filo yöneticisi, teklifin tamamını tek tıkla reddetmek zorunda kalmaz; ustanın çektiği hasarlı parça fotoğrafını görerek kalem kalem (balatayı onayla, klimayı ertele) seçim yapabilir.

---

## 2. Renk Paleti ve Anlamsal Jetonlar (Semantic Design Tokens)

WCAG 2.1 AAA kontrast standartlarına uygun olarak tasarlanan renk paleti:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  HİSERVİS AI RENK SKALASI (WCAG AAA)                                   │
│  Primary Brand:     #2563EB (Cobalt Blue)  / #1E3A8A (Navy Dark)       │
│  Danger / Urgent:   #DC2626 (Red-600)      - Fren bitik, Acil arıza    │
│  Warning / Pending: #D97706 (Amber-600)    - Parça beklemede, Bakım    │
│  Success / Done:    #059669 (Emerald-600)  - Test geçti, Onaylandı     │
│  In Progress / Bay: #0284C7 (Sky-600)      - Lifte alındı, Saat akıyor │
│  Dark Surface:      #0B0F19 (Derin Gece)   / #1E293B (Kart Zemin)      │
│  Light Surface:     #F8FAFC (Slate Zemin)  / #FFFFFF (Kart Zemin)      │
└────────────────────────────────────────────────────────────────────────┘
```

### Renk Kullanım Matrisi:
| Durum | Açık Mod (Hex) | Koyu Mod (Hex) | Anlamı ve Kullanım Alanı |
|---|---|---|---|
| **Primary** | `#2563EB` | `#3B82F6` | Birincil butonlar, aktif sekme, kamera tetikleyici |
| **Danger (Kırmızı)** | `#DC2626` | `#EF4444` | Güvenlik riski, aşınmış parça, süresi geçmiş iş emri |
| **Warning (Turuncu)** | `#D97706` | `#F59E0B` | Müşteri onayı bekliyor, parça yolda, yaklaşan bakım |
| **Success (Yeşil)** | `#059669` | `#10B981` | Muayene sağlam (Pass), ödeme tamamlandı, parça mühürlendi |
| **Info / Bay (Mavi)** | `#0284C7` | `#38BDF8` | Lifte alındı, aktif sayaç işliyor |
| **Neutral Muted** | `#64748B` | `#94A3B8` | Şase no, model yılı, yardımcı etiketler |

---

## 3. Tipografi ve Okunabilirlik Kuralları

* **Font Ailesi:** `Inter` veya `Plus Jakarta Sans` (Tabular Numbers `font-variant-numeric: tabular-nums` ile).
* **Tipografi Hiyerarşisi:**
  * **Hero Plaka & RO:** `24px ExtraBold` (Örn: **34 ABC 123** — 2 metre uzaktan bile okunabilir).
  * **İş Emri Başlığı & Tutar:** `18px Bold` (Örn: **Fren Balata Değişimi — 2.450 ₺**).
  * **Buton ve Çip Metinleri:** `16px SemiBold` (Minimum dokunmatik kolaylığı).
  * **Sayaç ve Parça Kodu:** `14px Mono/Medium` (Örn: `01:45:20` veya `BOSCH-0986479`).
  * **Yardımcı Bilgi:** `13px Regular` (Kesinlikle 12px altına inilmez).

---

## 4. Temel UI Bileşenleri (Core Components)

### 4.1. Hızlı Filtre Barı (Horizontal Chip Bar)
Ustanın tek parmakla sağa-sola kaydırabileceği ve anında filtre uygulayabileceği hap butonlar:
```text
[ Hepsi (18) ]  [ 🔴 Acil (3) ]  [ ⏳ Onay Bekleyen (5) ]  [ 📦 Parça Yolda (2) ]  [ 🟢 Hazır (8) ]
```

### 4.2. Yapışkan Alt Aksiyon Barı (Sticky Bottom Action Bar)
Teknisyenin başparmağının tam altına oturan 72px yüksekliğindeki sabit eylem alanı:
```text
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🎙️ Sesli Not ]    [ 📸 Hızlı Fotoğraf ]    [ ✅ Onayla & Liften İndir ]  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3. İşçilik Zaman Sayacı Widget'ı (Labor Clock-in Ring)
* Teknisyen lifte geçtiğinde tek dokunuşla başlar:
  * 🟢 **00:00 - 01:30:** Hedef süre içinde (Verimli).
  * 🟡 **01:30 - 02:00:** Süre sınırına yaklaşıldı (%80 uyarı).
  * 🔴 **02:00+:** Hedef süre aşıldı (Gecikme rozeti ve müdüre bildirim).

### 4.4. Fotoğraf Üzerine Çizim ve Kusur İşaretleme (Markup Tool)
* Kamera çekimi sonrası açılan hafif tuval:
  * 🔴 **Kırmızı Ok:** Hasarlı noktayı gösterir.
  * 🟡 **Sarı Çember:** Çatlak veya aşınmış bölgeyi yuvarlak içine alır.
  * 🔤 **Metin:** Kısa açıklama (Örn: "Yağ sızıntısı").
