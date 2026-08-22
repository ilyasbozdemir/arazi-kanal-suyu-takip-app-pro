/**
 * Vatandas.entity.ts: Uygulama genelinde dolaşan temiz Kişi modeli.
 */
export interface Vatandas {
  id?: string;
  tckn: string;
  sicilNo?: string;
  ad: string;
  soyad: string;
  fullName: string;
  durum: "SAĞ" | "ÖLÜ";
  telefon?: string;
  cepTelefonu?: string;
  email?: string;
  adres?: string;
  // ... diğer gerekli alanlar
}

