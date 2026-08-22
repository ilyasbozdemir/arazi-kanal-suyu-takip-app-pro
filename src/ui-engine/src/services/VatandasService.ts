import { uow } from "./repositories/UnitOfWork";
import { isValidTCKN } from "../utils/validators";

export class VatandasService {
  /**
   * TCKN Doğrulama (TR Standart)
   */
  static isValidTCKN(tckn: string): boolean {
    return isValidTCKN(tckn);
  }

  /**
   * Kaydetme öncesi toplu doğrulama
   */
  static async validateForSave(values: any, currentId?: string): Promise<string | null> {
    if (!values.Ad || !values.Soyad) return "İSİM VE SOYİSİM ALANLARI ASLA BOŞ BIRAKILAMAZ!";
    
    if (values.TCKN) {
      if (!this.isValidTCKN(values.TCKN)) return "TC KİMLİK NUMARASI GEÇERSİZ!";
      const res = await uow.vatandas.checkAvailability("TCKN", values.TCKN, currentId);
      if (!res.available) return res.message || "TCKN HATASI";
    }

    if (values.Sicil_No && !values.Sicil_Confirmed) {
      const res = await uow.vatandas.checkAvailability("Sicil_No", values.Sicil_No, currentId);
      if (!res.available) return res.message || "SİCİL NO HATASI";
    }

    if (!values.TCKN && !values.Sicil_No) return "TCKN VEYA SİCİL NUMARASINDAN EN AZ BİRİ OLMALIDIR!";

    return null;
  }
}

