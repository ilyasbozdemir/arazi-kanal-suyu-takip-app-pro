import { DATA_Tapu_Verisi, DATA_Tasinmaz_Mevkileri, TANIM_Konumlar, DATA_Vatandas, REL_TASINMAZ_VATANDAS } from '../entities';

/** 🛡️ TAPU/TAŞINMAZ ÖZELLİĞİ - OKUMA MODELİ (READ VIEW) */
export interface TapuFeatureReadView extends DATA_Tapu_Verisi {
  mevki?: DATA_Tasinmaz_Mevkileri;
  konumHiyerarsisi?: TANIM_Konumlar[];
  malikListesi?: (DATA_Vatandas & REL_TASINMAZ_VATANDAS)[];
}

/** 🛡️ TAPU/TAŞINMAZ ÖZELLİĞİ - YAZMA MODELİ (SAVE COMMAND) */
export interface TapuFeatureSaveCommand {
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

/** 🛡️ MEVKİ ÖZELLİĞİ - YAZMA MODELİ (SAVE COMMAND) */
export interface MevkiFeatureSaveCommand {
  id?: string;
  Mevki_Adi: string;
  Konum_id: string;
  Bolge_Tipi?: string;
  Altyapi_Durumu?: string;
  Aciklama?: string;
}
