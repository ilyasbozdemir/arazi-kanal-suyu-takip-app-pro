import { DATA_Vatandas, DATA_Tapu_Verisi, DATA_Tasinmaz_Mevkileri, TANIM_Konumlar, DATA_Dagitim_Kayitlar } from '../entities';

/** 🛡️ [COMMAND] VATANDAŞ OLUŞTURMA/GÜNCELLEME */
export interface VatandasWriteModel extends Partial<DATA_Vatandas> {
  id?: string; // Update için zorunlu, Create için opsiyonel
  TCKN: string;
  Ad: string;
  Soyad: string;
  // Kayıt sırasında doğrulanması gereken ek alanlar buraya gelebilir.
}

/** 🛡️ [COMMAND] TAŞINMAZ OLUŞTURMA/GÜNCELLEME */
export interface TasinmazWriteModel extends Partial<DATA_Tapu_Verisi> {
  id?: string;
  Ada: string;
  Parsel: string;
  Mevki_id: string;
}

/** 🛡️ [COMMAND] SULAMA KAYDI OLUŞTURMA */
export interface IrrigationWriteModel extends Partial<DATA_Dagitim_Kayitlar> {
  id?: string;
  Tasinmaz_id: string;
  Vatandas_Id: string;
  Merav_id: string;
  Baslangic_Saati: string;
  Bitis_Saati: string;
}

/** 🛡️ [COMMAND] MEVKİ OLUŞTURMA */
export interface MevkiWriteModel extends Partial<DATA_Tasinmaz_Mevkileri> {
  id?: string;
  Mevki_Adi: string;
  Konum_id: string;
}
