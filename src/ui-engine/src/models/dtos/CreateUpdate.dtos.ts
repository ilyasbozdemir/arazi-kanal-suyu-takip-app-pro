import { DATA_Vatandas, DATA_Tapu_Verisi, DATA_Tasinmaz_Mevkileri, TANIM_Konumlar } from '../entities';

/** 🛡️ VATANDAŞ KAYIT/GÜNCELLEME DTO */
export interface VatandasCreateOrUpdateDto extends Partial<DATA_Vatandas> {
  // 🛡️ Kayıt sırasında id otomatik oluşabilir, opsiyonel bırakıyoruz.
  id?: string;
  TCKN: string;
  Ad: string;
  Soyad: string;
}

/** 🛡️ TAŞINMAZ KAYIT/GÜNCELLEME DTO */
export interface TasinmazCreateOrUpdateDto extends Partial<DATA_Tapu_Verisi> {
  id?: string;
  Ada?: string;
  Parsel?: string;
  Mevki_id?: string;
}

/** 🛡️ MEVKİ KAYIT/GÜNCELLEME DTO */
export interface MevkiCreateOrUpdateDto extends Partial<DATA_Tasinmaz_Mevkileri> {
  id?: string;
  Mevki_Adi: string;
  Konum_id?: string;
}

/** 🛡️ KONUM KAYIT/GÜNCELLEME DTO */
export interface KonumCreateOrUpdateDto extends Partial<TANIM_Konumlar> {
  id?: string;
  Ad: string;
  Tip: TANIM_Konumlar['Tip'];
}
