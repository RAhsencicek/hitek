export type SectorId =
  | "automotive"
  | "hvac"
  | "micromobility"
  | "elevator"
  | "generator"
  | "general";

export interface SectorSample {
  id: string;
  label: string;
  primaryId: string;
  secondaryId: string;
  brand: string;
  model: string;
  modelYear: number;
  meter: number;
  customerName: string;
  customerPhone: string;
  complaint: string;
}

export interface SectorInspectionItem {
  id: string;
  label: string;
  description: string;
}

export interface SectorConfig {
  id: SectorId;
  name: string;
  shortName: string;
  tag: string;
  iconName: "Car" | "Flame" | "Bike" | "Building2" | "Zap" | "Wrench";
  branchDefaultName: string;
  assetTypeName: string;
  primaryIdentifier: {
    label: string;
    placeholder: string;
    badgeType: "plate" | "industrial";
    sampleValue: string;
  };
  secondaryIdentifier: {
    label: string;
    placeholder: string;
    sampleValue: string;
  };
  meter: {
    label: string;
    unit: string;
    sampleValue: number;
    helperText: string;
  };
  intakeTitle: string;
  intakeSubtitle: string;
  inspectionTitle: string;
  inspectionItems: SectorInspectionItem[];
  complaintPresets: string[];
  bayStations: { id: string; name: string; icon: string }[];
  demoSamples: SectorSample[];
}

