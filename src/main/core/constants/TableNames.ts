/**
 * 🛡️ KURUM BAŞKANLIĞI - VERİTABANI TABLO İSİMLERİ SÖZLÜĞÜ
 */
export const TableNames = {
  VATANDAS: 'DATA_Vatandas',
  TAPU: 'DATA_Tapu_Verisi',
  SAHIP: 'REL_TASINMAZ_VATANDAS',
  ZILYET: 'REL_TASINMAZ_ZILYET',
  BOLGE: 'DATA_Dagitim_Bolgeleri',
  AYARLAR: 'TANIM_Ayarlar',
  MEVKI: 'DATA_Tasinmaz_Mevkileri',
  KASA: 'TANIM_Kasalar',
  KASA_HAREKET: 'MUHASEBE_Kasa_Hareketleri',
  TAHAKKUK: 'MUHASEBE_Tahakkuk',
  TAHSILAT: 'MUHASEBE_Tahsilat',
  KULLANICILAR: 'TANIM_Personel',
  ACTIVITIES: 'LOG_Activities'
} as const;
