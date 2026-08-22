import { DATA_Vatandas, DATA_Tapu_Verisi, REL_TASINMAZ_VATANDAS, DATA_Dagitim_Kayitlar, DATA_Tasinmaz_Mevkileri, TANIM_Konumlar } from '../entities';

/** 🛡️ [QUERY] VATANDAŞ DETAY GÖRÜNÜMÜ */
export interface VatandasReadView extends DATA_Vatandas {
  tapuKayitlari?: DATA_Tapu_Verisi[];
  mulkiyetDetaylari?: REL_TASINMAZ_VATANDAS[];
  sulamaGecmisi?: DATA_Dagitim_Kayitlar[];
  ozet?: {
    toplamAlan: number;
    toplamSulamaSaati: number;
    aktifBorc: number;
  };
}

/** 🛡️ [QUERY] TAŞINMAZ DETAY GÖRÜNÜMÜ */
export interface TasinmazReadView extends DATA_Tapu_Verisi {
  mevki?: DATA_Tasinmaz_Mevkileri;
  konumHiyerarsisi?: TANIM_Konumlar[];
  malikler?: (DATA_Vatandas & REL_TASINMAZ_VATANDAS)[];
  sonSulamaTarihi?: string;
}

/** 🛡️ [QUERY] SULAMA KAYIT GÖRÜNÜMÜ */
export interface IrrigationReadView extends DATA_Dagitim_Kayitlar {
  vatandasAdSoyad?: string;
  tasinmazBilgisi?: string; // Ada/Parsel
  meravAdSoyad?: string;
  durum?: 'ÖDENDİ' | 'BEKLEMEDE';
}
