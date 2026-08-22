import { ipcMain } from 'electron';
import * as crypto from 'crypto';

export const setupQueryHandlers = (db: any, uow: any, services: any, executeRawSql: Function) => {
  const { getTapu } = services;

  ipcMain.handle('get-db-data', async (_, table: string, filter?: any) => {
    try {
      if (table === 'DATA_Tasinmaz_Mevkileri') {
        const sql = `
          SELECT 
            m.*, 
            loc.Ad as Mahalle_Koy_Adi,
            loc.TGKM_Mahalle_Ad as TGKM_Mahalle_Ad,
            p1.Ad as Belde,
            p2.Ad as Ilce,
            p3.Ad as Il
          FROM DATA_Tasinmaz_Mevkileri m
          LEFT JOIN TANIM_Konumlar loc ON m.Konum_id = loc.id
          LEFT JOIN TANIM_Konumlar p1 ON loc.Parent_id = p1.id
          LEFT JOIN TANIM_Konumlar p2 ON p1.Parent_id = p2.id
          LEFT JOIN TANIM_Konumlar p3 ON p2.Parent_id = p3.id
          WHERE (m.deleted_at IS NULL OR m.deleted_at = '')
          ${filter && filter.id ? 'AND m.id = ?' : ''}
          ${filter && filter.Konum_id ? 'AND m.Konum_id = ?' : ''}
        `;
        const params = [];
        if (filter && filter.id) params.push(filter.id);
        if (filter && filter.Konum_id) params.push(filter.Konum_id);
        return await executeRawSql(sql, params);
      }

      if (table === 'TANIM_Meravlar') {
        const sql = `SELECT m.*, (v.Ad || ' ' || v.Soyad) as Ad_Soyad, v.Telefon as Vatandas_Telefon FROM TANIM_Meravlar m JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id WHERE (m.deleted_at IS NULL OR m.deleted_at = '') ${filter && filter.id ? 'AND m.id = ?' : ''}`;
        const res = await executeRawSql(sql, filter && filter.id ? [filter.id] : []);
        if (res.success && res.data) res.data = res.data.map((r: any) => ({ ...r, Telefon: r.Telefon || r.Vatandas_Telefon || '---' }));
        return res;
      }

      if (table === 'DATA_Tapu_Verisi') {
        const sql = `
          SELECT 
            t.*, 
            m.Mevki_Adi as Mevki,
            loc.Ad as Mahalle_Koy,
            loc.TGKM_Mahalle_Ad as TGKM_Mahalle_Ad,
            (SELECT COUNT(*) FROM REL_TASINMAZ_VATANDAS s WHERE s.Tasinmaz_id = t.id AND (s.deleted_at IS NULL OR s.deleted_at = '')) as Paydas_Sayisi,
            (SELECT v.Ad || ' ' || v.Soyad FROM REL_TASINMAZ_VATANDAS s JOIN DATA_Vatandas v ON s.Vatandas_Id = v.id WHERE s.Tasinmaz_id = t.id AND (s.deleted_at IS NULL OR s.deleted_at = '') LIMIT 1) as Tapu_Sahibi_Ad_Soyad,
            (SELECT COALESCE(v.TCKN, v.id) FROM REL_TASINMAZ_VATANDAS s JOIN DATA_Vatandas v ON s.Vatandas_Id = v.id WHERE s.Tasinmaz_id = t.id AND (s.deleted_at IS NULL OR s.deleted_at = '') LIMIT 1) as Tapu_Sahibi_TCKN,
            (SELECT GROUP_CONCAT(v.Ad || ' ' || v.Soyad || ' [' || COALESCE(v.TCKN, '---') || '] (' || s.Hisse_Pay || '/' || s.Hisse_Payda || ')', '|') 
             FROM REL_TASINMAZ_VATANDAS s 
             JOIN DATA_Vatandas v ON s.Vatandas_Id = v.id 
             WHERE s.Tasinmaz_id = t.id AND (s.deleted_at IS NULL OR s.deleted_at = '')) as Hissedar_Listesi 
          FROM DATA_Tapu_Verisi t 
          LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
          LEFT JOIN TANIM_Konumlar loc ON m.Konum_id = loc.id
          WHERE (t.deleted_at IS NULL OR t.deleted_at = '') 
          ${filter && filter.Mevki_id ? 'AND t.Mevki_id = ?' : ''} 
          ${filter && filter.id ? 'AND t.id = ?' : ''}
          ${filter && filter.Ada ? 'AND t.Ada = ?' : ''}
          ${filter && filter.Parsel ? 'AND t.Parsel = ?' : ''}
          ${filter && filter.Tapu_Sahibi_TCKN ? 'AND t.id IN (SELECT ts.Tasinmaz_id FROM REL_TASINMAZ_VATANDAS ts JOIN DATA_Vatandas v ON ts.Vatandas_Id = v.id WHERE v.TCKN = ? AND (ts.deleted_at IS NULL OR ts.deleted_at = \'\'))' : ''}
        `;
        const params = [];
        if (filter && filter.Mevki_id) params.push(filter.Mevki_id);
        if (filter && filter.id) params.push(filter.id);
        if (filter && filter.Ada) params.push(filter.Ada);
        if (filter && filter.Parsel) params.push(filter.Parsel);
        if (filter && filter.Tapu_Sahibi_TCKN) params.push(filter.Tapu_Sahibi_TCKN);
        
        const res = await executeRawSql(sql, params);
        if (res.success && res.data) {
          res.data = res.data.map((r: any) => ({ 
            ...r, 
            Hissedarlar: r.Hissedar_Listesi ? r.Hissedar_Listesi.split('|') : [] 
          }));
        }
        return res;
      }

      if (table === 'DATA_Dagitim_Bolgeleri') {
        const sql = `
          SELECT 
            b.*, 
            loc.Ad as Mahalle_Adi, 
            (SELECT COALESCE(SUM(t.Aylik_Su_Hakki), 0) FROM DATA_Tapu_Verisi t WHERE t.Mevki_id IN (SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE Konum_id = b.Mahalle_id) AND (t.deleted_at IS NULL OR t.deleted_at = '')) as Su_Hakki_m3, 
            COALESCE(
              (
                SELECT GROUP_CONCAT(v.Ad || ' ' || v.Soyad, ', ')
                FROM REL_Defter_Merav r
                JOIN TANIM_Meravlar mr ON r.Merav_id = mr.id
                JOIN DATA_Vatandas v ON mr.Vatandas_Id = v.id
                JOIN DATA_Dagitim_Donemleri d ON r.Defter_id = d.id
                WHERE d.Bolge_id = b.id AND d.Aktif = 1 AND r.Aktif = 1
              ),
              (
                SELECT v.Ad || ' ' || v.Soyad 
                FROM TANIM_Meravlar mr 
                JOIN DATA_Vatandas v ON mr.Vatandas_Id = v.id 
                WHERE mr.id = b.Sorumlu_Merav_id
              )
            ) as Merav_Adi,
            COALESCE(
              (
                SELECT GROUP_CONCAT(mr.id, ',')
                FROM REL_Defter_Merav r
                JOIN TANIM_Meravlar mr ON r.Merav_id = mr.id
                JOIN DATA_Dagitim_Donemleri d ON r.Defter_id = d.id
                WHERE d.Bolge_id = b.id AND d.Aktif = 1 AND r.Aktif = 1
              ),
              b.Sorumlu_Merav_id
            ) as Merav_Ids 
          FROM DATA_Dagitim_Bolgeleri b 
          LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id 
          WHERE (b.deleted_at IS NULL OR b.deleted_at = '') 
          ${filter && filter.id ? 'AND b.id = ?' : ''}
          ${filter && filter.Mahalle_id ? 'AND b.Mahalle_id = ?' : ''}
        `;
        const params = [];
        if (filter && filter.id) params.push(filter.id);
        if (filter && filter.Mahalle_id) params.push(filter.Mahalle_id);
        return await executeRawSql(sql, params);
      }

      const hasColumn = (table: string, column: string) => {
        try {
          const info = db.prepare(`PRAGMA table_info("${table}")`).all() as any[];
          return info.some((c: any) => c.name.toLowerCase() === column.toLowerCase());
        } catch (e) { return false; }
      };

      if (filter && typeof filter === 'object' && Object.keys(filter).length > 0) {
        const keys = Object.keys(filter);
        const whereClause = keys.map(k => `"${k}" = ?`).join(' AND ');
        const useDeletedAt = hasColumn(table, 'deleted_at');
        const softDeleteClause = useDeletedAt ? "AND (deleted_at IS NULL OR deleted_at = '')" : "";
        return await executeRawSql(`SELECT * FROM "${table}" WHERE ${whereClause} ${softDeleteClause}`, Object.values(filter));
      }

      // 🛡️ BASİT ARAMA MOTORU
      if (filter && typeof filter === 'string' && filter.trim() !== '') {
        try {
          const tableInfo = db.prepare(`PRAGMA table_info("${table}")`).all() as any[];
          const searchableCols = tableInfo
            .filter(c => {
              const type = c.type.toUpperCase();
              const name = c.name.toLowerCase();
              return type.includes('TEXT') || 
                     type.includes('CHAR') || 
                     type.includes('VAR') || 
                     type.includes('INT') ||
                     ['ad', 'soyad', 'sicil', 'tckn', 'mevki', 'aciklama'].some(n => name.includes(n));
            })
            .map(c => c.name);
          
          console.log(`[DEBUG] Table: ${table}, Searchable Columns:`, searchableCols);
          
          const useDeletedAt = tableInfo.some(c => c.name.toLowerCase() === 'deleted_at');
          const softDeleteClause = useDeletedAt ? "AND (deleted_at IS NULL OR deleted_at = '')" : "";

          const terms = filter.trim().split(/\s+/);
          let whereParts: string[] = [];
          let params: any[] = [];

          for (const term of terms) {
            // 🛡️ MERKEZİ TR_SEARCH MOTORU (Zırhlı Arama)
            whereParts.push(`(${searchableCols.map(c => `TR_SEARCH("${c}") LIKE TR_SEARCH(?)`).join(' OR ')})`);
            searchableCols.forEach(() => params.push(`%${term}%`));
          }

          if (whereParts.length > 0) {
            const sql = `SELECT * FROM "${table}" WHERE ${whereParts.join(' AND ')} ${softDeleteClause}`;
            return await executeRawSql(sql, params);
          }
        } catch (e) {
          console.error(`[SEARCH_ERROR_${table}]`, e);
        }
      }
      if (table === 'logs') {
        const sql = `
          SELECT id, action, details, user, timestamp as date FROM SYSTEM_Logs
          UNION ALL
          SELECT id, (type || ' [' || screen || ']') as action, (action || ': ' || details) as details, user, timestamp as date FROM SYSTEM_Analytics
          UNION ALL
          SELECT 
            l.id, 
            l.Action as action, 
            (l.Table_Name || ' (' || l.Record_Id || ') İşlemi') as details, 
            COALESCE(v.Ad || ' ' || v.Soyad, l.User_Id) as user, 
            l.Timestamp as date 
          FROM LOG_Activities l
          LEFT JOIN TANIM_Personel p ON l.User_Id = p.id
          LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
          ORDER BY date DESC
          LIMIT 1000
        `;
        return await executeRawSql(sql, []);
      }
      return { success: true, data: uow.getRepository(table).getAll() };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-all-ledgers-summary', async () => {
    try {
      const records = db.prepare(`
        SELECT 
          t.*, 
          v.Sicil_No, 
          v.TCKN as Vatandas_Id, 
          v.Ad || ' ' || v.Soyad as Full_Name, 
          d.Donem_Adi,
          loc.Ad as Mahalle_Adi
        FROM DATA_Dagitim_Kayitlar t 
        LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id 
        LEFT JOIN DATA_Dagitim_Donemleri d ON t.Donem_id = d.id 
        LEFT JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
        LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
      `).all() as any[];

      const manual = db.prepare(`
        SELECT 
          t.*, 
          v.Sicil_No, 
          v.TCKN as Vatandas_Id, 
          v.Ad || ' ' || v.Soyad as Full_Name,
          'GENEL' as Mahalle_Adi
        FROM MUHASEBE_Tahakkuk t 
        LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id 
        WHERE (t.deleted_at IS NULL OR t.deleted_at = '') 
        AND (t.Fis_id IS NULL OR t.Fis_id = '')
      `).all() as any[];
      
      const allRecords = [...records, ...manual].map(r => ({
        ...r,
        Ad_Soyad: r.Full_Name || r.Ad_Soyad || 'Bilinmeyen',
        Miktar: r.Toplam_Tutar || r.Miktar || 0,
        Tarih: r.Tarih || r.created_at,
        Donem: r.Donem_Adi || r.Donem_Yili || 'Dönem Yok',
        Mahalle_Adi: r.Mahalle_Adi || 'GENEL'
      })).sort((a, b) => new Date(b.Tarih || 0).getTime() - new Date(a.Tarih || 0).getTime());

      return { success: true, allRecords };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('global-search', async (_, query: string) => {
    try {
      if (!query) return { success: true, data: [] };
      const searchTerm = query.trim();
      const numericTerm = query.replace(/\D/g, ''); 
      const results: any[] = [];

      // 1. 👤 VATANDAŞ ARAMA (TCKN, Sicil veya İsim)
      if (numericTerm.length >= 1) {
        const people = db.prepare(`SELECT * FROM DATA_Vatandas WHERE (TCKN LIKE ? OR Sicil_No LIKE ?) AND (deleted_at IS NULL OR deleted_at = '') LIMIT 10`).all(`${numericTerm}%`, `${numericTerm}%`) as any[];
        people.forEach(p => results.push({ 
          id: p.id, 
          type: 'Kişi', 
          title: `${p.Ad} ${p.Soyad}`, 
          subtitle: `TCKN: ${p.TCKN} | A: ${p.Ana_Adi || '-'} B: ${p.Baba_Adi || '-'}`, 
          is_exact: p.TCKN === numericTerm ? 1 : 0 
        }));
      }

      if (searchTerm.length >= 2) {
        const people = db.prepare(`
          SELECT * FROM DATA_Vatandas 
          WHERE TR_SEARCH(Ad || ' ' || Soyad) LIKE TR_SEARCH(?)
          AND (deleted_at IS NULL OR deleted_at = '') 
          LIMIT 15
        `).all(`%${searchTerm}%`) as any[];
        people.forEach(p => { 
          if (!results.find(r => r.id === p.id)) {
            results.push({ 
              id: p.id, 
              type: 'Kişi', 
              title: `${p.Ad} ${p.Soyad}`, 
              subtitle: `TCKN: ${p.TCKN} | A: ${p.Ana_Adi || '-'} B: ${p.Baba_Adi || '-'}`, 
              is_exact: 0 
            }); 
          }
        });
      }

      // 2. 📜 TAPU & TAŞINMAZ ARAMA (Ada/Parsel, Nitelik veya Sahibi)
      if (searchTerm.includes('/')) {
        const [ada, parsel] = searchTerm.split('/');
        if (ada && parsel) {
          const tapus = db.prepare(`SELECT t.*, m.Mevki_Adi FROM DATA_Tapu_Verisi t LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id WHERE t.Ada = ? AND t.Parsel LIKE ? AND (t.deleted_at IS NULL OR t.deleted_at = '') LIMIT 10`).all(ada, `${parsel}%`) as any[];
          tapus.forEach(t => results.push({ id: t.id, type: 'Tapu', title: `${t.Ada}/${t.Parsel} - ${t.Mevki_Adi || 'Mevki Yok'}`, subtitle: `${t.Nitelik || 'Taşınmaz'} | ${t.Alan_m2} m²`, is_exact: t.Parsel === parsel ? 1 : 0 }));
        }
      } else if (numericTerm.length >= 1) {
        const tapus = db.prepare(`
          SELECT t.*, m.Mevki_Adi, (v.Ad || ' ' || v.Soyad) as Sahibi 
          FROM DATA_Tapu_Verisi t 
          JOIN REL_TASINMAZ_VATANDAS ts ON t.id = ts.Tasinmaz_id
          JOIN DATA_Vatandas v ON ts.Vatandas_Id = v.id
          LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id 
          WHERE (v.TCKN LIKE ? OR t.Ada LIKE ? OR t.Parsel LIKE ? OR t.Tasinmaz_No LIKE ?) 
          AND (t.deleted_at IS NULL OR t.deleted_at = '') 
          LIMIT 10
        `).all(`${numericTerm}%`, `${numericTerm}%`, `${numericTerm}%`, `${numericTerm}%`) as any[];
        tapus.forEach(t => { if (!results.find(r => r.id === t.id)) results.push({ id: t.id, type: 'Tapu', title: `${t.Ada}/${t.Parsel} - ${t.Mevki_Adi || 'Mevki Yok'}`, subtitle: `Sahibi: ${t.Sahibi} | ${t.Alan_m2} m²`, is_exact: 0 }); });
        const tapusResults = db.prepare(`
          SELECT t.*, m.Mevki_Adi, (v.Ad || ' ' || v.Soyad) as Sahibi 
          FROM DATA_Tapu_Verisi t 
          JOIN REL_TASINMAZ_VATANDAS ts ON t.id = ts.Tasinmaz_id
          JOIN DATA_Vatandas v ON ts.Vatandas_Id = v.id
          LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id 
          WHERE TR_SEARCH(v.Ad || ' ' || v.Soyad) LIKE TR_SEARCH(?)
          AND (t.deleted_at IS NULL OR t.deleted_at = '') 
          LIMIT 10
        `).all(`%${searchTerm}%`) as any[];
        tapusResults.forEach(t => { if (!results.find(r => r.id === t.id)) results.push({ id: t.id, type: 'Tapu', title: `${t.Ada}/${t.Parsel} - ${t.Mevki_Adi || 'Mevki Yok'}`, subtitle: `Sahibi: ${t.Sahibi} | ${t.Alan_m2} m²`, is_exact: 0 }); });
      }

      // 3. 📍 MEVKİ ARAMA
      if (searchTerm.length >= 2) {
        const mevkiler = db.prepare(`
          SELECT * FROM DATA_Tasinmaz_Mevkileri 
          WHERE TR_SEARCH(Mevki_Adi) LIKE TR_SEARCH(?)
          AND (deleted_at IS NULL OR deleted_at = '') LIMIT 10
        `).all(`%${searchTerm}%`) as any[];
        mevkiler.forEach(m => results.push({ id: m.id, type: 'Mevki', title: m.Mevki_Adi, subtitle: `Taşınmaz Mevkisi / Bölge`, is_exact: 0 }));
      }

      return { success: true, data: results };
    } catch (e: any) {
      console.error("[GLOBAL_SEARCH_ERROR]", e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-activity-logs', async () => {
    try {
      const logs = db.prepare(`
        SELECT 
          l.*, 
          (v.Ad || ' ' || v.Soyad) as Ad_Soyad,
          v.Sicil_No
        FROM LOG_Activities l
        LEFT JOIN TANIM_Personel p ON l.User_Id = p.id
        LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
        ORDER BY l.Timestamp DESC
        LIMIT 500
      `).all() as any[];

      // 🛡️ ZİNCİR DOĞRULAMA (Integrity Check)
      let isChainValid = true;
      let lastValidHash = null;

      // Tersten kontrol etmeliyiz (en eskiden en yeniye)
      const sortedLogs = [...logs].reverse();
      for (let i = 0; i < sortedLogs.length; i++) {
        const l = sortedLogs[i];
        // Basit içerik kontrolü
        const content = `${l.Table_Name}|${l.Record_Id}|${l.Action}|${l.Prev_State}|${l.Next_State}|${l.User_Id}|${l.Prev_Log_Hash}`;
        const checkHash = crypto.createHash('sha256').update(content).digest('hex');
        
        if (checkHash !== l.Log_Hash) {
          isChainValid = false;
          l.integrity_error = true;
        }

        if (lastValidHash && l.Prev_Log_Hash !== lastValidHash) {
           isChainValid = false;
           l.chain_error = true;
        }
        lastValidHash = l.Log_Hash;
      }

      return { success: true, logs, isChainValid };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
};
