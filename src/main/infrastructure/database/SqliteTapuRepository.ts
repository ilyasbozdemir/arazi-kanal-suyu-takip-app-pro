import type { Database } from 'better-sqlite3';
import { injectable, inject } from 'tsyringe';
import { SqliteBaseRepository } from './SqliteBaseRepository';
import { ITapuRepository } from '@core/interfaces';
import { TableNames } from '@core/constants/TableNames';
import crypto from 'crypto';

@injectable()
export class SqliteTapuRepository extends SqliteBaseRepository<any> implements ITapuRepository {
  constructor(@inject('Database') db: Database) {
    super(db, TableNames.TAPU);
  }

  saveWithRelations(data: any): void {
    // 🛡️ JSON emniyet kilidi: Eğer veriler string olarak gelirse diziye çevir
    const parseSafe = (val: any) => {
       if (!val) return [];
       if (Array.isArray(val)) return val;
       try { return JSON.parse(val); } catch(e) { return []; }
    };

    const owners = parseSafe(data.owners || data.Hissedarlar_JSON);
    const zilyetler = parseSafe(data.zilyetler || data.Ilgili_Kisiler_JSON);
    const { ...mainData } = data;
    
    // 🛡️ 1. Akıllı mülkiyet eşleştirme (Kayıttan önce TCKN'den ID çöz)
    if (!mainData.Sahip_id && mainData.Tapu_Sahibi_TCKN) {
      const citizen = this.db.prepare(`SELECT id FROM "${TableNames.VATANDAS}" WHERE TCKN = ? OR Sicil_No = ?`).get(mainData.Tapu_Sahibi_TCKN, mainData.Tapu_Sahibi_TCKN) as any;
      if (citizen) mainData.Sahip_id = citizen.id;
    }

    // 🛡️ 2. Ana kaydı yap
    this.save(mainData);
    const tapuId = mainData.id;

    // 🛡️ 3. Mülkiyet (Sahip) İlişkileri
    this.db.prepare(`DELETE FROM "${TableNames.SAHIP}" WHERE "Tasinmaz_id" = ?`).run(tapuId);
    
    const finalOwners = owners.length > 0 ? owners : (mainData.Sahip_id ? [{ id: mainData.Sahip_id }] : []);
    if (finalOwners.length > 0) {
      const stmt = this.db.prepare(`INSERT INTO "${TableNames.SAHIP}" (id, Tasinmaz_id, Vatandas_Id, Rol, Hisse_Pay, Hisse_Payda) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const o of finalOwners) {
        // 🛡️ AKILLI ID ÇÖZÜCÜ: Vatandas_Id olarak gelen değer TCKN ise gerçek ID'yi bul
        let vId = o.Vatandas_Id || o.id || o.TCKN;
        if (vId && String(vId).length === 11) {
           const c = this.db.prepare(`SELECT id FROM "${TableNames.VATANDAS}" WHERE TCKN = ?`).get(vId) as any;
           if (c) vId = c.id;
        }

        if (vId) {
          try {
            stmt.run(crypto.randomUUID(), tapuId, vId, o.Rol || 'MALİK', o.Hisse_Pay || 1, o.Hisse_Payda || 1);
          } catch(err: any) {
            console.error("[DB_SAHIP_ERR]", err.message);
          }
        }
      }
    }

    // 🛡️ 4. Zilyet İlişkileri
    this.db.prepare(`DELETE FROM "${TableNames.ZILYET}" WHERE "Tasinmaz_id" = ?`).run(tapuId);
    const finalZilyetler = zilyetler.length > 0 ? zilyetler : (mainData.Zilyet_id ? [{ id: mainData.Zilyet_id }] : []);
    if (finalZilyetler.length > 0) {
      const stmt = this.db.prepare(`INSERT INTO "${TableNames.ZILYET}" (id, Tasinmaz_id, Vatandas_Id, Beyan_Tarihi, Aktif) VALUES (?, ?, ?, ?, ?)`);
      for (const z of finalZilyetler) {
        let vId = z.Vatandas_Id || z.id || z.TCKN;
        if (vId && String(vId).length === 11) {
           const c = this.db.prepare(`SELECT id FROM "${TableNames.VATANDAS}" WHERE TCKN = ?`).get(vId) as any;
           if (c) vId = c.id;
        }

        if (vId) {
           try {
             stmt.run(crypto.randomUUID(), tapuId, vId, z.Beyan_Tarihi || new Date().toISOString(), 1);
           } catch(err: any) {
             console.error("[DB_ZILYET_ERR]", err.message);
           }
        }
      }
    }
  }

  getAll(): any[] {
    const mainRecords = super.getAll();
    
    return mainRecords.map(t => {
      // 🛡️ Standart Mülkiyet Sorgusu
      const owners = this.db.prepare(`
        SELECT v.*, ts.Rol, ts.Hisse_Pay, ts.Hisse_Payda 
        FROM "${TableNames.SAHIP}" ts 
        JOIN "${TableNames.VATANDAS}" v ON ts.Vatandas_Id = v.id 
        WHERE ts.Tasinmaz_id = ? AND (ts.deleted_at IS NULL OR ts.deleted_at = '')
      `).all(t.id);

      const zilyetler = this.db.prepare(`
        SELECT v.*, tz.Beyan_Tarihi 
        FROM "${TableNames.ZILYET}" tz 
        JOIN "${TableNames.VATANDAS}" v ON tz.Vatandas_Id = v.id 
        WHERE tz.Tasinmaz_id = ? AND (tz.deleted_at IS NULL OR tz.deleted_at = '') AND tz.Aktif = 1
      `).all(t.id);
      
      const mevkiRow = t.Mevki_id ? this.db.prepare(`SELECT Mevki_Adi FROM "${TableNames.MEVKI}" WHERE id = ?`).get(t.Mevki_id) as any : null;

      const firstOwner = (owners[0] || {}) as any;
      const fullName = [firstOwner.Ad, firstOwner.Soyad].filter(Boolean).join(' ').trim();

      return {
        ...t,
        owners,
        zilyetler,
        Mevki: mevkiRow?.Mevki_Adi || '',
        Tapu_Sahibi_Ad_Soyad: fullName || firstOwner.TCKN || 'BİLİNMEYEN SAHİP',
        Tapu_Sahibi_TCKN: firstOwner.TCKN || ''
      };
    });
  }

  getDetailed(id: string): any {
    const main = this.getById(id);
    if (!main) return null;

    const owners = this.db.prepare(`
      SELECT v.*, ts.Rol, ts.Hisse_Pay, ts.Hisse_Payda 
      FROM "${TableNames.SAHIP}" ts 
      JOIN "${TableNames.VATANDAS}" v ON ts.Vatandas_Id = v.id 
      WHERE ts.Tasinmaz_id = ? AND (ts.deleted_at IS NULL OR ts.deleted_at = '')
    `).all(id);

    const zilyetler = this.db.prepare(`
      SELECT v.*, tz.Beyan_Tarihi 
      FROM "${TableNames.ZILYET}" tz 
      JOIN "${TableNames.VATANDAS}" v ON tz.Vatandas_Id = v.id 
      WHERE tz.Tasinmaz_id = ? AND (tz.deleted_at IS NULL OR tz.deleted_at = '') AND tz.Aktif = 1
    `).all(id);

    return { ...main, owners, zilyetler };
  }
}
