import { ipcMain, app, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { getDb } from '../../db';
import * as crypto from 'node:crypto';
import { TkgmService } from '../../application/services/TkgmService';

export function setupMapLayerHandlers() {
  console.log('[MAIN] Registering Map Layer Handlers...');
  try {
    const db = getDb();
    const layersDir = path.join(app.getPath('userData'), 'data', 'map_layers');

    if (!fs.existsSync(layersDir)) {
      fs.mkdirSync(layersDir, { recursive: true });
    }

    // 🛡️ KATMANLARI GETİR
    ipcMain.removeHandler('get-map-layers');
    ipcMain.handle('get-map-layers', async () => {
      try {
        const layers = db.prepare('SELECT * FROM MAP_Katmanlar').all();
        const layersWithData = layers.map((layer: any) => {
          // 1. Önce Veritabanındaki JSON içeriğine bak
          if (layer.Icerik_JSON) {
            try {
              // Eğer string ise objeye çevir, değilse olduğu gibi ver
              const content = typeof layer.Icerik_JSON === 'string' ? JSON.parse(layer.Icerik_JSON) : layer.Icerik_JSON;
              return { ...layer, data: content, content: layer.Icerik_JSON };
            } catch (e) {
              console.error(`[DB] JSON parse hatası (ID: ${layer.id}):`, e);
            }
          }

          // 2. Yoksa dosyadan okumayı dene (Fallback)
          const filePath = layer.Dosya_Yolu;
          if (filePath && fs.existsSync(filePath)) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              let data = null;
              try { data = JSON.parse(content); } catch (e) {}
              return { ...layer, data, content };
            } catch (e) {
              return { ...layer, content: null, error: 'File read error' };
            }
          }
          
          return { ...layer, content: null, error: 'No data or file found' };
        });
        return { success: true, data: layersWithData };
      } catch (err: any) {
        console.error('[IPC] get-map-layers error:', err.message);
        return { success: false, error: err.message };
      }
    });

    // 🛡️ KATMAN KAYDET
    ipcMain.removeHandler('save-map-layer');
    ipcMain.handle('save-map-layer', async (_, { name, type, content, color, tasinmazId }) => {
      try {
        const id = crypto.randomUUID();
        const fileName = `${id}.${type}`;
        const filePath = path.join(layersDir, fileName);
        fs.writeFileSync(filePath, content, 'utf8');
        db.prepare(`
          INSERT INTO MAP_Katmanlar (id, Ad, Dosya_Yolu, Tip, Renk, Gorunur, Tasinmaz_id)
          VALUES (?, ?, ?, ?, ?, 1, ?)
        `).run(id, name, filePath, type, color || '#3b82f6', tasinmazId || null);
        return { success: true, id };
      } catch (err: any) {
        console.error('[IPC] save-map-layer error:', err.message);
        return { success: false, error: err.message };
      }
    });

    // 🛡️ KATMAN SİL
    ipcMain.removeHandler('delete-map-layer');
    ipcMain.handle('delete-map-layer', async (_, id) => {
      try {
        const layer = db.prepare('SELECT Dosya_Yolu FROM MAP_Katmanlar WHERE id = ?').get(id) as any;
        if (layer && fs.existsSync(layer.Dosya_Yolu)) {
          fs.unlinkSync(layer.Dosya_Yolu);
        }
        db.prepare('DELETE FROM MAP_Katmanlar WHERE id = ?').run(id);
        return { success: true };
      } catch (err: any) {
        console.error('[IPC] delete-map-layer error:', err.message);
        return { success: false, error: err.message };
      }
    });

    // 🛡️ DOSYA SEÇİM DİYALOĞU VE İTHALAT
    ipcMain.removeHandler('import-map-layer-file-dialog');
    ipcMain.handle('import-map-layer-file-dialog', async (_, customId?: string) => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          title: customId === 'RESPONSIBILITY_BOUNDARY' ? 'Sorumluluk Sınırı KML Seçin' : 'Harita Katmanı İthal Et',
          filters: [
            { name: 'Coğrafi Veriler', extensions: ['kml', 'kmz', 'geojson', 'json', 'dxf'] }
          ],
          properties: ['openFile']
        });
 
        if (canceled || filePaths.length === 0) return { success: false };
 
        const sourcePath = filePaths[0];
        const isBoundary = customId === 'RESPONSIBILITY_BOUNDARY';
        const name = isBoundary ? 'KURUM SORUMLULUK SINIRI' : path.basename(sourcePath).toUpperCase();
        const id = customId || crypto.randomUUID();
        const extension = path.extname(sourcePath).toLowerCase();
        const fileName = `${id}${extension}`;
        const targetPath = path.join(layersDir, fileName);
        
        const kategori = isBoundary ? 'SINIR' : (customId ? 'PARSEL_EK' : 'GENEL');
        const tasinmazId = (!isBoundary && customId) ? customId : null;

        // 🛡️ Temizlik: Eğer özel bir ID ise ve zaten varsa dosyasını ve kaydını temizle
        if (customId) {
          const existing = db.prepare('SELECT Dosya_Yolu FROM MAP_Katmanlar WHERE id = ?').get(id) as any;
          if (existing && fs.existsSync(existing.Dosya_Yolu)) {
             try { fs.unlinkSync(existing.Dosya_Yolu); } catch(e) {}
          }
          db.prepare('DELETE FROM MAP_Katmanlar WHERE id = ?').run(id);
        }

        fs.copyFileSync(sourcePath, targetPath);
        
        db.prepare(`
          INSERT INTO MAP_Katmanlar (id, Ad, Dosya_Yolu, Tip, Renk, Gorunur, Tasinmaz_id, Kategori)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?)
        `).run(
          id, 
          name, 
          targetPath, 
          extension.replace('.', ''), 
          isBoundary ? '#10b981' : '#3b82f6', 
          tasinmazId,
          kategori
        );
        
        return { success: true, id, sourcePath };
      } catch (err: any) {
        console.error('[IPC] import-map-layer-file-dialog error:', err.message);
        return { success: false, error: err.message };
      }
    });

    // 🛡️ PARSEL VERİLERİNİ GETİR (BİRLEŞİK YAPI)
    ipcMain.removeHandler('get-parsel-data');
    ipcMain.handle('get-parsel-data', async () => {
      try {
        const records = db.prepare('SELECT * FROM MAP_Mevki_Listesi').all();
        const data = records.map((r: any) => {
          let content = r.GeoJSON || null;
          if (r.Dosya_Yolu && fs.existsSync(r.Dosya_Yolu)) {
            content = fs.readFileSync(r.Dosya_Yolu, 'utf8');
          }
          return { ...r, content };
        });
        return { success: true, data };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });

    // 🛡️ PARSEL VERİSİ KAYDET (KOORDİNAT VEYA DOSYA)
    ipcMain.removeHandler('save-parsel-data');
    ipcMain.handle('save-parsel-data', async (_, { tasinmazId, lat, lng, sourcePath, metadata }) => {
      try {
        const id = crypto.randomUUID();
        let targetPath = null;

        if (sourcePath && fs.existsSync(sourcePath)) {
          const extension = path.extname(sourcePath).toLowerCase();
          const fileName = `geom_${tasinmazId}_${id}${extension}`;
          targetPath = path.join(layersDir, fileName);
          fs.copyFileSync(sourcePath, targetPath);
        }

        // Mevcut kaydı bul veya yeni oluştur
        const existing = db.prepare('SELECT id, Dosya_Yolu FROM MAP_Mevki_Listesi WHERE Tasinmaz_id = ?').get(tasinmazId) as any;
        
        if (existing) {
          // Eskisini güncelle
          if (targetPath && existing.Dosya_Yolu && fs.existsSync(existing.Dosya_Yolu)) {
             fs.unlinkSync(existing.Dosya_Yolu);
          }

          db.prepare(`
            UPDATE MAP_Mevki_Listesi 
            SET Lat = COALESCE(?, Lat), 
                Lng = COALESCE(?, Lng), 
                Dosya_Yolu = COALESCE(?, Dosya_Yolu),
                Metadata_JSON = COALESCE(?, Metadata_JSON)
            WHERE Tasinmaz_id = ?
          `).run(lat || null, lng || null, targetPath || null, metadata || null, tasinmazId);
        } else {
          // Yeni ekle
          db.prepare(`
            INSERT INTO MAP_Mevki_Listesi (id, Tasinmaz_id, Lat, Lng, Dosya_Yolu, Metadata_JSON)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, tasinmazId, lat || null, lng || null, targetPath || null, metadata || null);
        }

        return { success: true };
      } catch (err: any) {
        console.error('[IPC] save-parsel-data error:', err.message);
        return { success: false, error: err.message };
      }
    });

    // 🛡️ ESKİ HANDLERLARI YÖNLENDİR (Geriye Dönük Uyumluluk)
    ipcMain.removeHandler('get-map-points');
    ipcMain.handle('get-map-points', async () => {
       const res = await db.prepare('SELECT * FROM MAP_Mevki_Listesi WHERE Lat IS NOT NULL').all();
       return { success: true, data: res };
    });

    ipcMain.removeHandler('get-tasinmaz-geometries');
    ipcMain.handle('get-tasinmaz-geometries', async () => {
       const records = db.prepare('SELECT * FROM MAP_Mevki_Listesi WHERE Dosya_Yolu IS NOT NULL').all();
       const data = records.map((r: any) => {
          if (fs.existsSync(r.Dosya_Yolu)) {
            const content = fs.readFileSync(r.Dosya_Yolu, 'utf8');
            const extension = path.extname(r.Dosya_Yolu).replace('.', '');
            return { ...r, content, Tip: extension };
          }
          return null;
       }).filter(Boolean);
       return { success: true, data };
    });

    // 🛡️ ALTYAPI VE DEPO VERİLERİNİ GETİR (Unified Infrastructure)
    ipcMain.removeHandler('get-map-infrastructure');
    ipcMain.handle('get-map-infrastructure', async () => {
      try {
        const depolar = db.prepare('SELECT * FROM MAP_Depolar').all();
        const altyapi = db.prepare('SELECT * FROM MAP_Altyapi').all();
        
        const process = (items: any[]) => items.map((item: any) => {
          let content = null;
          if (item.Dosya_Yolu && fs.existsSync(item.Dosya_Yolu)) {
            content = fs.readFileSync(item.Dosya_Yolu, 'utf8');
          }
          return { ...item, content };
        });

        return { 
          success: true, 
          depolar: process(depolar), 
          altyapi: process(altyapi) 
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });

    // 🛡️ ALTYAPI VEYA DEPO VERİSİ KAYDET
    ipcMain.removeHandler('save-map-infrastructure');
    ipcMain.handle('save-map-infrastructure', async (_, { table, data, sourcePath }) => {
      try {
        const id = crypto.randomUUID();
        let targetPath = null;

        if (sourcePath && fs.existsSync(sourcePath)) {
          const extension = path.extname(sourcePath).toLowerCase();
          const fileName = `infra_${id}${extension}`;
          targetPath = path.join(layersDir, fileName);
          fs.copyFileSync(sourcePath, targetPath);
        }

        if (table === 'MAP_Depolar') {
          db.prepare(`
            INSERT OR REPLACE INTO MAP_Depolar (id, Depo_id, Lat, Lng, Dosya_Yolu, Metadata_JSON)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, data.Depo_id, data.Lat || null, data.Lng || null, targetPath || data.Dosya_Yolu, data.Metadata_JSON || null);
        } else if (table === 'MAP_Altyapi') {
          db.prepare(`
            INSERT INTO MAP_Altyapi (id, Ad, Tip, Dosya_Yolu, Renk, Metadata_JSON)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, data.Ad, data.Tip, targetPath || data.Dosya_Yolu, data.Renk || '#3b82f6', data.Metadata_JSON || null);
        }

        return { success: true, id };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });

    // 🛡️ TKGM OTOMATİK KAYIT MOTORU
    ipcMain.removeHandler('auto-register-tkgm-parcel');
    ipcMain.handle('auto-register-tkgm-parcel', async (_, geojson) => {
      try {
        const tkgmService = new TkgmService(db);
        const p = geojson.properties;
        const ada = p.adaNo;
        const parsel = p.parselNo;
        const rawMahalleAd = p.mahalleAd; // örn: "Orta/Kurum"
        const cleanMahalleAd = (rawMahalleAd || "").split('/')[0].trim(); // örn: "Orta"
        const mahalleKod = String(p.mahalleId || "");
        const mevkiAd = p.mevkii;
        
        return db.transaction(() => {
          // 1. Akıllı Mahalle Tespiti (Resmi TGKM_Kod veya İsimle)
          let konumId = null;
          let konum = null;
          
          if (mahalleKod) {
            konum = db.prepare('SELECT id FROM TANIM_Konumlar WHERE TGKM_Kod = ? OR Kod = ?').get(mahalleKod, mahalleKod) as any;
          }
          
          if (!konum && cleanMahalleAd) {
            // İsimle ara (LIKE kullanarak daha esnek eşleşme)
            konum = db.prepare('SELECT id FROM TANIM_Konumlar WHERE TR_UPPER(Ad) LIKE TR_UPPER(?)').get(`%${cleanMahalleAd}%`) as any;
          }

          if (konum) {
            konumId = konum.id;
          } else {
            const parent = db.prepare("SELECT id FROM TANIM_Konumlar WHERE Ad LIKE '%KURUM%' AND Tip = 'BELDE'").get() as any;
            konumId = crypto.randomUUID();
            db.prepare('INSERT INTO TANIM_Konumlar (id, Parent_id, Tip, Ad, TGKM_Kod) VALUES (?, ?, ?, ?, ?)')
              .run(konumId, parent?.id || null, 'MAHALLE', rawMahalleAd, mahalleKod);
          }

          // 2. Mevki Tespiti
          let mevkiId = null;
          if (mevkiAd) {
             const mevki = db.prepare('SELECT id FROM DATA_Tasinmaz_Mevkileri WHERE TR_UPPER(Mevki_Adi) = TR_UPPER(?) AND Konum_id = ?').get(mevkiAd, konumId) as any;
             if (mevki) {
               mevkiId = mevki.id;
             } else {
               mevkiId = crypto.randomUUID();
               db.prepare('INSERT INTO DATA_Tasinmaz_Mevkileri (id, Mevki_Adi, Konum_id) VALUES (?, ?, ?)')
                 .run(mevkiId, mevkiAd, konumId);
             }
          }

          // 3. Tapu Tespiti veya Güncelleme (Fiziksel Sicil)
          let tapuId = null;
          // Tapuyu Ada/Parsel/Mevki üzerinden bul
          const existingTapu = db.prepare(`
            SELECT id FROM DATA_Tapu_Verisi 
            WHERE Ada = ? AND Parsel = ? AND Mevki_id = ?
          `).get(ada, parsel, mevkiId) as any;
          
          const alan = parseFloat((p.alan || "0").replace(/\./g, '').replace(',', '.'));
          
          if (existingTapu) {
            tapuId = existingTapu.id;
            db.prepare(`
              UPDATE DATA_Tapu_Verisi 
              SET Alan_m2 = ?, Nitelik = ?
              WHERE id = ?
            `).run(alan, p.nitelik, tapuId);
          } else {
            tapuId = crypto.randomUUID();
            db.prepare(`
              INSERT INTO DATA_Tapu_Verisi (id, Ada, Parsel, Mevki_id, Alan_m2, Nitelik)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(tapuId, ada, parsel, mevkiId, alan, p.nitelik);
          }

          // 4. Geometriyi mühürle (Tüm teknik detaylar GeoJSON içindedir)
          const mapId = crypto.randomUUID();
          db.prepare('DELETE FROM MAP_Mevki_Listesi WHERE Tasinmaz_id = ?').run(tapuId);
          db.prepare(`
            INSERT INTO MAP_Mevki_Listesi (id, Tasinmaz_id, Mevki_id, GeoJSON, Metadata_JSON)
            VALUES (?, ?, ?, ?, ?)
          `).run(mapId, tapuId, mevkiId, JSON.stringify(geojson), JSON.stringify({ 
            source: 'tkgm_auto_discovery', 
            discovered_at: new Date().toISOString()
          }));

          // 5. Arka planda PDF'i indir (Service üzerinden Nizami Referer ile)
          if (mahalleKod && tapuId) {
             tkgmService.downloadParcelPdf(mahalleKod, ada, parsel, tapuId).catch(e => console.error("[TKGM_AUTO_PDF] Error:", e.message));
          }

          return { success: true, tapuId };
        })();
      } catch (err: any) {
        console.error('[IPC] auto-register-tkgm-parcel error:', err.message);
        return { success: false, error: err.message };
      }
    });

    console.log('[MAIN] Map Layer Handlers Unified & Registered Successfully.');
  } catch (err: any) {
    console.error('[MAIN] Map Layer Handlers Registration FAILED:', err.message);
  }
}

