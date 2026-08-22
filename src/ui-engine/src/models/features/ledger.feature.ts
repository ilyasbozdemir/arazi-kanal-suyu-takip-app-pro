import { DATA_Dagitim_Kayitlar, MUHASEBE_Tahakkuk, MUHASEBE_Tahsilat, DATA_Vatandas } from '../entities';

/** 🛡️ DEFTER/SULAMA ÖZELLİĞİ - OKUMA MODELİ (READ VIEW) */
export interface LedgerFeatureReadView extends DATA_Dagitim_Kayitlar {
  vatandas?: DATA_Vatandas;
  tahakkuk?: MUHASEBE_Tahakkuk;
  tahsilat?: MUHASEBE_Tahsilat;
  kalanBorc?: number;
}

/** 🛡️ DEFTER/SULAMA ÖZELLİĞİ - YAZMA MODELİ (SAVE COMMAND) */
export interface LedgerFeatureSaveCommand {
  id?: string;
  Donem_id: string;
  Mahalle_id: string;
  Tasinmaz_id: string;
  Vatandas_Id: string;
  Merav_id: string;
  Tarih: string;
  Baslangic_Saati: string;
  Bitis_Saati: string;
  Kullanim_Saati?: number;
  Birim_Fiyat?: number;
  Toplam_Tutar?: number;
}
