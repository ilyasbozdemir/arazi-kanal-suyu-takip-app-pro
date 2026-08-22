/** 🛡️ DATA_Dagitim_Kayitlar Entity */
export interface DATA_Dagitim_Kayitlar {
  id: string;
  Donem_id?: string;
  Mahalle_id?: string;
  Tasinmaz_id?: string;
  Vatandas_Id?: string;
  Merav_id?: string;
  Tarih?: string;
  Baslangic_Saati?: string;
  Bitis_Saati?: string;
  Kullanim_Saati?: number;
  Sure_Saat?: number;
  Tarife_Modu?: string;
  Birim_Fiyat?: number;
  Toplam_Tutar?: number;
  Makbuz_Defter_id?: string;
  Makbuz_No?: string;
  Aciklama?: string;
}
