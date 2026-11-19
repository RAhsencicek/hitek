# Test Kılavuzu: Toptancı Mal Kabul ve Termal Mühür Basım Testi

> **Test Kodu:** TEST-WAREHOUSE-01  
> **Durum:** Canlı Test Senaryosu (Manual Runbook)  
> **Hedef:** Toptancıdan gelen ortak EAN barkodlu parçanın bekleyen araca tahsis edilmesi ve termal mühür etiketinin basılmasını doğrulamak.  
> **İlgili Şartname:** [Tedarik ve Mühürlü Parça](../00-devir-rehberi/MODUL_03_TEDARIK_VE_MUHURLU_PARCA.md)

---

## 1. Test Ortamı ve Ön Koşullar

1. El Terminali veya Kamera Barkod Okuyuculu Mobil Cihaz.
2. Bluetooth veya Ağ üzerinden bağlı 50mm x 30mm Termal Etiket Yazıcısı (ESC/POS uyumlu).
3. Sistemde bekleyen 2 açık iş emri:
   * **İş Emri 1:** `34 ABC 123` (Passat) — Talep: 1 Adet Bosch Fren Balatası (`EAN: 4047024185242`)
   * **İş Emri 2:** `06 BCD 456` (Megane) — Talep: 1 Adet Bosch Fren Balatası (`EAN: 4047024185242`)
4. Test amaçlı basılı `4047024185242` EAN barkodu.

---

## 2. Adım Adım Test Senaryosu

### Adım 1: Barkod Okutma
* Depo görevlisi mobil uygulamasında **"Mal Kabul & Parça Eşleştirme"** ekranını açar.
* Kutunun üzerindeki `4047024185242` barkodunu kamerayla okutur.
* **Beklenen Sonuç:**
  * Sistem 500ms içinde sorguyu tamamlamalıdır.
  * Ekranda bekleyen 2 iş emri aciliyet sırasıyla listelenmelidir:
    1. `34 ABC 123 - Ahmet Usta (Lift 2) [Öncelikli / Acil]`
    2. `06 BCD 456 - Mehmet Usta (Lift 4) [Normal]`

### Adım 2: Araca Tahsis ve Termal Yazıcı Tetikleme
* Depocu `34 ABC 123` satırındaki **"Bu Araca Tahsis Et & Mühür Bas"** butonuna basar.
* **Beklenen Sonuç:**
  * Termal yazıcıdan 1 saniye içinde etiket çıkmalıdır.
  * Etiketin üzerinde açıkça şunlar yazmalıdır:
    * `İŞ EMRİ: #WO-2026-10492`
    * `PLAKA: 34 ABC 123`
    * `ŞASE: WVWZZZ3CZWE123456`
    * `PARÇA: Bosch Fren Balatası`
    * `Okunabilir HiServis QR Kodu`

### Adım 3: Lifte Teslim ve Çapraz Doğrulama
* Depocu etiketi kutuya yapıştırıp Lift 2'deki teknisyene teslim eder.
* Teknisyen kendi mobil uygulamasından "İş Emrimdeki Parçayı Doğrula" butonuna basarak kutunun üzerindeki QR kodu okutur.
* **Beklenen Sonuç:**
  * Ekranda yeşil onay rozeti çıkmalı: *"Mühür Doğrulandı: Bu parça sizin aracınız içindir."*
  * Parça durumu iş emrinde *"Montaja Hazır"* olarak güncellenmelidir.
