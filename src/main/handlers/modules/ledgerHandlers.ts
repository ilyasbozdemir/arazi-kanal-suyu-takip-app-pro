import { ipcMain } from 'electron';
import { Logger } from '../../logger';
import * as crypto from 'crypto';

export const setupLedgerHandlers = (db: any, uow: any, services: any) => {
  const { getActiveLedgers } = services;

  ipcMain.handle('get-active-ledgers-hub', async () => await getActiveLedgers.handle());

  ipcMain.handle('create-dynamic-ledger', async (_, neighborhoodId: string, year: string) => {
    const transaction = db.transaction(() => {
      // 🛡️ AKILLI ID ÇÖZÜMLEME
      let mId = neighborhoodId;
      let bolgeId: string | null = null;

      const bCols = db.prepare('PRAGMA table_info(DATA_Dagitim_Bolgeleri)').all() as any[];
      const bHasMahalleId = bCols.some((c: any) => c.name === 'Mahalle_id');
      
      const bQuery = bHasMahalleId 
        ? 'SELECT id, Mahalle_id FROM DATA_Dagitim_Bolgeleri WHERE id = ? OR Mahalle_id = ?'
        : 'SELECT id FROM DATA_Dagitim_Bolgeleri WHERE id = ?';
        
      const bolgeRecord = db.prepare(bQuery).get(neighborhoodId, ...(bHasMahalleId ? [neighborhoodId] : [])) as any;
      if (bolgeRecord) {
        mId = bHasMahalleId ? bolgeRecord.Mahalle_id : bolgeRecord.id;
        bolgeId = bolgeRecord.id;
      }

      const konum = db.prepare('SELECT Ad FROM TANIM_Konumlar WHERE id = ?').get(mId) as any;
      if (!konum) throw new Error(`BÖLGE BULUNAMADI! (ID: ${neighborhoodId})`);

      // 🛡️ DÖNEM OLUŞTURMA
      const donemCols = db.prepare('PRAGMA table_info(DATA_Dagitim_Donemleri)').all() as any[];
      const usesBolgeId = donemCols.some((c: any) => c.name === 'Bolge_id');
      const donemIdCol = usesBolgeId ? 'Bolge_id' : 'Mahalle_id';
      const donemIdVal = (usesBolgeId && bolgeId) ? bolgeId : mId;

      const hasMahalleId = donemCols.some((c: any) => c.name === 'Mahalle_id');
      const conditions = [];
      const params = [];

      if (usesBolgeId) {
        conditions.push('Bolge_id = ?');
        params.push(donemIdVal);
        if (bolgeId) { conditions.push('Bolge_id = ?'); params.push(bolgeId); }
      }
      if (hasMahalleId) {
        conditions.push('Mahalle_id = ?');
        params.push(mId);
      }

      const existing = db.prepare(`
        SELECT id FROM DATA_Dagitim_Donemleri 
        WHERE (${conditions.join(' OR ')}) 
        AND Baslangic_Yili = ? 
        AND (deleted_at IS NULL OR deleted_at = '')
      `).get(...params, year);
      
      if (existing) throw new Error('BU YILA AİT DEFTER ZATEN OLUŞTURULMUŞ!');

      const donemId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO DATA_Dagitim_Donemleri (id, ${donemIdCol}, Baslangic_Yili, Donem_Adi, Aktif, Durum) 
        VALUES (?, ?, ?, ?, 1, 'Hazırlık')
      `).run(donemId, donemIdVal, year, `${year} Sulama Sezonu`);

      return { success: true, id: donemId };
    });

    try {
      const result = transaction();
      return result;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 🛡️ Bölge Silme: Dönem açılmışsa kesinlikle izin verme
  ipcMain.handle('delete-bolge-safe', async (_, bolgeId: string) => {
    try {
      // 🛡️ id kolonuyla sorgula - Mahalle_id yoksa diye güvenli yol
      const bolge = db.prepare('SELECT * FROM DATA_Dagitim_Bolgeleri WHERE id = ?').get(bolgeId) as any;
      if (!bolge) return { success: false, error: 'BÖLGE BULUNAMADI!' };

      // 🔒 Dönem tablosundaki kolon adını dinamik olarak belirle
      const donemCols = db.prepare('PRAGMA table_info(DATA_Dagitim_Donemleri)').all() as any[];
      const usesBolgeId = donemCols.some((c: any) => c.name === 'Bolge_id');
      const donemIdCol = usesBolgeId ? 'Bolge_id' : 'Mahalle_id';
      const donemIdVal = usesBolgeId ? bolgeId : (bolge.Mahalle_id || bolgeId);

      const donemCount = db.prepare(`SELECT COUNT(*) as cnt FROM DATA_Dagitim_Donemleri WHERE ${donemIdCol} = ? AND (deleted_at IS NULL OR deleted_at = '')`).get(donemIdVal) as any;
      if (donemCount?.cnt > 0) {
        return { success: false, error: `BU BÖLGEYE AİT ${donemCount.cnt} ADET DÖNEM MEVCUTTUR. SİLME ENGELLENDİ!`, locked: true };
      }

      // Soft delete
      db.prepare('UPDATE DATA_Dagitim_Bolgeleri SET deleted_at = ? WHERE id = ?').run(new Date().toISOString(), bolgeId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('merav-devir', async (_, { oldMeravId, newMeravId }) => {
    try {
      return uow.executeTransaction((tx: any) => {
        const now = new Date().toISOString();
        // 🛡️ Eski Meravın aktif görevlerini kapat
        tx.db.prepare(`UPDATE REL_Defter_Merav SET Bitis_Tarihi = ?, Aktif = 0, deleted_at = ? WHERE Merav_id = ? AND Aktif = 1`).run(now, now, oldMeravId);

        // 🛡️ Kapatılan görevleri bul ve yeni Merava aktar
        const activeAssignments = tx.db.prepare(`SELECT Defter_id FROM REL_Defter_Merav WHERE Merav_id = ? AND Bitis_Tarihi = ?`).all(oldMeravId, now) as any[];

        for (const assign of activeAssignments) {
           tx.db.prepare(`INSERT INTO REL_Defter_Merav (id, Defter_id, Merav_id, Baslangic_Tarihi, Aktif) VALUES (?, ?, ?, ?, 1)`)
             .run(crypto.randomUUID(), assign.Defter_id, newMeravId, now);
        }

        Logger.info('MERAV_DEVIR', `Sarsılmaz Devir Tamamlandı: ${oldMeravId} -> ${newMeravId}`);
        return { success: true };
      });
    } catch (e: any) {
      Logger.error('MERAV_DEVIR_ERROR', e.message);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-next-receipt-number', async (_, defterAdi: string) => {
    try {
      const book = db.prepare('SELECT son_no FROM TANIM_Sulama_Fis_Kocanlari WHERE defter_adi = ? AND deleted_at IS NULL').get(defterAdi) as any;
      return { success: true, nextNo: (book?.son_no || 0) + 1 };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('archive-ledger', async (_, id: string) => {
    try {
      db.prepare("UPDATE DATA_Dagitim_Donemleri SET Durum = 'Arşivlendi' WHERE id = ?").run(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
};
