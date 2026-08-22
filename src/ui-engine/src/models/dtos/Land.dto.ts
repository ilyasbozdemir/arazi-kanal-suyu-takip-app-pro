/**
 * Land.dto.ts: DATA_Tapu_Verisi tablosunun birebir şeması.
 */
export interface LandDto {
  id?: string;
  Tasinmaz_No?: string;
  Mevki?: string;
  Ada?: string;
  Parsel?: string;
  Alan_m2?: number;
  Nitelik?: string;
  Tapu_Sahibi_TCKN?: string;
  Sahip_Turu?: string;
  Hissedarlar_JSON?: string;
  Hisse_Orani?: string;
  Varis_Durumu_Notu?: string;
  Kanal_Seviyesi_Altinda?: string;
  Kanal_Suyu_Ile_Sulanan?: string;
  Tescil_Tarihi?: string;
  Yevmiye_No?: string;
  Mevki_id?: string;
  Sahip_id?: string;
  Aylik_Su_Hakki?: number;
}