export const SECTOR_PRESETS: Record<SectorId, SectorConfig> = {
  automotive: {
    id: "automotive",
    name: "Oto Servis & Filo Bakım",
    shortName: "Oto Servis",
    tag: "Otomotiv",
    iconName: "Car",
    branchDefaultName: "Maslak Atatürk Oto Sanayi Şubesi",
    assetTypeName: "Araç",
    primaryIdentifier: {
      label: "Araç Plakası (Türk Standart Plaka)",
      placeholder: "34 ABC 123",
      badgeType: "plate",
      sampleValue: "34 ABC 123",
    },
    secondaryIdentifier: {
      label: "Şase Numarası (VIN / 17 Hane)",
      placeholder: "WVWZZZ3CZWE104921",
      sampleValue: "WVWZZZ3CZWE104921",
    },
    meter: {
      label: "Güncel Kilometre",
      unit: "KM",
      sampleValue: 145200,
      helperText: "Gösterge paneli güncel kilometre bilgisi",
    },
    intakeTitle: "Hızlı Araç Kabul & İş Emri Girişi",
    intakeSubtitle: "Hedef Süre: < 30 Saniye • Plaka & Ruhsat OCR Otomasyonu",
    inspectionTitle: "2D Kaporta Hasar & Mekanik DVI Muayenesi",
    inspectionItems: [
      { id: "fren", label: "Fren Balata & Diskleri", description: "Ön ve arka balata aşınma kalınlığı" },
      { id: "lastik", label: "Lastik Diş Derinliği & Basınç", description: "Minimum 3mm emniyet sınırı" },
      { id: "sivi", label: "Motor Yağı & Fren Hidroliği", description: "Seviye ve nem kirlilik testi" },
      { id: "alt_takim", label: "Salıncak, Rot & Amortisörler", description: "Kasis ve alt takım boşluk kontrolü" },
    ],
    complaintPresets: [
      "10.000 KM Periyodik Bakım",
      "Frenlerden ötme sesi geliyor",
      "Klima soğutmuyor, gaz kontrolü",
      "Motor arıza lambası yanıyor",
      "Kasislerde ön takımdan lokurtu sesi",
      "Debriyaj kaçırıyor / vites geçişi sert",
    ],
    bayStations: [
      { id: "LIFT-1", name: "Lift 1 (Ahmet Usta)", icon: "Wrench" },
      { id: "LIFT-2", name: "Lift 2 (Mehmet Usta)", icon: "Wrench" },
      { id: "ROT-BALANS", name: "Rot-Balans İstasyonu", icon: "Settings" },
      { id: "DIAGNOSTIC", name: "Elektronik Diagnostik", icon: "Cpu" },
    ],
    demoSamples: [
      {
        id: "demo-auto-1",
        label: "34 ABC 123 (Passat B8)",
        primaryId: "34 ABC 123",
        secondaryId: "WVWZZZ3CZWE104921",
        brand: "Volkswagen",
        model: "Passat 1.6 TDI Comfortline",
        modelYear: 2021,
        meter: 145200,
        customerName: "Mehmet Yılmaz",
        customerPhone: "0532 999 8877",
        complaint: "Ön takımdan kasislerde gıcırtı ve frene basınca titreme geliyor.",
      },
      {
        id: "demo-auto-2",
        label: "06 BCD 456 (Megane 4)",
        primaryId: "06 BCD 456",
        secondaryId: "VF1RFB00862194812",
        brand: "Renault",
        model: "Megane 1.5 dCi Touch",
        modelYear: 2020,
        meter: 98400,
        customerName: "Ayşe Kaya",
        customerPhone: "0544 333 2211",
        complaint: "100.000 KM Ağır Bakım (Triger Seti + Devirdaim) değişimi.",
      },
    ],
  },

  hvac: {
    id: "hvac",
    name: "İklimlendirme, Kombi & Soğutma (HVAC)",
    shortName: "Kombi & HVAC",
    tag: "Isıtma/Soğutma",
    iconName: "Flame",
    branchDefaultName: "Kadıköy Isıtma, Soğutma & Kombi Servis Merkezi",
    assetTypeName: "Cihaz / Ünite",
    primaryIdentifier: {
      label: "Cihaz / Tesisat Barkod No",
      placeholder: "KMB-2024-8910",
      badgeType: "industrial",
      sampleValue: "KMB-2024-8910",
    },
    secondaryIdentifier: {
      label: "Cihaz Seri No / Kazan No",
      placeholder: "SN-VAI-992381-TR",
      sampleValue: "SN-VAI-992381-TR",
    },
    meter: {
      label: "Tesisat Basıncı / Cihaz Yaşı",
      unit: "Bar / Yıl",
      sampleValue: 1.5,
      helperText: "Normal çalışma aralığı: 1.2 - 1.8 Bar",
    },
    intakeTitle: "Hızlı Cihaz Kabul & Servis Talebi",
    intakeSubtitle: "Hedef Süre: < 30 Saniye • Cihaz Barkodu & Model Eşleme",
    inspectionTitle: "Kombi / Klima Güvenlik & Verimlilik Muayenesi",
    inspectionItems: [
      { id: "gaz_kacak", label: "Doğalgaz Kaçak Dedektör Testi", description: "Gaz vanası ve rekor kaçak kontrolü" },
      { id: "esnjor", label: "Ana Eşanjör & Brülör Temizliği", description: "Yanma odası kurum ve alev kontrolü" },
      { id: "genlesme", label: "Genleşme Tankı Hava Basıncı", description: "Minimum 0.8 Bar ön azot basıncı" },
      { id: "pompa", label: "Sirkülasyon Pompası & Filtre", description: "Çamur tutucu ve mil dönüş kontrolü" },
    ],
    complaintPresets: [
      "Petekler ısınmıyor / sadece üst kısmı sıcak",
      "Tesisat basıncı sürekli sıfıra düşüyor, su akıtıyor",
      "Kombiden sıcak su gelmiyor / dalgalı geliyor",
      "Klima F0/E4 arıza kodu veriyor, soğutmuyor",
      "Yıllık periyodik kışlık kombi bakımı",
      "Patlamalı yanma ve aşırı sesli çalışma",
    ],
    bayStations: [
      { id: "MOBIL-1", name: "1. Mobil Saha Ekibi (Kadıköy)", icon: "Car" },
      { id: "MOBIL-2", name: "2. Mobil Saha Ekibi (Ataşehir)", icon: "Car" },
      { id: "ATOLYE", name: "Atölye Revizyon Masası", icon: "Wrench" },
      { id: "TEST-STANDI", name: "Su & Gaz Basınç Test Standı", icon: "CheckCircle2" },
    ],
    demoSamples: [
      {
        id: "demo-hvac-1",
        label: "KMB-8910 (Vaillant ecoTEC)",
        primaryId: "KMB-2024-8910",
        secondaryId: "SN-VAI-992381-TR",
        brand: "Vaillant",
        model: "ecoTEC Plus 296/5-5 Tam Yoğuşmalı",
        modelYear: 2022,
        meter: 1.5,
        customerName: "Kemal Serter",
        customerPhone: "0533 111 2233",
        complaint: "Basınç 2 günde bir 0.5 Bar'a düşüyor, sıcak su gelip gidiyor.",
      },
      {
        id: "demo-hvac-2",
        label: "VRF-402 (Daikin Multi)",
        primaryId: "VRF-34-402",
        secondaryId: "DKN-VRV4-7712",
        brand: "Daikin",
        model: "VRV IV S-Serisi Dış Ünite",
        modelYear: 2021,
        meter: 3.2,
        customerName: "Ofis Plaza Yönetimi",
        customerPhone: "0216 444 0011",
        complaint: "Dış ünite kompresör devreye girmiyor, A3 hata kodu veriyor.",
      },
    ],
  },

  micromobility: {
    id: "micromobility",
    name: "Motosiklet & E-Scooter / Mikromobilite",
    shortName: "Moto & Scooter",
    tag: "Mikromobilite",
    iconName: "Bike",
    branchDefaultName: "Beşiktaş E-Mobility & Motosiklet Bakım Merkezi",
    assetTypeName: "Araç / Scooter",
    primaryIdentifier: {
      label: "Plaka veya Şasi / Gövde No",
      placeholder: "34 MTO 99 / SC-8812",
      badgeType: "plate",
      sampleValue: "34 MTO 99",
    },
    secondaryIdentifier: {
      label: "Batarya / BMS Seri No",
      placeholder: "BAT-72V-30AH-9912",
      sampleValue: "BAT-72V-30AH-9912",
    },
    meter: {
      label: "Güncel KM / Batarya Döngüsü",
      unit: "KM / Döngü",
      sampleValue: 12450,
      helperText: "Kilometre ve batarya şarj döngüsü sayısı",
    },
    intakeTitle: "Hızlı Motosiklet & Scooter Kabulü",
    intakeSubtitle: "Hedef Süre: < 30 Saniye • Hızlı Barkod & Batarya Okuma",
    inspectionTitle: "Motosiklet / Scooter Güvenlik & Batarya DVI",
    inspectionItems: [
      { id: "batarya", label: "Batarya Sağlığı (SoH) & Hücre Dengesi", description: "Hücre voltaj farkları < 0.05V olmalı" },
      { id: "fren", label: "Hidrolik / Tel Fren Balataları", description: "Disk kalınlığı ve tel gerginliği" },
      { id: "lastik", label: "Lastik Diş Derinliği & Jant Eğikliği", description: "Darbe veya balans eğriliği kontrolü" },
      { id: "elektronik", label: "Elektronik Gaz Kolu & Anakart (ESC)", description: "Tepki süresi ve MOSFET ısı testi" },
    ],
    complaintPresets: [
      "Batarya çok çabuk bitiyor, menzil %50 düştü",
      "Frene basınca mekanik kilitleniyor / ses yapıyor",
      "E-Scooter ekranda E16 arıza kodu veriyor",
      "Gidonda sallantı ve boşluk var, direksiyon kilitleniyor",
      "10.000 KM Motosiklet periyodik varyatör & kayış bakımı",
      "Gaz koluna basınca tekleme yapıyor",
    ],
    bayStations: [
      { id: "LIFT-MOTO", name: "Motosiklet Hidrolik Lifti", icon: "Wrench" },
      { id: "TEZGAH-SCOOTER", name: "E-Scooter Mekanik Tezgahı", icon: "Wrench" },
      { id: "BMS-LAB", name: "Batarya & BMS Test Laboratuvarı", icon: "Zap" },
      { id: "TEST-YOLU", name: "Güvenlik & Fren Test Pisti", icon: "CheckCircle2" },
    ],
    demoSamples: [
      {
        id: "demo-moto-1",
        label: "34 MTO 99 (Yamaha NMAX)",
        primaryId: "34 MTO 99",
        secondaryId: "MH3SE8610NJ109281",
        brand: "Yamaha",
        model: "NMAX 155 ABS",
        modelYear: 2022,
        meter: 18200,
        customerName: "Burak Deniz",
        customerPhone: "0535 777 6655",
        complaint: "Varyatörden ses geliyor, kalkışta titriyor ve arka fren ötüyor.",
      },
      {
        id: "demo-scooter-1",
        label: "SC-8812 (Xiaomi Pro 2)",
        primaryId: "SC-8812-TR",
        secondaryId: "BAT-XIA-12800MAH",
        brand: "Xiaomi",
        model: "Mi Electric Scooter Pro 2",
        modelYear: 2023,
        meter: 2150,
        customerName: "Caner Aydın",
        customerPhone: "0542 666 5544",
        complaint: "Yokuşta çekmiyor, batarya doluyken aniden kapanıyor.",
      },
    ],
  },

  elevator: {
    id: "elevator",
    name: "Asansör & Yürüyen Merdiven Sistemleri",
    shortName: "Asansör Bakım",
    tag: "Dikey Taşıma",
    iconName: "Building2",
    branchDefaultName: "Şişli Asansör Periyodik Bakım & Revizyon İstasyonu",
    assetTypeName: "Asansör Ünitesi",
    primaryIdentifier: {
      label: "Bakanlık Asansör Kimlik / UAVT No",
      placeholder: "AS-34-10492",
      badgeType: "industrial",
      sampleValue: "AS-34-10492",
    },
    secondaryIdentifier: {
      label: "Makine Dairesi Seri No / Ruhsat",
      placeholder: "OTIS-GEN2-REG-8819",
      sampleValue: "OTIS-GEN2-REG-8819",
    },
    meter: {
      label: "Kat Sayısı / Aylık Bakım Periyodu",
      unit: "Kat / Ay",
      sampleValue: 14,
      helperText: "Bina kat adedi ve periyodik bakım ayı",
    },
    intakeTitle: "Asansör Periyodik Bakım & Arıza Kaydı",
    intakeSubtitle: "Bakanlık Asansör Yönetmeliği (A-Tipi) ve Aylık Bakım Formu",
    inspectionTitle: "A-Tipi Muayene & Güvenlik DVI Kontrol Listesi",
    inspectionItems: [
      { id: "parasut", label: "Hız Regülatörü & Paraşüt Fren Bloğu", description: "Aşırı hız güvenlik kilidi mekanik testi" },
      { id: "halat", label: "Çelik Halat Aşınması & Klemensler", description: "Tel kopukları ve çap tolerans kontrolü" },
      { id: "kapi", label: "Kapı Emniyet Kontağı & Fotosel", description: "Sıkışma önleme emniyet testi" },
      { id: "etiket", label: "A-Tipi Muayene Etiket Durumu", description: "Yeşil (Kusursuz), Mavi (Hafif), Kırmızı (Tehlikeli)" },
    ],
    complaintPresets: [
      "Kabin katta sıfırlamıyor, 5cm kot farkı oluşuyor",
      "Kapı açılıp kapanırken takılıyor / gıcırtı yapıyor",
      "A-Tipi periyodik kontrolde Kırmızı Etiket aldı, revizyon gerek",
      "Kabin içinde aşırı sarsıntı ve ray sürtme sesi var",
      "Aylık yasal zorunlu asansör periyodik bakımı",
      "Kurtarma sistemi (UPS aküleri) elektrik kesilince çalışmıyor",
    ],
    bayStations: [
      { id: "SAHA-1", name: "1. Bölge Asansör Saha Ekibi", icon: "Car" },
      { id: "SAHA-2", name: "2. Bölge Asansör Saha Ekibi", icon: "Car" },
      { id: "ACIL-KURTARMA", name: "7/24 Acil Kurtarma Ekibi", icon: "AlertTriangle" },
      { id: "REVİZYON", name: "Pano & Motor Revizyon Atölyesi", icon: "Wrench" },
    ],
    demoSamples: [
      {
        id: "demo-el-1",
        label: "AS-10492 (Otis Gen2)",
        primaryId: "AS-34-10492",
        secondaryId: "OTIS-GEN2-REG-8819",
        brand: "Otis",
        model: "Gen2 Premier 10 Kişilik (800 kg)",
        modelYear: 2019,
        meter: 16,
        customerName: "Açelya Apartmanı Yöneticiliği",
        customerPhone: "0532 444 8899",
        complaint: "4. katta dururken sarsıntı yapıyor, kata yanaşırken kayma var.",
      },
    ],
  },

  generator: {
    id: "generator",
    name: "Jeneratör, Kompresör & Güç Sistemleri",
    shortName: "Jeneratör & Güç",
    tag: "Endüstriyel Güç",
    iconName: "Zap",
    branchDefaultName: "İkitelli Güç Sistemleri & Jeneratör Servis Merkezi",
    assetTypeName: "Jeneratör / Kompresör",
    primaryIdentifier: {
      label: "Şasi / Cihaz Seri Numarası",
      placeholder: "GEN-50KVA-7721",
      badgeType: "industrial",
      sampleValue: "GEN-50KVA-7721",
    },
    secondaryIdentifier: {
      label: "Motor / Alternatör Seri No",
      placeholder: "ENG-PERKINS-88392",
      sampleValue: "ENG-PERKINS-88392",
    },
    meter: {
      label: "Çalışma Saati (Hourmeter)",
      unit: "Saat",
      sampleValue: 2450,
      helperText: "Jeneratör motoru toplam çalışma saati",
    },
    intakeTitle: "Endüstriyel Jeneratör & Kompresör Servis Kaydı",
    intakeSubtitle: "Yük Testi, Yağ Analizi ve 250/500 Saat Periyodik Bakım",
    inspectionTitle: "Güç Ünitesi & Otomasyon DVI Kontrol Listesi",
    inspectionItems: [
      { id: "aku", label: "Akü Marş Voltajı & Şarj Redresörü", description: "Marş anında voltaj çökme testi" },
      { id: "yag_filtre", label: "Motor Yağı, Yakıt & Hava Filtreleri", description: "Tortu ve partikül kontrolü" },
      { id: "transfer", label: "Şebeke / Jeneratör Transfer Panosu (ATS)", description: "Kontaktör geçiş süresi < 10 saniye" },
      { id: "yuk_testi", label: "Yük Bankası (Load Bank) Dayanım Testi", description: "%100 yük altında 50Hz frekans kararlılığı" },
    ],
    complaintPresets: [
      "Elektrik kesilince otomatik devreye girmiyor, ATS çekmiyor",
      "Yük altına girince frekans dalgalanıyor ve stop ediyor",
      "250 Saat periyodik yağ, filtre ve antifriz bakımı",
      "Marş basmıyor, akü şarj voltajı düşük uyarısı veriyor",
      "Egzozdan siyah duman atıyor ve yakıt tüketimi yüksek",
      "Soğutma suyu harareti 95 derecenin üzerine çıkıyor",
    ],
    bayStations: [
      { id: "SAHA-JNR-1", name: "Mobil Jeneratör Saha Aracı 1", icon: "Car" },
      { id: "SAHA-JNR-2", name: "Mobil Jeneratör Saha Aracı 2", icon: "Car" },
      { id: "YUK-ODASI", name: "Yük Testi & Alternatör Odası", icon: "Zap" },
      { id: "PANO-STANDI", name: "ATS Transfer Panosu Test Masası", icon: "Settings" },
    ],
    demoSamples: [
      {
        id: "demo-gen-1",
        label: "GEN-7721 (Aksa 50 kVA)",
        primaryId: "GEN-50KVA-7721",
        secondaryId: "ENG-PERKINS-88392",
        brand: "Aksa",
        model: "APD-50A Perkins Dizel Kabinli",
        modelYear: 2021,
        meter: 2450,
        customerName: "Mega Lojistik Deposu",
        customerPhone: "0212 555 3322",
        complaint: "Elektrik kesilince 3. marşta zor çalışıyor, akü lambası yanıyor.",
      },
    ],
  },

  general: {
    id: "general",
    name: "Genel Teknik Servis & Elektrik-Elektronik",
    shortName: "Genel Servis",
    tag: "Evrensel Servis",
    iconName: "Wrench",
    branchDefaultName: "Merkez Teknik Servis & Onarım Atölyesi",
    assetTypeName: "Varlık / Cihaz",
    primaryIdentifier: {
      label: "Cihaz Seri No / Envanter Barkodu",
      placeholder: "SN-DEV-2026-001",
      badgeType: "industrial",
      sampleValue: "SN-DEV-2026-001",
    },
    secondaryIdentifier: {
      label: "Model Kodu / İmalat Parti No",
      placeholder: "MOD-TECH-X100",
      sampleValue: "MOD-TECH-X100",
    },
    meter: {
      label: "Kullanım / Sayaç Değeri",
      unit: "Birim",
      sampleValue: 1200,
      helperText: "Cihaz çalışma saati, adet veya döngü",
    },
    intakeTitle: "Hızlı Teknik Servis Kabul & İş Emri",
    intakeSubtitle: "Tüm Endüstriyel ve Elektronik Cihazlar için Evrensel Kabul",
    inspectionTitle: "Teknik Teşhis & Fonksiyonel Muayene",
    inspectionItems: [
      { id: "kasa", label: "Fiziksel Kasa, Gövde & Bağlantılar", description: "Çatlak, deformasyon ve eksik parça tespiti" },
      { id: "elektrik", label: "Güç & Elektriksel İzolasyon Testi", description: "Kısa devre ve aşırı akım çekişi kontrolü" },
      { id: "mekanik", label: "Mekanik Hareket & Rulman Durumu", description: "Sürtünme ve olağandışı ses kontrolü" },
      { id: "kalite", label: "Son Fonksiyonel Çalışma & Teslim Onayı", description: "Müşteri şikayetinin giderildiğinin doğrulanması" },
    ],
    complaintPresets: [
      "Cihaz hiç açılmıyor / güç gelmiyor",
      "Aşırı ısınıyor ve belirli süre sonra kendini kapatıyor",
      "Periyodik temizlik, yağlama ve kalibrasyon talebi",
      "Mekanik parçada kırılma / aşınma mevcut, parça değişecek",
      "Olağandışı ses ve titreşim yaparak çalışıyor",
      "Arıza tespiti ve müşteriye fiyat teklifi hazırlanması",
    ],
    bayStations: [
      { id: "ISTASYON-1", name: "1. Onarım & Bakım Masası", icon: "Wrench" },
      { id: "ISTASYON-2", name: "2. Elektronik Teşhis Masası", icon: "Cpu" },
      { id: "TEST-ALANI", name: "Son Test & Kalibrasyon Alanı", icon: "CheckCircle2" },
      { id: "TESLIMAT", name: "Paketleme & Müşteri Teslim Rafı", icon: "Box" },
    ],
    demoSamples: [
      {
        id: "demo-gen-sample",
        label: "SN-DEV-001 (Endüstriyel Pompa)",
        primaryId: "SN-DEV-2026-001",
        secondaryId: "MOD-TECH-X100",
        brand: "Wilo",
        model: "Yonos MAXO 30/0.5-12 Sirkülatör",
        modelYear: 2022,
        meter: 4100,
        customerName: "Güneş Sanayi Sitesi Kooperatifi",
        customerPhone: "0532 100 2030",
        complaint: "Su sızdırıyor ve çalışma esnasında rulman sesi var.",
      },
    ],
  },
};

export function getSectorConfig(id: SectorId): SectorConfig {
  return SECTOR_PRESETS[id] || SECTOR_PRESETS.automotive;
}
