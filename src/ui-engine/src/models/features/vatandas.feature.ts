import { DATA_Vatandas, DATA_Tapu_Verisi, REL_TASINMAZ_VATANDAS, DATA_Dagitim_Kayitlar } from '../entities';

/** 🛡️ VATANDAŞ ÖZELLİĞİ - OKUMA MODELİ (READ VIEW) */
export interface VatandasFeatureReadView extends DATA_Vatandas {
  tasinmazlar?: DATA_Tapu_Verisi[];
  mulkiyetBilgileri?: REL_TASINMAZ_VATANDAS[];
  sulamaGecmisi?: DATA_Dagitim_Kayitlar[];
}

/** 🛡️ VATANDAŞ ÖZELLİĞİ - YAZMA MODELİ (SAVE COMMAND) */
export interface VatandasFeatureSaveCommand {
  id?: string;
  Sicil_No?: string;
  TCKN: string;
  Ad: string;
  Soyad: string;
  Telefon?: string;
  Cep_Telefonu?: string;
  Adres?: string;
  Durum?: string;
  // 🛡️ Diğer kütük alanları opsiyonel olarak eklenebilir
}
