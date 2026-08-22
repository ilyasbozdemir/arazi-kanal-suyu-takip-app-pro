import { Database } from 'better-sqlite3';
import * as crypto from 'node:crypto';

export function runAutoRepair(_db: Database) {
  // 🛡️ Arazi Suyu Takip Sistemi OTOMATİK ONARIM (Auto-Repair)
  try {
    console.log('[DB] Otomatik onarım denetleniyor...');

    // 1. TAPU VERİSİ İLİŞKİ ONARIMI
    const tapuCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Tapu_Verisi'").get();
    if (tapuCheck) {
      const colInfo = _db.prepare("PRAGMA table_info(DATA_Tapu_Verisi)").all() as any[];
      const hasMevki = colInfo.some(c => c.name === 'Mevki');
      const hasMevkiId = colInfo.some(c => c.name === 'Mevki_id');

      if (hasMevki && hasMevkiId) {
        // Eksik mevkileri oluştur
        const tapuMevkiler = _db.prepare('SELECT DISTINCT Mevki FROM DATA_Tapu_Verisi WHERE Mevki IS NOT NULL AND Mevki != ""').all() as any[];
        for (const m of tapuMevkiler) {
          const exist = _db.prepare('SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE TRIM_UPPER(Mevki_Adi) = TRIM_UPPER(?)').get(m.Mevki);
          if (!exist) _db.prepare('INSERT OR IGNORE INTO DATA_Tasinmaz_Mevkileri (id, Mevki_Adi) VALUES (?, ?)').run(crypto.randomUUID(), m.Mevki);
        }
        
        // Mevki_id senkronizasyonu
        _db.exec(`
          UPDATE DATA_Tapu_Verisi 
          SET Mevki_id = (SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE TRIM_UPPER(Mevki_Adi) = TRIM_UPPER(DATA_Tapu_Verisi.Mevki))
          WHERE Mevki_id IS NULL OR Mevki_id = ''
        `);

        // Sahip_id Senkronu (TCKN -> ID)
        const hasTckn = colInfo.some(c => c.name === 'Tapu_Sahibi_TCKN');
        const hasSahipId = colInfo.some(c => c.name === 'Sahip_id');
        if (hasTckn && hasSahipId) {
          _db.exec(`
            UPDATE DATA_Tapu_Verisi 
            SET Sahip_id = (SELECT id FROM DATA_Vatandas WHERE TCKN = DATA_Tapu_Verisi.Tapu_Sahibi_TCKN)
            WHERE (Sahip_id IS NULL OR Sahip_id = '') AND Tapu_Sahibi_TCKN IS NOT NULL AND Tapu_Sahibi_TCKN != ''
          `);
        }
      }
    }

    // 2. DATA_VATANDAS AUDIT ONARIMI (Sarsılmaz Nizam)
    const vatandasCheck = _db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='DATA_Vatandas'").get();
    if (vatandasCheck) {
      const colInfoVatandas = _db.prepare("PRAGMA table_info(DATA_Vatandas)").all() as any[];
      const auditFields = [
        { name: 'created_at', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
        { name: 'created_by', type: 'TEXT' },
        { name: 'updated_at', type: 'TEXT' },
        { name: 'updated_by', type: 'TEXT' },
        { name: 'deleted_at', type: 'TEXT DEFAULT NULL' }
      ];

      for (const field of auditFields) {
        if (!colInfoVatandas.some(c => c.name.toLowerCase() === field.name.toLowerCase())) {
          console.log(`[DB] ONARIM: DATA_Vatandas.${field.name} ekleniyor...`);
          _db.exec(`ALTER TABLE DATA_Vatandas ADD COLUMN ${field.name} ${field.type}`);
        }
      }
    }

    console.log('[DB] Otomatik onarım başarıyla tamamlandı.');
  } catch (err: any) { 
    console.warn('[DB] Onarım hatası:', err.message); 
  }
}
