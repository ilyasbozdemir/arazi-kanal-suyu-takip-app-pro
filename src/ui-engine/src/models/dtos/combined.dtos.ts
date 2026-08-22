import { DATA_Vatandas, DATA_Tapu_Verisi, REL_TASINMAZ_VATANDAS, DATA_Dagitim_Kayitlar } from '../entities';

/** 🛡️ VATANDAŞ DETAY DTO (Zenginleştirilmiş Model) */
export interface VatandasDetailDto extends DATA_Vatandas {
  lands?: DATA_Tapu_Verisi[];
  ownerships?: REL_TASINMAZ_VATANDAS[];
  irrigationRecords?: DATA_Dagitim_Kayitlar[];
  totalIrrigationDuration?: number;
  totalPendingAccrual?: number;
}

/** 🛡️ TAŞINMAZ DETAY DTO (Zenginleştirilmiş Model) */
export interface TasinmazDetailDto extends DATA_Tapu_Verisi {
  mevkiAdi?: string;
  mahalleAdi?: string;
  ilceAdi?: string;
  ilAdi?: string;
  owners?: (DATA_Vatandas & REL_TASINMAZ_VATANDAS)[];
}

/** 🛡️ SULAMA KAYIT DTO (Zenginleştirilmiş Model) */
export interface IrrigationDetailDto extends DATA_Dagitim_Kayitlar {
  vatandasAdSoyad?: string;
  tasinmazAdaParsel?: string;
  mevkiAdi?: string;
}
