/* 🛡️ KURUM BAŞKANLIĞI: RESMİ TERMİNOLOJİ SÖZLÜĞÜ */

export const translations: Record<string, string> = {
  // 🛡️ PERSONEL VE VATANDAŞ KİMLİK BİLGİLERİ
  "TCKN": "T.C. KİMLİK NUMARASI",
  "Sicil_No": "KURUM SİCİL NO",
  "Ad": "ADI",
  "Soyad": "SOYADI",
  "Baba_Adi": "BABA ADI",
  "Ana_Adi": "ANNE ADI",
  "Dogum_Yeri": "DOĞUM YERİ",
  "Dogum_Tarihi": "DOĞUM TARİHİ",
  "Telefon": "SABİT TELEFON",
  "Cep_Telefonu": "CEP TELEFONU",
  "E_Posta_Adresi": "E-POSTA ADRESİ",
  "Adres": "İKAMETGAH ADRESİ",
  "Tur": "MÜKELLEF TÜRÜ (TUR)",
  
  // 🛡️ TAPU VE ARAZİ BİLGİLERİ
  "Ada": "ADA NO",
  "Parsel": "PARSEL NO",
  "Mevki": "MEVKİ ADI",
  "Alan_m2": "TOPLAM ALAN (m²)",
  "Hisse_Pay": "PAY",
  "Hisse_Payda": "PAYDA",
  "Tapu_Tipi": "TAPU DURUMU",
  
  // 🛡️ İDARİ TABLO İSİMLERİ (NAZARYAT)
  "DATA_Vatandas": "VATANDAŞ KAYIT KÜTÜĞÜ",
  "DATA_Tapu_Verisi": "TAŞINMAZ VE PARSEL KÜTÜĞÜ",
  "DATA_Dagitim_Bolgeleri": "İDARİ DAĞITIM BÖLGELERİ",
  "DATA_Dagitim_Kayitlar": "SU DAĞITIM FİŞLERİ",
  "DATA_Dagitim_Donemleri": "DAĞITIM DEFTER VE DÖNEM ARŞİVİ",
  "MUHASEBE_Tahsilat": "TAHSİLAT VE ÖDEME KAYITLARI",
  "MUHASEBE_Tahakkuk": "BORÇ VE TAHAKKUK LİSTESİ",
  "DATA_Tasinmaz_Mevkileri": "MEVKİ VE BÖLGE TANIMLARI",
  "TANIM_Su_Ucretleri": "SU ÜCRET VE MECLİS KARARLARI",
  "TANIM_Depolar": "SU DEPOSU VE KAYNAK TANIMLARI",
  "TANIM_Mevkiler": "BÖLGE KOORDİNAT TANIMLARI",
  "TANIM_Sulama_Fis_Kocanlari": "SULAMA FİŞ KOÇANLARI",
  "TANIM_Vergi_Oranlari": "VERGİ VE KDV TANIMLARI",
  "TANIM_Faiz_Oranlari": "GECİKME ZAMMI VE FAİZ TANIMLARI",
  
  // 🛡️ İŞLEM VE MALİ BİLGİLER
  "Miktar": "MİKTAR",
  "Birim_Fiyat": "BİRİM FİYAT",
  "Tutar": "TOPLAM TUTAR",
  "Tarih": "İŞLEM TARİHİ",
  "Durum": "GÜNCEL DURUM",
  "Aciklama": "RESMİ AÇIKLAMA",
  "karar_no": "MECLİS KARAR NUMARASI",
  "karar_tarihi": "KARAR TARİHİ",
  "gunduz_fiyat": "GÜNDÜZ BİRİM FİYATI (₺)",
  "gece_fiyat": "GECE BİRİM FİYATI (₺)",
  "Odeme_Yontemi": "ÖDEME TÜRÜ (NAKİT/KART)",
  "Hedef_Kasa_Id": "PARANIN AKTARILDIĞI KASA/HESAP",
  "Fis_No": "RESMİ FİŞ / MAKBUZ NUMARASI",
  "vergi_adi": "VERGİ ADI",
  "vergi_orani": "VERGİ ORANI (%)",
  "faiz_adi": "FAİZ TÜRÜ",
  "faiz_orani": "FAİZ ORANI",
  "periyot": "HESAPLAMA PERİYODU",
  "dayanak_mevzuat": "HUKUKİ DAYANAK (KANUN/MADDE)",
  "yururluluk_tarihi": "YÜRÜRLÜK TARİHİ",
  "is_active": "AKTİF DURUM",
  "Ust_Tahakkuk_id": "ÜST TAHAKKUK REF."
};

/**
 * 🛡️ RESMİ TERCÜME MOTORU
 * Verilen tablo veya kolon ismini resmi Türkçe terminolojiye çevirir.
 */
export const translateHeader = (key: string): string => {
  if (!key) return "BİLİNMEYEN ALAN";
  return translations[key] || key.replace(/_/g, ' ');
};

