/**
 * Vatandas.form.ts: Vatandaş kayıt/güncelleme formlarında kullanılan state modeli.
 */
export interface VatandasFormModel {
  id?: string;
  TCKN: string;
  Sicil_No?: string;
  Ad: string;
  Soyad: string;
  Durum: string;
  Ana_Adi?: string;
  Baba_Adi?: string;
  Dogum_Yeri?: string;
  Dogum_Tarihi?: string;
  Cinsiyet?: string;
  
  // UI'a özel yardımcı alanlar (Veritabanına gitmez)
  Sicil_Confirmed?: boolean;
  tckn_valid?: boolean;
  step?: number;
}

