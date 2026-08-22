/**
 * KURUM BAŞKANLIĞI - ARAZİ & SU TAKİP SİSTEMİ V1.0.4
 * Her tablonun UI davranışını, gizli sütunlarını ve başlık eşleşmelerini buradan yönetiyoruz.
 */

export interface TableConfig {
  tableName: string;
  hiddenColumns: string[];
  priorityColumns: string[];
  labelOverrides?: Record<string, string>;
  defaultView?: 'table' | 'list' | 'grid';
  gridCard?: {
    title: string;
    subtitle: string;
    badge: string;
    meta: string[];
  };
  listRow?: {
    primary: string;
    secondary: string;
    tag: string;
  };
}

export const TableRegistry: Record<string, TableConfig> = {
  "DATA_Vatandas": {
    tableName: "Vatandaşlar",
    hiddenColumns: ["pp_yolu", "guid", "__table", "source_table", "Durum", "Profil_Foto_Yolu"],
    priorityColumns: ["Sicil_No", "TCKN", "Ad", "Soyad", "Telefon", "Adres"],
    defaultView: "table",
    gridCard: {
      title: "Ad",
      subtitle: "Soyad",
      badge: "TCKN",
      meta: ["Sicil_No", "Telefon", "Baba_Adı", "Anne_Adı", "Dogum_Yeri", "Dogum_Tarihi", "Adres"]
    },
    listRow: {
      primary: "Ad",
      secondary: "Soyad",
      tag: "TCKN"
    },
    labelOverrides: {
      "TCKN": "T.C. KİMLİK NO",
      "Sicil_No": "SİCİL NO",
      "Baba_Adı": "BABA ADI",
      "Anne_Adı": "ANNE ADI",
      "Dogum_Yeri": "DOĞUM YERİ",
      "Dogum_Tarihi": "DOĞUM TARİHİ"
    }
  },
  "DATA_Tapu_Verisi": {
    tableName: "Tapu Kayıtları",
    hiddenColumns: [
      "guid", "__table", "source_table", "Hissedarlar_JSON", 
      "Ilgili_Kisiler_JSON"
    ],
    priorityColumns: ["Ada", "Parsel", "Mevki", "Alan_m2", "Aylik_Su_Hakki", "Nitelik", "Tapu_Sahibi_TCKN", "Pafta"],
    defaultView: "table",
    gridCard: {
      title: "Parsel",
      subtitle: "Ada",
      badge: "Alan_m2",
      meta: ["Mevki", "Aylik_Su_Hakki", "Nitelik", "Tapu_Sahibi_TCKN"]
    },
    listRow: {
      primary: "Parsel",
      secondary: "Mevki",
      tag: "Alan_m2"
    }
  },
  "DATA_Tasinmaz_Mevkileri": {
    tableName: "Mevki Listesi",
    hiddenColumns: ["guid", "__table", "Il", "Ilce", "GeoJSON", "Lat", "Lng", "geoJSON", "lat", "lng"],
    priorityColumns: ["Mevki_Adi", "Mahalle_Koy", "Aciklama"],
    defaultView: "table",
    gridCard: {
      title: "Mevki_Adi",
      subtitle: "Mahalle_Koy",
      badge: "Mevki_Adi",
      meta: ["Aciklama"]
    },
    listRow: {
      primary: "Mevki_Adi",
      secondary: "Mahalle_Koy",
      tag: "Mevki_Adi"
    }
  },
  "DATA_Dagitim_Bolgeleri": {
    tableName: "Dağıtım Bölgeleri",
    hiddenColumns: ["Mahalle_id", "guid", "__table"],
    priorityColumns: ["Mahalle_id", "Tip", "Durum"],
    defaultView: "table",
    gridCard: {
      title: "Mahalle_id",
      subtitle: "Tip",
      badge: "Durum",
      meta: ["Mahalle_id", "Tip"]
    },
    listRow: {
      primary: "Mahalle_id",
      secondary: "Tip",
      tag: "Durum"
    },
    labelOverrides: {
      "Mahalle_id": "BÖLGE KİMLİĞİ",
      "Tip": "BÖLGE TİPİ",
      "Durum": "DURUM"
    }
  },
  "TANIM_Meravlar": {
    tableName: "Saha Merav Görevlileri",
    hiddenColumns: ["pp_yolu", "guid", "__table", "Mahalle_id"],
    priorityColumns: ["Ad_Soyad", "Telefon", "Mahalle_id"],
    defaultView: "table",
    gridCard: {
      title: "Ad_Soyad",
      subtitle: "Mahalle_id",
      badge: "Telefon",
      meta: ["Ad_Soyad", "Telefon"]
    },
    listRow: {
      primary: "Ad_Soyad",
      secondary: "Mahalle_id",
      tag: "Telefon"
    },
    labelOverrides: {
      "Mahalle_id": "SORUMLU OLDUĞU MAHALLE"
    }
  },
  "DATA_Dagitim_Kayitlar": {
    tableName: "Su Dağıtım Fişleri",
    hiddenColumns: ["Bolge_id", "Donem_id", "Tasinmaz_id", "Tahsildar_id", "guid", "__table"],
    priorityColumns: ["Tarih", "Vatandas_Id", "Sure_Saat", "Toplam_Tutar", "Baslangic_Saati", "Bitis_Saati"],
    defaultView: "table",
    gridCard: {
      title: "Tarih",
      subtitle: "Vatandas_Id",
      badge: "Toplam_Tutar",
      meta: ["Sure_Saat", "Baslangic_Saati", "Bitis_Saati"]
    },
    labelOverrides: {
      "Vatandas_Id": "VATANDAŞ TCKN",
      "Sure_Saat": "KULLANIM (SAAT)",
      "Toplam_Tutar": "TOPLAM TUTAR",
      "Baslangic_Saati": "BAŞLANGIÇ",
      "Bitis_Saati": "BİTİŞ"
    }
  },
  "TANIM_Vergi_Oranlari": {
    tableName: "Vergi Oranları",
    hiddenColumns: ["guid", "__table"],
    priorityColumns: ["vergi_adi", "vergi_orani", "kod"],
    defaultView: "table",
    labelOverrides: {
      "vergi_adi": "VERGİ ADI",
      "vergi_orani": "VERGİ ORANI (%)",
      "is_active": "DURUM"
    }
  },
  "MUHASEBE_Tahakkuk": {
    tableName: "Tahakkuk Kayıtları",
    hiddenColumns: ["guid", "__table", "Fis_id", "Donem_id", "Ust_Tahakkuk_id"],
    priorityColumns: ["Tarih", "Vatandas_Id", "Miktar", "Tur", "Durum"],
    labelOverrides: {
      "Vatandas_Id": "VATANDAŞ",
      "Miktar": "TUTAR",
      "Tur": "BORÇ TÜRÜ",
      "Durum": "ÖDEME DURUMU"
    }
  },
  "TANIM_Faiz_Oranlari": {
    tableName: "Faiz ve Gecikme Zammı",
    hiddenColumns: ["guid", "__table"],
    priorityColumns: ["faiz_adi", "faiz_orani", "periyot", "yururluluk_tarihi"],
    defaultView: "table",
    labelOverrides: {
      "faiz_adi": "FAİZ/ZAM ADI",
      "faiz_orani": "ORAN",
      "periyot": "PERİYOT",
      "dayanak_mevzuat": "DAYANAK MEVZUAT",
      "yururluluk_tarihi": "YÜRÜRLÜK TARİHİ",
      "is_active": "DURUM"
    }
  }
};

export const getTableConfig = (tableName: string): TableConfig => {
  return TableRegistry[tableName] || {
    tableName,
    hiddenColumns: ["guid", "__table"],
    priorityColumns: [],
    defaultView: "table"
  };
};
