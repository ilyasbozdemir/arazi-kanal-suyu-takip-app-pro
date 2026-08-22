import { ipcMain } from 'electron';
import { Logger } from '../../logger';
import { TableNames } from '@core/constants/TableNames';
import * as crypto from 'crypto';

import { runAutoBackup } from '../../db-helpers/backup';

const tableExists = (db: any, tableName: string) => {
  const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return !!result;
};

// 🛡️ Yedekleme Throttling (Her işlemde disk yormayalım)
let lastBackupTime = 0;
const THROTTLE_MS = 5 * 60 * 1000; // 5 Dakika

const triggerThrottledBackup = () => {
  const now = Date.now();
  if (now - lastBackupTime > THROTTLE_MS) {
    lastBackupTime = now;
    runAutoBackup();
  }
};

export const setupRecordHandlers = (db: any, uow: any, services: any) => {
  const { saveTapu, saveVatandas, accounting } = services;

  const logActivity = (tx: any, table: string, recordId: string, action: string, prevState: any, nextState: any) => {
    try {
      const personnelRow = tx.db.prepare('SELECT id FROM TANIM_Personel WHERE Aktif = 1 LIMIT 1').get() as any;
      const userId = personnelRow ? personnelRow.id : 'SYSTEM';

      // 🛡️ BLOCKCHAIN BÜTÜNLÜK ZIRHI
      // 1. Son kaydın hash'ini al
      const lastLog = tx.db.prepare('SELECT Log_Hash FROM LOG_Activities ORDER BY Timestamp DESC, id DESC LIMIT 1').get() as any;
      const prevHash = lastLog ? lastLog.Log_Hash : 'GENESIS_BLOCK';

      // 2. Mevcut içeriği mühürle (Hashle)
      const logId = crypto.randomUUID();
      const content = `${table}|${recordId}|${action}|${JSON.stringify(prevState)}|${JSON.stringify(nextState)}|${userId}|${prevHash}`;
      const currentHash = crypto.createHash('sha256').update(content).digest('hex');

      tx.db.prepare(`
        INSERT INTO LOG_Activities (id, Table_Name, Record_Id, Action, Prev_State, Next_State, User_Id, Prev_Log_Hash, Log_Hash, Timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        logId,
        table,
        recordId,
        action,
        prevState ? JSON.stringify(prevState) : null,
        nextState ? JSON.stringify(nextState) : null,
        userId,
        prevHash,
        currentHash
      );
    } catch (e) {
      console.error("[LOG_ACTIVITY_ERROR]", e);
    }
  };

  ipcMain.handle('save-water-bill', async (_, data: any) => await accounting.saveWaterBill(data, 'DATA_Dagitim_Kayitlar'));
  ipcMain.handle('save-collection', async (_, data: any) => await accounting.saveCollection(data));

  ipcMain.handle('save-record', async (_, table: string, data: any) => {
    try {
      switch (table) {
        case TableNames.TAPU: 
        case 'DATA_Tapu_Verisi': 
          return await saveTapu.handle(data);
        case TableNames.VATANDAS: 
          return await saveVatandas.handle(data);
        
        case 'TANIM_Personel':
          return uow.executeTransaction((tx: any) => {
            const id = data.id || crypto.randomUUID();
            const cleanData = { ...data, id };
            if (cleanData.Eposta === '') cleanData.Eposta = null;
            if (cleanData.Telefon === '') cleanData.Telefon = null;
            tx.getRepository(table).save(cleanData);
            return { success: true, id };
          });

        case 'DATA_Dagitim_Bolgeleri':
        case 'DATA_Dagitim_Mahalleleri':
          return uow.executeTransaction((tx: any) => {
            const actualTable = 'DATA_Dagitim_Bolgeleri';
            const id = data.id || crypto.randomUUID();
            const cleanData = { ...data, id };
            tx.getRepository(actualTable).save(cleanData);
            return { success: true, id };
          });

        default:
          if (table === 'DATA_Dagitim_Kayitlar') return await accounting.saveWaterBill(data, table);
          if (table === 'MUHASEBE_Tahsilat') return await accounting.saveCollection(data);

          return uow.executeTransaction((tx: any) => {
            if (table === 'DATA_Tasinmaz_Mevkileri') {
               const existing = db.prepare(`SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE Mevki_Adi = ? AND deleted_at IS NULL`).get(data.Mevki_Adi) as any;
               if (existing && !data.id) data.id = existing.id;
            }
            
            const id = data.id || crypto.randomUUID();
            const action = data.id ? 'UPDATE' : 'CREATE';
            
            let prevState = null;
            if (action === 'UPDATE') {
               prevState = tx.db.prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id);
            }

            const nextState = { ...data, id };
            tx.getRepository(table).save(nextState);
            
            logActivity(tx, table, id, action, prevState, nextState);
            
            triggerThrottledBackup();
            return { success: true, id };
          });
      }
    } catch (e: any) {
      Logger.error('SAVE_ERROR', `Tablo: ${table}, Hata: ${e.message}`);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('delete-db-row', async (_, table: string, id: any, note?: string) => {
    try {
      // 🛡️ MUHASEBE GÜVENLİK PROTOKOLÜ: Fişler, Tahakkuklar ve Tahsilatlar ASLA SİLİNEMEZ
      const blockedTables = ['MUHASEBE_Fisler', 'MUHASEBE_Tahakkuk', 'MUHASEBE_Tahsilat'];
      if (blockedTables.includes(table)) {
        return { 
          success: false, 
          error: "MUHASEBE GÜVENLİĞİ: Kesilmiş olan bir fiş, tahakkuk veya tahsilat kaydı finansal denetim gereği silinemez. Yanlış kayıt için ters işlem (iptal fişi) giriniz." 
        };
      }

      return uow.executeTransaction((tx: any) => {
        const personnelRow = tx.db.prepare('SELECT id FROM TANIM_Personel WHERE Aktif = 1 LIMIT 1').get() as any;
        const personnelId = personnelRow ? personnelRow.id : null;

        if (table === TableNames.TAPU || table === 'DATA_Tapu_Verisi') {
          const auditSql = personnelId ? ", deleted_by = ?" : "";
          const noteSql = note ? ", islem_notu = ?" : "";
          const params = [id];
          if (personnelId) params.unshift(personnelId);
          if (note) params.splice(params.length - 1, 0, note); // Insert note before ID

          tx.db.prepare(`UPDATE REL_TASINMAZ_VATANDAS SET deleted_at = datetime('now')${auditSql}${noteSql} WHERE Tasinmaz_id = ?`).run(...params);
          tx.db.prepare(`UPDATE REL_TASINMAZ_ZILYET SET deleted_at = datetime('now')${auditSql}${noteSql} WHERE Tasinmaz_id = ?`).run(...params);
          if (tableExists(tx.db, 'MAP_Parsel_Verisi')) {
             tx.db.prepare(`UPDATE MAP_Parsel_Verisi SET deleted_at = datetime('now')${auditSql}${noteSql} WHERE Tasinmaz_id = ?`).run(...params);
          }
          tx.db.prepare('UPDATE MUHASEBE_Tahakkuk SET Tasinmaz_id = NULL WHERE Tasinmaz_id = ?').run(id);
        }

        // 🛡️ SULAMA DEFTERİ SİLİNİRSE TAHAKKUKU İPTAL ET
        if (table === 'DATA_Dagitim_Kayitlar') {
           tx.db.prepare(`
             UPDATE MUHASEBE_Tahakkuk 
             SET Durum = 'İPTAL (DEFTER SİLİNDİ)', deleted_at = datetime('now') 
             WHERE Fis_id = ?
           `).run(id);
        }

        const prevState = tx.db.prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id);
        const success = tx.getRepository(table).delete(id, note);
        
        if (success) {
           logActivity(tx, table, id, 'DELETE', prevState, { deleted: true, note });
           triggerThrottledBackup();
        }

        return { success };
      });
    } catch (e: any) {
      Logger.error('DELETE_ERROR', `Tablo: ${table}, ID: ${id}, Hata: ${e.message}`);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('hard-delete-record', async (_, table: string, id: any) => {
    try {
      return uow.executeTransaction((tx: any) => {
        if (table === TableNames.TAPU || table === 'DATA_Tapu_Verisi') {
           tx.db.prepare(`DELETE FROM REL_TASINMAZ_VATANDAS WHERE Tasinmaz_id = ?`).run(id);
           tx.db.prepare(`DELETE FROM REL_TASINMAZ_ZILYET WHERE Tasinmaz_id = ?`).run(id);
           if (tableExists(tx.db, 'MAP_Parsel_Verisi')) {
              tx.db.prepare(`DELETE FROM MAP_Parsel_Verisi WHERE Tasinmaz_id = ?`).run(id);
           }
        }
        return { success: tx.getRepository(table).hardDelete(id) };
      });
    } catch (e: any) {
      Logger.error('HARD_DELETE_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('restore-record', async (_, table: string, id: any) => {
    try {
      return uow.executeTransaction((tx: any) => {
        if (table === TableNames.TAPU || table === 'DATA_Tapu_Verisi') {
            tx.db.prepare(`UPDATE REL_TASINMAZ_VATANDAS SET deleted_at = NULL, deleted_by = NULL WHERE Tasinmaz_id = ?`).run(id);
            tx.db.prepare(`UPDATE REL_TASINMAZ_ZILYET SET deleted_at = NULL, deleted_by = NULL WHERE Tasinmaz_id = ?`).run(id);
            if (tableExists(tx.db, 'MAP_Parsel_Verisi')) {
               tx.db.prepare(`UPDATE MAP_Parsel_Verisi SET deleted_at = NULL, deleted_by = NULL WHERE Tasinmaz_id = ?`).run(id);
            }
        }
        
        const success = tx.getRepository(table).restore(id);
        if (success) {
           const nextState = tx.db.prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id);
           logActivity(tx, table, id, 'RESTORE', { deleted: true }, nextState);
        }
        
        return { success };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-deleted-records', async (_, table: string) => {
    try {
      const sql = `SELECT * FROM "${table}" WHERE deleted_at IS NOT NULL AND deleted_at != ''`;
      const result = db.prepare(sql).all();
      return { success: true, data: result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-history', async (_, table: string, recordId: string) => {
    try {
      const results: any[] = [];
      
      // 1. Yeni LOG_Activities Tablosundan Çek
      if (tableExists(db, 'LOG_Activities')) {
         const logs = db.prepare(`SELECT * FROM LOG_Activities WHERE Table_Name = ? AND Record_Id = ? ORDER BY Timestamp DESC`).all(table, recordId);
         results.push(...logs.map((l: any) => ({
            ...l,
            created_at: l.Timestamp,
            description: `${l.Action} İşlemi Yapıldı`,
            type: 'activity'
         })));
      }

      // 2. Eski logs tablosu varsa oradan çek (Legacy support)
      if (tableExists(db, 'logs')) {
         const oldLogs = db.prepare(`SELECT * FROM logs WHERE (table_name = ? AND record_id = ?) OR (description LIKE ?) ORDER BY created_at DESC LIMIT 50`).all(table, recordId, `%${recordId}%`);
         results.push(...oldLogs.map((l: any) => ({ ...l, type: 'legacy' })));
      }

      return { success: true, data: results.sort((a, b) => new Date(b.created_at || b.Timestamp).getTime() - new Date(a.created_at || a.Timestamp).getTime()) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('split-accrual-by-shares', async (_, tahakkukId: string) => {
    try {
      return uow.executeTransaction((tx: any) => {
        // 1. Tahakkuku bul
        const tahakkuk = tx.db.prepare('SELECT * FROM MUHASEBE_Tahakkuk WHERE id = ?').get(tahakkukId) as any;
        if (!tahakkuk) throw new Error("Tahakkuk bulunamadı.");
        if (!tahakkuk.Tasinmaz_id) throw new Error("Bu tahakkuk bir taşınmaza bağlı değil.");
        if (tahakkuk.Durum === 'Ödendi') throw new Error("Ödenmiş tahakkuk paylaştırılamaz.");

        // 2. Hissedarları bul
        const shareholders = tx.db.prepare(`
          SELECT ts.*, v.Ad, v.Soyad 
          FROM REL_TASINMAZ_VATANDAS ts 
          JOIN DATA_Vatandas v ON ts.Vatandas_Id = v.id 
          WHERE ts.Tasinmaz_id = ? AND (ts.deleted_at IS NULL OR ts.deleted_at = '')
        `).all(tahakkuk.Tasinmaz_id) as any[];

        if (shareholders.length <= 1) {
          throw new Error("Bu taşınmazda birden fazla hissedar bulunamadı.");
        }

        // 3. Paylaştır
        const anaMiktar = tahakkuk.Miktar;
        let kalanMiktar = anaMiktar;
        const now = new Date().toISOString();

        for (let i = 0; i < shareholders.length; i++) {
          const s = shareholders[i];
          const pay = Number(s.Hisse_Pay || 1);
          const payda = Number(s.Hisse_Payda || 1);
          
          let payMiktarı = 0;
          if (i === shareholders.length - 1) {
            payMiktarı = kalanMiktar; // Yuvarlama farklarını son kişiye ekle
          } else {
            payMiktarı = Number((anaMiktar * (pay / payda)).toFixed(2));
            kalanMiktar -= payMiktarı;
          }

          // Yeni Tahakkuk Oluştur
          tx.getRepository('MUHASEBE_Tahakkuk').save({
            id: crypto.randomUUID(),
            Vatandas_Id: s.Vatandas_Id,
            Tasinmaz_id: tahakkuk.Tasinmaz_id,
            Fis_id: tahakkuk.Fis_id,
            Donem_id: tahakkuk.Donem_id,
            Donem_Yili: tahakkuk.Donem_Yili,
            Miktar: payMiktarı,
            Tarih: tahakkuk.Tarih,
            Tur: tahakkuk.Tur,
            Aciklama: `${tahakkuk.Aciklama || 'SULAMA'} (HİSSELİ PAY: ${pay}/${payda})`,
            Durum: 'Bekliyor'
          });
        }

        // 4. Eski Tahakkuku İptal Et (Silme, İptal Et)
        tx.db.prepare(`
          UPDATE MUHASEBE_Tahakkuk 
          SET Durum = 'İPTAL (PAYLAŞTIRILDI)', deleted_at = ? 
          WHERE id = ?
        `).run(now, tahakkukId);

        return { success: true };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('update-payment-method', async (_, fisId: string, newMethod: string) => {
    try {
      return uow.executeTransaction((tx: any) => {
        const fis = tx.db.prepare('SELECT * FROM MUHASEBE_Fisler WHERE id = ?').get(fisId) as any;
        if (!fis) throw new Error("Fiş bulunamadı.");
        if (fis.Odeme_Yontemi === newMethod) return { success: true };

        const kasa = tx.db.prepare('SELECT * FROM TANIM_Kasalar WHERE id = ?').get(fis.Kasa_id) as any;
        if (!kasa) throw new Error("İlişkili kasa bulunamadı.");

        const tutar = Number(fis.Tutar || 0);

        if (newMethod === 'KREDİ KARTI') {
          // Nakit -> POS
          tx.db.prepare('UPDATE TANIM_Kasalar SET Bakiye = Bakiye - ?, Pos_Bakiye = Pos_Bakiye + ? WHERE id = ?').run(tutar, tutar, fis.Kasa_id);
        } else if (newMethod === 'NAKİT') {
          // POS -> Nakit
          tx.db.prepare('UPDATE TANIM_Kasalar SET Pos_Bakiye = Pos_Bakiye - ?, Bakiye = Bakiye + ? WHERE id = ?').run(tutar, tutar, fis.Kasa_id);
        }

        tx.db.prepare('UPDATE MUHASEBE_Fisler SET Odeme_Yontemi = ? WHERE id = ?').run(newMethod, fisId);
        
        return { success: true };
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  const hasColumn = (db: any, table: string, column: string) => {
    try {
      const info = db.prepare(`PRAGMA table_info("${table}")`).all() as any[];
      return info.some(c => c.name.toLowerCase() === column.toLowerCase());
    } catch (e) { return false; }
  };

  ipcMain.handle('check-duplicate', async (_, table: string, field: string, value: string, excludeId?: string) => {
    try {
      const strictUniqueFields = ['Sicil_No', 'TCKN'];
      const useDeletedAt = hasColumn(db, table, 'deleted_at') && !strictUniqueFields.includes(field);
      const softDeleteClause = useDeletedAt ? "AND (deleted_at IS NULL OR deleted_at = '')" : "";
      const sql = `SELECT id FROM "${table}" WHERE "${field}" = ? ${excludeId ? 'AND id != ?' : ''} ${softDeleteClause} LIMIT 1`;
      const result = db.prepare(sql).get(...(excludeId ? [value, excludeId] : [value]));
      return { success: true, exists: !!result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
