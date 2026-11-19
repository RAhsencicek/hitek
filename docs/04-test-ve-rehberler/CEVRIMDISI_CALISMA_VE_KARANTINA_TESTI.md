# Test Kılavuzu: Çevrimdışı Çalışma ve Karantina Hakemliği Testi

> **Test Kodu:** TEST-OFFLINE-01  
> **Durum:** Canlı Test Senaryosu (Manual Runbook)  
> **Hedef:** İnternetsiz ortamda teknisyen işlemi ile ofis iptalinin çakışmasını ve Karantina Havuzunun tetiklenmesini doğrulamak.  
> **İlgili Şartname:** [Çevrimdışı ve Karantina Mimarisi](../01-mimari-ve-altyapi/CEVRIMDISI_VE_KARANTINA_MIMARISI.md)

---

## 1. Test Ortamı ve Ön Koşullar

1. 1 Adet Android/iOS Test Cihazı (Flutter Mobil Uygulaması kurulu).
2. 1 Adet Web Tarayıcı (Next.js Servis Müdürü Paneli açık).
3. Test için tanımlanmış `34 ABC 123` plakalı açık iş emri (`#WO-9001`).
4. Atölye deposunda tanımlı `1 Adet Bosch Fren Balatası` stoğu.

---

## 2. Adım Adım Test Senaryosu

### Adım 1: Mobil Cihazı Çevrimdışı Yapma
* Teknisyen telefonunu **Uçak Modu'na (Airplane Mode)** alın.
* Wi-Fi ve Hücresel Verinin kapalı olduğundan emin olun.
* Mobil uygulamanın üst çubuğunda 🔴 **"Çevrimdışı Mod (Yerel Bellek)"** rozetinin yandığını doğrulayın.

### Adım 2: Çevrimdışı Parça Sarfı ve İş Emrini Kapatma
* Teknisyen telefonunda `#WO-9001` iş emrini açın.
* "Parça Ekle" butonuna basarak 1 adet `Bosch Fren Balatası` ekleyin.
* "İşi Tamamla" butonuna basın ve ekrana test amaçlı bir imza atın.
* **Beklenen Sonuç:** Uygulama hata vermeden iş emrini yerel olarak kapatmalı, "İşlem internet bağlantısı sağlandığında sunucuya aktarılacak" uyarısını göstermelidir.

### Adım 3: Ofis Tarafında İş Emrini İptal Etme
* Web tarayıcısında Servis Müdürü paneline gidin.
* İnternet açıkken `#WO-9001` iş emrini açın.
* "İş Emrini İptal Et" butonuna basarak iptal gerekçesini girin: *"Müşteri vazgeçti, araç geri çekildi"*.
* **Beklenen Sonuç:** Sunucuda iş emrinin durumu `Cancelled` olmalıdır.

### Adım 4: Mobil Cihazı İnternete Bağlama (Çakışma Anı)
* Teknisyen telefonundaki **Uçak Modu'nu kapatın**.
* Wi-Fi bağlantısının kurulmasını bekleyin.
* Arka plan Outbox Worker'ın uyanmasını izleyin (veya mobil ekranda "Eşitlemeyi Başlat" butonuna basın).
* **Beklenen Sonuç (Kritik Doğrulama):**
  * Mobil cihaz sunucudaki `Cancelled` durumunu ezmemelidir!
  * Sunucu mobil cihazdaki `Completed` durumunu da yok sayıp ezmemelidir!
  * İş emrinin durumu hem mobilde hem webde 🟠 **`QUARANTINE_REVIEW (Karantinada)`** olmalıdır.

### Adım 5: Servis Müdürü Hakemlik Kartı Doğrulaması
* Web panelinde **"Karantina ve İstisnalar"** sekmesini açın.
* Ekranda beliren hakemlik kartını inceleyin:
  * *Sunucu Durumu:* `İptal Edildi (Danışman: Mehmet Bey)`
  * *Saha Durumu:* `Tamamlandı (Teknisyen: Ahmet Usta, 1 Adet Fren Balatası Takıldı, İmzalı)`
* **"Sahadaki İşlemi Onayla (Parça Takıldı)"** butonuna tıklayın.
* **Beklenen Sonuç:**
  * İş emri durumu yeşil `Invoiced (Faturalandırıldı)` durumuna geçmelidir.
  * Takılan parçanın stok düşümü kesinleşmelidir.
  * Teknisyenin telefonuna SignalR üzerinden *"İş emriniz servis müdürü tarafından onaylandı"* bildirimi düşmelidir.
