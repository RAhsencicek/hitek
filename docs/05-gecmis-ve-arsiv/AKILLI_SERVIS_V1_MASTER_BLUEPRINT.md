# Arşiv: Akıllı Servis Yönetim Sistemi v1.0 Master Blueprint Sentezi

> **Durum:** Tarihsel Arşiv (Historical Archive) · Sürüm: v1.0  
> **Arşivlenme Tarihi:** 18 Kasım 2026  
> **Referans Alınan Orijinal Belge:** [Akilli Servis Yonetim Sistemi.pdf](../../Akilli%20Servis%20Yonetim%20Sistemi.pdf) (20 Sayfa)  
> **Yeni Canlı Doküman:** [PROJE_ANAYASASI.md](../../PROJE_ANAYASASI.md) · [Dokümantasyon Bilgi Haritası](../README.md)

---

## 1. İlk Taslağın Genel Özeti

Orijinal v1.0 dokümanı, Hayat İşleri İşletme Çözümleri tarafından hazırlanan ve Türkiye Saha Servis Yönetimi (FSM) pazarında FieldCo gibi rakiplerin eksikliklerini kapatmayı hedefleyen 20 sayfalık geniş kapsamlı bir vizyon belgesidir.

Dokümanda öngörülen ana yetenekler:
* Tek kod tabanında 16 dikey sektör desteği (Otomotiv, Asansör, İklimlendirme, Medikal vb.)
* 7 Fazlı, 28 haftalık genel yol haritası
* Whisper sesli iş emri doldurma ve Ruhsat OCR vaatleri
* PostgreSQL 17 JSONB ve Flutter SQLite Drift mimarisi
* Çift yönlü ERP entegrasyonu (HiCariTakip, Logo, Mikro vb.)

---

## 2. Kurucu Ortak İncelemesinde Yapılan Mimari Düzeltmeler

18 Kasım 2026 tarihindeki Sokratesçi tartışma ve Lead Architect / CPO incelemesinde tespit edilen ve v1.1'e evrilen kritik düzeltmeler şunlardır:

1. **GTM Odaklanması:** İlk sürümde 16 sektöre birden açılıp enerjiyi dağıtmak yerine, pazar büyüklüğü ve regülasyon baskısı en yüksek olan **Bağımsız Özel Oto Servisleri ve Filo Bakım** pazarına odaklanılması kararlaştırıldı.
2. **Veri Modeli Antipattern Düzeltmesi:** Orijinal dokümandaki `WorkOrderPartRequests & PurchaseOrders` 1:1 birleşik tablosu ayrılarak, kurumsal toptancı siparişlerini destekleyen `PurchaseOrders` (Header) ve `PurchaseOrderLines` (1:N) ilişkisel modeline geçildi.
3. **Karantina Havuzu (Quarantine Queue):** Orijinal dokümanda sadece alan bazlı CRDT birleştirmesi öngörülürken; durum makinesi çakışmaları (Örn: Ofiste İptal vs Sahada Tamamlandı) için otomatik ezmeyi engelleyen ve servis müdürüne karar bırakan Karantina Havuzu tasarlandı.
4. **Hibrit Birim Ekonomisi:** Orijinal dokümandaki sınırsız WhatsApp mesajlaşmasının Meta döviz maliyetleri nedeniyle şirket marjını eritmesini önlemek amacıyla, **Sihirli Link (PWA Web Takip)** birincil kanal yapıldı ve her pakete 200 mesaj taban kota verilerek aşım cüzdana bağlandı.
5. **Çevrimdışı AI Realizmi:** Whisper ve büyük LLM'lerin telefon donanımında internetsiz çalışamayacağı gerçeğiyle; hafif Edge OCR mobilde, ağır ses işleme ise internet geldiğinde asenkron Outbox ile sunucuda çalışacak şekilde ikiye ayrıldı.
