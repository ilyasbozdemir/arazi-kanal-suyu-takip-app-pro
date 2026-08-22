import { uow } from "./repositories/UnitOfWork";
import { ElectronService } from "./ElectronService";
import { parseTurkishFloat } from "../utils/formatters";
import { TABLES } from "../constants/tables";

export class LandService {
  /**
   * Tapu Kaydı sırasında yeni mevki kontrolü yapar ve otomatik ekler.
   */
  static async handleMevkiAutomation(values: any): Promise<string | null> {
    const mevkiName = values._Mevki_Temp_Name || values.Mevki;
    if (!mevkiName) return values.Mevki_id || null;

    // 🛡️ KURUM NORMALİZASYON: "boz alan" -> "BOZALAN"
    const rawName = String(mevkiName).trim();
    const normalizedName = rawName.toLocaleUpperCase('tr-TR').replace(/\s+/g, '');
    
    try {
      // 🛡️ REHBER KONTROLÜ
      const res = await ElectronService.getRecords(TABLES.MEVKI);
      if (res.success) {
        const existing = (res.data || []).find((m: any) => {
          const mName = (m.Mevki_Adi || "").trim().toLocaleUpperCase('tr-TR').replace(/\s+/g, '');
          return mName === normalizedName;
        });
        
        if (existing) return existing.id;
      }

      // ✨ YENİ OLUŞTURMA: Otomatik onaylama
      const displayName = rawName.toLocaleUpperCase('tr-TR'); 
      const newId = window.crypto.randomUUID();
      await ElectronService.saveRecord(TABLES.MEVKI, { 
         id: newId,
         Mevki_Adi: displayName
      });
      return newId;
    } catch (err) {
      console.warn('[AUTO-MEVKİ] Otomasyon hatası:', err);
      return values.Mevki_id || null;
    }
  }

  /**
   * Para/Alan formatlarını DB standardına dönüştürür.
   */
  static normalizeNumerics(values: any): any {
    const cleanValues = { ...values };
    Object.keys(cleanValues).forEach(key => {
      // 📐 Sayısal Normalizasyon (Alan ve Su Hakkı)
      if (['Alan_m2', 'Aylik_Su_Hakki'].includes(key) && cleanValues[key]) {
        cleanValues[key] = parseTurkishFloat(cleanValues[key]);
      }
      
      // 🧬 JSON Normalizasyon (Hissedarlar, Bakıcılar vb.)
      // SQLite sadece string bind edebilir, Array/Object değil.
      if (key.endsWith('_JSON') && cleanValues[key] && typeof cleanValues[key] === 'object') {
        cleanValues[key] = JSON.stringify(cleanValues[key]);
      }
    });
    return cleanValues;
  }
}
