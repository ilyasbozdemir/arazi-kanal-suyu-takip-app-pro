/**
 * 🛡️ VATANDAŞ ÖZELLİĞİ - KOMUT VE SORGU MODELLERİ
 */

export interface SaveVatandasCommand {
  id?: string;
  Sicil_No?: string;
  TCKN: string;
  Ad: string;
  Soyad: string;
  Telefon?: string;
  Cep_Telefonu?: string;
  Adres?: string;
  Durum?: string;
}

export interface VatandasDto {
  id: string;
  TCKN: string;
  Ad: string;
  Soyad: string;
  FullName: string;
  // 🛡️ Diğer kütük alanları...
}
