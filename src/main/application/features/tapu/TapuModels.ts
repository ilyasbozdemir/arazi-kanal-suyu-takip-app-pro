/**
 * 🛡️ TAPU VE TAŞINMAZ ÖZELLİĞİ - KOMUT VE SORGU MODELLERİ
 */

export interface SaveTasinmazCommand {
  id?: string;
  Tasinmaz_No?: string;
  Ada: string;
  Parsel: string;
  Alan_m2?: number;
  Nitelik?: string;
  Mevki_id: string;
  Aylik_Su_Hakki?: number;
  Notlar?: string;
}

export interface SaveMevkiCommand {
  id?: string;
  Mevki_Adi: string;
  Konum_id: string;
  Bolge_Tipi?: string;
  Altyapi_Durumu?: string;
  Aciklama?: string;
}

export interface TasinmazDto {
  id: string;
  Ada: string;
  Parsel: string;
  MevkiAdi: string;
  TamAdres: string;
  // 🛡️ Diğer zenginleştirilmiş alanlar...
}
