import { ipcMain } from 'electron'
import { getDb } from '../../db'
import http from 'http'
import os from 'os'
import { container } from 'tsyringe'
import { CrudService } from '../../services/CrudService'

let lanServer: any = null;

// 🛡️ 15 SANİYE CACHE SİSTEMİ
const CACHE_TTL = 15000;
const serverCache: Record<string, { data: any, timestamp: number }> = {};

const getFromCache = (key: string) => {
  const cached = serverCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  serverCache[key] = { data, timestamp: Date.now() };
};

/**
 * 🛡️ Önbellek Temizleme (Invalidation)
 * Bir tabloya veri yazıldığında o tabloya ait tüm cache ve stats temizlenir.
 */
export const invalidateTableCache = (table: string) => {
  Object.keys(serverCache).forEach(key => {
    if (key.includes(table)) {
      delete serverCache[key];
    }
  });
  // İstatistikler her zaman temizlenir çünkü sayılar değişir
  delete serverCache['stats'];
};

export const startLanServerInternal = async (port: number = 7070): Promise<any> => {
  return new Promise((resolve) => {
    if (lanServer) {
      lanServer.close();
      lanServer = null;
    }
    
    const server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const endpoint = url.pathname;

      // 🔍 READ: GET STATS (Legacy)
      if (endpoint === '/api/get-stats' && req.method === 'GET') {
        const cacheKey = 'stats';
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(cachedData));
          return;
        }

        try {
          const db = getDb();
          const stats = {
            vatandasCount: db.prepare('SELECT COUNT(*) as count FROM DATA_Vatandas').get().count,
            tapuCount: db.prepare('SELECT COUNT(*) as count FROM DATA_Tapu_Verisi').get().count,
            totalArea: db.prepare('SELECT SUM(Alan_m2) as sum FROM DATA_Tapu_Verisi').get().sum || 0,
            mevkiCount: db.prepare('SELECT COUNT(*) as count FROM DATA_Tasinmaz_Mevkileri').get().count,
            mahalleCount: db.prepare('SELECT COUNT(*) as count FROM DATA_Dagitim_Bolgeleri').get().count,
            usageHours: 0,
            totalDebt: 0,
            totalPaid: db.prepare("SELECT SUM(Miktar) as sum FROM MUHASEBE_Tahsilat").get().sum || 0,
            ledgerCount: db.prepare("SELECT COUNT(*) as count FROM DATA_Dagitim_Donemleri").get().count || 0
          };

          const usageRes = db.prepare(`SELECT SUM(Kullanim_Saati * 60) as sum FROM DATA_Dagitim_Kayitlar WHERE deleted_at IS NULL`).get() as any;
          const debtRes = db.prepare(`
            SELECT SUM(t.Toplam_Tutar) as sum 
            FROM DATA_Dagitim_Kayitlar t
            LEFT JOIN MUHASEBE_Tahakkuk th ON t.id = th.Fis_id
            WHERE (th.Durum != 'Ödendi' OR th.Durum IS NULL) AND t.deleted_at IS NULL
          `).get() as any;

          stats.usageHours = Math.round((usageRes?.sum || 0) / 60);
          stats.totalDebt = debtRes?.sum || 0;
          const responseData = { success: true, stats };
          setCache(cacheKey, responseData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(responseData));
        } catch (e) {
          res.writeHead(500); res.end(JSON.stringify({ success: false }));
        }
      } 
      
      // 🔍 READ: GET DATA (Legacy)
      else if (endpoint === '/api/get-db-data' && req.method === 'GET') {
        const table = url.searchParams.get('table') || '';
        const search = url.searchParams.get('search') || '';
        const cacheKey = `db_${table}_${search}`;
        const cachedData = getFromCache(cacheKey);

        if (cachedData) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(cachedData));
          return;
        }

        try {
          const db = getDb();
          let sql = `SELECT * FROM ${table}`;
          const params: any[] = [];
          if (search) {
            const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
            const whereClause = columns.map(col => `"${col.name}" LIKE ?`).join(' OR ');
            sql += ` WHERE ${whereClause}`;
            for (let i = 0; i < columns.length; i++) params.push(`%${search}%`);
          }
          const data = db.prepare(sql).all(...params);
          const responseData = { success: true, data };
          setCache(cacheKey, responseData);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(responseData));
        } catch (e: any) {
          res.writeHead(500); res.end(JSON.stringify({ success: false, error: e.message }));
        }
      }

      // ✍️ WRITE: SAVE/UPDATE RECORD (Legacy)
      else if ((endpoint === '/api/save-record' || endpoint === '/api/update-db-row') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            const { table, data, id } = payload;
            const db = getDb();
            
            if (endpoint === '/api/save-record') {
              const columns = Object.keys(data).join(', ');
              const placeholders = Object.keys(data).map(() => '?').join(', ');
              db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...Object.values(data));
            } else {
              const sets = Object.keys(data).map(k => `"${k}" = ?`).join(', ');
              db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(...Object.values(data), id);
            }

            invalidateTableCache(table);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            res.writeHead(500); res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      }

      // 🚀 YENİ MODERN REST API: GET /api/v1/crud/:table ve /api/v1/crud/:table/:id
      else if (endpoint.startsWith('/api/v1/crud/') && req.method === 'GET') {
        try {
          const parts = endpoint.split('/').filter(Boolean);
          const table = parts[3];
          const id = parts[4];
          const crudService = container.resolve(CrudService);

          if (id) {
            const result = await crudService.findOne(table, id);
            res.writeHead(result.success ? 200 : 404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } else {
            const search = url.searchParams.get('search') || undefined;
            const page = Number(url.searchParams.get('page')) || 1;
            const pageSize = Number(url.searchParams.get('pageSize')) || 50;
            const orderBy = url.searchParams.get('orderBy') || undefined;
            const orderDir = (url.searchParams.get('orderDir') || 'ASC') as any;

            // Filtreleri searchParams'tan parse et (rezerve parametreler dışındakiler filtre kabul edilir)
            const filters: Record<string, any> = {};
            url.searchParams.forEach((val, key) => {
              if (!['search', 'page', 'pageSize', 'orderBy', 'orderDir'].includes(key)) {
                filters[key] = val;
              }
            });

            const result = await crudService.find(table, { search, filters, page, pageSize, orderBy, orderDir });
            res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          }
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      }

      // 🚀 YENİ MODERN REST API: POST /api/v1/crud/:table (Create)
      else if (endpoint.startsWith('/api/v1/crud/') && req.method === 'POST') {
        const parts = endpoint.split('/').filter(Boolean);
        const table = parts[3];
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const crudService = container.resolve(CrudService);
            const result = await crudService.create(table, data);
            res.writeHead(result.success ? 201 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      }

      // 🚀 YENİ MODERN REST API: PUT /api/v1/crud/:table/:id (Update)
      else if (endpoint.startsWith('/api/v1/crud/') && req.method === 'PUT') {
        const parts = endpoint.split('/').filter(Boolean);
        const table = parts[3];
        const id = parts[4];
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const crudService = container.resolve(CrudService);
            const result = await crudService.update(table, id, data);
            res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      }

      // 🚀 YENİ MODERN REST API: DELETE /api/v1/crud/:table/:id (Delete)
      else if (endpoint.startsWith('/api/v1/crud/') && req.method === 'DELETE') {
        try {
          const parts = endpoint.split('/').filter(Boolean);
          const table = parts[3];
          const id = parts[4];
          const note = url.searchParams.get('note') || undefined;
          const crudService = container.resolve(CrudService);
          const result = await crudService.delete(table, id, note);
          res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: e.message }));
        }
      }

      // 🚀 YENİ MODERN REST API: GET /api/v1/export/:table (Export JSON/CSV)
      else if (endpoint.startsWith('/api/v1/export/') && req.method === 'GET') {
        try {
          const parts = endpoint.split('/').filter(Boolean);
          const table = parts[3];
          const format = (url.searchParams.get('format') || 'json') as any;
          const crudService = container.resolve(CrudService);
          const result = await crudService.exportData(table, format);

          if (format === 'csv') {
            res.writeHead(200, { 
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename="${table}_export.csv"`
            });
            res.end(result.data);
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          }
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: e.message }));
        }
      }

      // 🚀 YENİ MODERN REST API: POST /api/v1/import/:table (Import Data)
      else if (endpoint.startsWith('/api/v1/import/') && req.method === 'POST') {
        const parts = endpoint.split('/').filter(Boolean);
        const table = parts[3];
        const overwrite = url.searchParams.get('overwrite') === 'true';
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const records = JSON.parse(body);
            const crudService = container.resolve(CrudService);
            const result = await crudService.importData(table, records, { overwrite });
            res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      }

      else {
        res.writeHead(404); res.end();
      }
    });

    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`[LAN] Port ${port} dolu, ${port + 1} deneniyor...`);
        server.close();
        resolve(startLanServerInternal(port + 1));
      } else {
        console.error(`[LAN] Sunucu Hatası:`, e);
        resolve({ success: false, error: e.message });
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`[LAN] Kurumsal sunucu ${port} portu üzerinden yayına başlatılmıştır.`);
      lanServer = server;
      resolve({ success: true, active: true, port });
    });
  });
};

export const setupServerHandlers = () => {
  ipcMain.handle('toggle-lan-server', async (_, opts: { active: boolean, port: number }) => {
    if (!opts.active) {
      if (lanServer) { lanServer.close(); lanServer = null; }
      return { success: true, active: false };
    }
    return await startLanServerInternal(opts.port);
  });

  ipcMain.handle('get-local-ip', async () => {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]!) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
    return '127.0.0.1';
  });

  ipcMain.handle('restart-local-server', async (_, port: number) => {
    return await startLanServerInternal(port);
  });
}
