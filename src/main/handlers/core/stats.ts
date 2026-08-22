import { ipcMain } from 'electron'
import { getDb } from '../../db'
import path from 'path'
import fs from 'fs'
import { SYSTEM_CONFIG } from '../../config/systemConfig';

export const setupStatsHandlers = () => {
  ipcMain.handle('get-stats', async () => {
    try {
      const db = getDb();
      if (!db) return { success: false, error: "Veritabanı hazır değil." };

      const safeGetCount = (sql: string, params: any[] = []) => {
        try { 
          const result = db.prepare(sql).get(...params).count || 0;
          return result;
        } catch(e: any) { 
          return 0; 
        }
      };
      const safeGetSum = (sql: string, params: any[] = []) => {
        try { 
          const result = db.prepare(sql).get(...params).sum || 0;
          return result;
        } catch(e: any) { 
          return 0; 
        }
      };

      const vatandas = safeGetCount('SELECT COUNT(*) as count FROM DATA_Vatandas');
      const tapu = safeGetCount('SELECT COUNT(*) as count FROM DATA_Tapu_Verisi');
      const area = safeGetSum('SELECT SUM(Alan_m2) as sum FROM DATA_Tapu_Verisi');
      const missingTckn = safeGetCount('SELECT COUNT(*) as count FROM DATA_Vatandas WHERE TCKN IS NULL OR TCKN = ""');
      
      let totalUsageMinutes = 0;
      try {
        const sum = db.prepare(`SELECT SUM(Kullanim_Saati * 60) as sum FROM DATA_Dagitim_Kayitlar WHERE (deleted_at IS NULL OR deleted_at = '')`).get().sum || 0;
        totalUsageMinutes = sum;
      } catch (e) {
        console.error("[STATS_CENTRAL_USAGE_ERROR]", e);
      }

      let totalTahakkuk = 0;
      let monthlyTahakkuk = 0;
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear().toString();

      try {
        // Global Tahakkuk
        totalTahakkuk = db.prepare(`SELECT SUM(COALESCE(Toplam_Tutar, 0)) as sum FROM DATA_Dagitim_Kayitlar WHERE (deleted_at IS NULL OR deleted_at = '')`).get().sum || 0;

        // Aylık Tahakkuk (Trend için)
        monthlyTahakkuk = db.prepare(`
          SELECT SUM(COALESCE(Toplam_Tutar, 0)) as sum 
          FROM DATA_Dagitim_Kayitlar 
          WHERE (deleted_at IS NULL OR deleted_at = '') 
          AND (Tarih LIKE ? OR Tarih LIKE ? OR Tarih LIKE ?)
        `).get(`${currentYear}-${currentMonth}%`, `${currentYear}/${currentMonth}%`, `%.${currentMonth}.${currentYear}%`).sum || 0;
        
        // Manuel Tahakkuklar
        const manualGlobal = db.prepare(`SELECT SUM(Miktar) as sum FROM MUHASEBE_Tahakkuk WHERE (deleted_at IS NULL OR deleted_at = '') AND (Fis_id IS NULL OR Fis_id = '')`).get().sum || 0;
        totalTahakkuk += manualGlobal;
      } catch (e) {
        console.error("[STATS_TAHAKKUK_ERROR]", e);
      }

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const turkeyDate = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('.').reverse().join('-'); // YYYY-MM-DD
      
      // 🛡️ GÜNLÜK METRİKLER (Sarsılmaz Gerçek Zamanlı Takip)
      let dailyTahakkuk = 0;
      let dailyTahsilat = 0;
      let dailyDistributionCount = 0;
      let dailyBreakdown: any[] = [];

      try {
        // Günlük Tahakkuk (Sulama)
        const dSu = db.prepare(`
          SELECT SUM(COALESCE(Toplam_Tutar, 0)) as sum 
          FROM DATA_Dagitim_Kayitlar 
          WHERE (deleted_at IS NULL OR deleted_at = '') 
          AND (date(Tarih) = date('now', 'localtime') OR Tarih LIKE ? OR Tarih LIKE ?)
        `).get(`${todayStr}%`, `${turkeyDate}%`).sum || 0;

        // Günlük Tahakkuk (Manuel)
        const dMan = db.prepare(`
          SELECT SUM(Miktar) as sum 
          FROM MUHASEBE_Tahakkuk 
          WHERE (deleted_at IS NULL OR deleted_at = '') 
          AND (Fis_id IS NULL OR Fis_id = '') 
          AND (date(Tarih) = date('now', 'localtime') OR Tarih LIKE ? OR Tarih LIKE ?)
        `).get(`${todayStr}%`, `${turkeyDate}%`).sum || 0;
        
        dailyTahakkuk = dSu + dMan;

        // Günlük Tahsilat
        dailyTahsilat = db.prepare(`
          SELECT SUM(Miktar) as sum 
          FROM MUHASEBE_Tahsilat 
          WHERE (deleted_at IS NULL OR deleted_at = '') 
          AND (date(Tarih) = date('now', 'localtime') OR Tarih LIKE ? OR Tarih LIKE ?)
        `).get(`${todayStr}%`, `${turkeyDate}%`).sum || 0;

        // Günlük Dağıtım Sayısı
        dailyDistributionCount = db.prepare(`
          SELECT COUNT(*) as count 
          FROM DATA_Dagitim_Kayitlar 
          WHERE (deleted_at IS NULL OR deleted_at = '') 
          AND (date(Tarih) = date('now', 'localtime') OR Tarih LIKE ? OR Tarih LIKE ?)
        `).get(`${todayStr}%`, `${turkeyDate}%`).count || 0;

        // 🛡️ BÖLGE BAZLI DAĞILIM (Sarsılmaz Detay)
        dailyBreakdown = db.prepare(`
          SELECT loc.Ad as Mahalle_Adi, COUNT(*) as count 
          FROM DATA_Dagitim_Kayitlar k
          JOIN DATA_Dagitim_Donemleri d ON k.Donem_id = d.id
          JOIN DATA_Dagitim_Bolgeleri b ON d.Bolge_id = b.id
          JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
          WHERE (k.deleted_at IS NULL OR k.deleted_at = '') 
          AND (date(k.Tarih) = date('now', 'localtime') OR k.Tarih LIKE ? OR k.Tarih LIKE ?)
          GROUP BY loc.Ad
        `).all(`${todayStr}%`, `${turkeyDate}%`) as any[];
      } catch (e) {
        console.error("[STATS_DAILY_ERROR]", e);
      }

      const totalTahsilat = safeGetSum(`SELECT SUM(Miktar) as sum FROM MUHASEBE_Tahsilat WHERE (deleted_at IS NULL OR deleted_at = '')`);
      const monthlyTahsilat = safeGetSum(`
        SELECT SUM(Miktar) as sum 
        FROM MUHASEBE_Tahsilat 
        WHERE (deleted_at IS NULL OR deleted_at = '') 
        AND (strftime('%m', Tarih) = ? AND strftime('%Y', Tarih) = ?)
      `, [currentMonth, currentYear]);

      const mevkiler = safeGetCount("SELECT COUNT(*) as count FROM DATA_Tasinmaz_Mevkileri");
      const mahalleler = safeGetCount("SELECT COUNT(*) as count FROM DATA_Dagitim_Bolgeleri");

      const meravCount = safeGetCount(`
        SELECT COUNT(*) as count 
        FROM TANIM_Meravlar
        WHERE Aktif = 1
      `);

      // Trend Hesaplama (Tahsilat Performansı için sembolik ama dinamik)
      const prevMonth = new Date().getMonth(); // 0-indexed, so current is getMonth()+1, prev is getMonth()
      const trendValue = monthlyTahakkuk > 0 ? ((monthlyTahsilat / monthlyTahakkuk) * 5).toFixed(1) : "0.0";

      return { 
        success: true, 
        stats: { 
          vatandasCount: vatandas, 
          tapuCount: tapu, 
          totalArea: area,
          yaylaCount: safeGetCount("SELECT COUNT(*) as count FROM DATA_Dagitim_Donemleri"), 
          usageHours: Math.round(totalUsageMinutes / 60),
          totalSuHakki: safeGetSum("SELECT SUM(Su_Hakki_Dakika) as sum FROM DATA_Tapu_Verisi"), 
          overUsageCount: 0,
          totalDebt: totalTahakkuk, 
          totalPaid: totalTahsilat,
          dailyTahakkuk,
          dailyTahsilat,
          dailyDistributionCount,
          dailyBreakdown,
          mevkiCount: mevkiler,
          mahalleCount: mahalleler,
          meravCount: meravCount,
          missingTcknCount: missingTckn,
          trend: `+${trendValue}%`
        } 
      };
    } catch(e: any) { 
      return { success: false, error: e.message }; 
    }
  });

  ipcMain.handle('get-loc-stats', async () => {
    try {
      const db = getDb();
      if (!db) return {};
      
      // 🛡️ Sarsılmaz Bölgesel Metrik Motoru
      // Mahalle bazlı; Vatandaş, Tapu ve Sezonluk Defter sayılarını tek seferde hesaplar.
      const stats = db.prepare(`
        SELECT 
          b.Mahalle_id as id,
          (SELECT COUNT(DISTINCT s.Vatandas_Id) 
           FROM REL_TASINMAZ_VATANDAS s 
           JOIN DATA_Tapu_Verisi t ON s.Tasinmaz_id = t.id 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id
           AND (t.deleted_at IS NULL OR t.deleted_at = '')
           AND (s.deleted_at IS NULL OR s.deleted_at = '')) as vatandasCount,
          (SELECT COUNT(DISTINCT t.Ada) FROM DATA_Tapu_Verisi t 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id 
           AND (t.deleted_at IS NULL OR t.deleted_at = '')) as adaCount,
          (SELECT COUNT(DISTINCT t.Parsel) FROM DATA_Tapu_Verisi t 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id 
           AND (t.deleted_at IS NULL OR t.deleted_at = '')) as parselCount,
          (SELECT COUNT(*) FROM DATA_Tapu_Verisi t 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id 
           AND (t.deleted_at IS NULL OR t.deleted_at = '')) as tapuCount,
          (SELECT COUNT(*) FROM DATA_Dagitim_Donemleri d 
           WHERE d.Bolge_id = b.id 
           AND (d.deleted_at IS NULL OR d.deleted_at = '')) as ledgerCount,
          (SELECT SUM(t.Alan_m2) FROM DATA_Tapu_Verisi t 
           JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
           WHERE m.Konum_id = b.Mahalle_id 
           AND (t.deleted_at IS NULL OR t.deleted_at = '')) as totalArea
        FROM DATA_Dagitim_Bolgeleri b
        WHERE (b.deleted_at IS NULL OR b.deleted_at = '')
      `).all() as any[];

      const statsMap: Record<string, any> = {};
      stats.forEach(s => {
        statsMap[s.id] = {
          vatandasCount: Number(s.vatandasCount) || 0,
          adaCount: Number(s.adaCount) || 0,
          parselCount: Number(s.parselCount) || 0,
          tapuCount: Number(s.tapuCount) || 0,
          ledgerCount: Number(s.ledgerCount) || 0,
          totalArea: Number(s.totalArea) || 0
        };
      });

      return statsMap;
    } catch(e) { 
      console.error("[GET_LOC_STATS_ERROR]", e);
      return {}; 
    }
  });

  ipcMain.handle('get-mevki-stats', async () => {
    try {
      const db = getDb();
      if (!db) return {};

      // 🛡️ Sarsılmaz Mevki Metrik Motoru
      // Mevki bazlı; Tapu sayısı, Eşsiz Vatandaş sayısı ve Toplam Alanı hesaplar.
      const stats = db.prepare(`
        SELECT 
          m.id,
          (SELECT COUNT(*) FROM DATA_Tapu_Verisi t WHERE t.Mevki_id = m.id AND (t.deleted_at IS NULL OR t.deleted_at = '')) as tapuCount,
          (SELECT COUNT(DISTINCT s.Vatandas_Id) FROM REL_TASINMAZ_VATANDAS s JOIN DATA_Tapu_Verisi t ON s.Tasinmaz_id = t.id WHERE t.Mevki_id = m.id AND (t.deleted_at IS NULL OR t.deleted_at = '')) as citizenCount,
          (SELECT SUM(t.Alan_m2) FROM DATA_Tapu_Verisi t WHERE t.Mevki_id = m.id AND (t.deleted_at IS NULL OR t.deleted_at = '')) as totalArea
        FROM DATA_Tasinmaz_Mevkileri m
        WHERE (m.deleted_at IS NULL OR m.deleted_at = '')
      `).all() as any[];

      const statsMap: Record<string, any> = {};
      stats.forEach(s => {
        statsMap[s.id] = {
          tapuCount: Number(s.tapuCount) || 0,
          citizenCount: Number(s.citizenCount) || 0,
          totalArea: Number(s.totalArea) || 0
        };
      });

      return statsMap;
    } catch (e) {
      console.error("[GET_MEVKI_STATS_ERROR]", e);
      return {};
    }
  });

  ipcMain.handle('get-code-stats', async () => {
    try {
      const srcPath = path.join(process.cwd(), 'src');
      let totalLines = 0;
      let fileCount = 0;

      const scanDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !fullPath.includes('node_modules')) scanDir(fullPath);
          else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            fileCount++;
            const content = fs.readFileSync(fullPath, 'utf8');
            totalLines += content.split('\n').length;
          }
        }
      };

      if (fs.existsSync(srcPath)) scanDir(srcPath);
      
      return { success: true, totalLines, fileCount };
    } catch(e) { return { success: false, totalLines: 0, fileCount: 0 }; }
  });

  ipcMain.handle('get-recent-activity', async () => {
    try {
      const db = getDb();
      if (!db) return { success: false, data: [] };

      const activities: any[] = [];

      // 1. Son Tahsilatlar (Payments)
      try {
        const payments = db.prepare(`
          SELECT 
            'Ödeme' as type, 
            'WalletMinimal' as icon,
            '₺' || Miktar || ' Tahsilat Yapıldı' as title, 
            COALESCE(v.Ad || ' ' || v.Soyad, 'GİŞE TAHSİLATI') || COALESCE(' (SİCİL: ' || v.Sicil_No || ')', '') as subtitle, 
            t.Tarih as date 
          FROM MUHASEBE_Tahsilat t
          LEFT JOIN DATA_Vatandas v ON (t.Vatandas_Id = v.id OR t.Vatandas_Id = v.TCKN)
          WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
          ORDER BY t.created_at DESC LIMIT 5
        `).all() as any[];
        activities.push(...payments);
      } catch (e) { console.error("RECENT_PAYMENTS_ERROR", e); }

      // 2. Son Vatandaş Kayıtları (Citizens)
      try {
        const citizens = db.prepare(`
          SELECT 
            'Kayıt' as type, 
            'UserPlus' as icon,
            Ad || ' ' || Soyad || ' Kaydedildi' as title, 
            'Vatandaş Sicil Kaydı' as subtitle, 
            created_at as date 
          FROM DATA_Vatandas 
          WHERE (deleted_at IS NULL OR deleted_at = '')
          ORDER BY created_at DESC LIMIT 5
        `).all() as any[];
        activities.push(...citizens);
      } catch (e) { console.error("RECENT_CITIZENS_ERROR", e); }

      // 3. Son Tapu Kayıtları (Properties)
      try {
        const tapus = db.prepare(`
          SELECT 
            'Mülkiyet' as type, 
            'BookOpen' as icon,
            Ada || '/' || Parsel || ' Tapu Kaydı' as title, 
            COALESCE((SELECT Mevki_Adi FROM DATA_Tasinmaz_Mevkileri WHERE id = Mevki_id), 'BELİRSİZ MEVKİ') as subtitle, 
            created_at as date 
          FROM DATA_Tapu_Verisi
          WHERE (deleted_at IS NULL OR deleted_at = '')
          ORDER BY created_at DESC LIMIT 5
        `).all() as any[];
        activities.push(...tapus);
      } catch (e) { console.error("RECENT_TAPU_ERROR", e); }

      // 4. Son Sulama Kayıtları (Distribution)
      try {
        const dists = db.prepare(`
          SELECT 
            'Sulama' as type, 
            'Droplets' as icon,
            '₺' || t.Toplam_Tutar || ' Sulama Tahakkuku' as title, 
            COALESCE(v.Ad || ' ' || v.Soyad, 'GENEL MÜKELLEF') || 
            COALESCE(' (SİCİL: ' || v.Sicil_No || ')', '') || 
            COALESCE(' | ' || d.Donem_Adi, '') as subtitle, 
            t.Tarih as date 
          FROM DATA_Dagitim_Kayitlar t
          LEFT JOIN DATA_Vatandas v ON (t.Vatandas_Id = v.id OR t.Vatandas_Id = v.TCKN)
          LEFT JOIN DATA_Dagitim_Donemleri d ON t.Donem_id = d.id
          WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
          ORDER BY t.created_at DESC LIMIT 5
        `).all() as any[];
        activities.push(...dists);
      } catch (e) { console.error("RECENT_DIST_ERROR", e); }

      // 5. Genel Tahakkuklar (Accruals)
      try {
        const accruals = db.prepare(`
          SELECT 
            'Borç' as type, 
            'AlertCircle' as icon,
            '₺' || Miktar || ' Genel Tahakkuk' as title, 
            COALESCE(v.Ad || ' ' || v.Soyad, 'SİSTEM KAYDI') || COALESCE(' (SİCİL: ' || v.Sicil_No || ')', '') as subtitle, 
            t.Tarih as date 
          FROM MUHASEBE_Tahakkuk t
          LEFT JOIN DATA_Vatandas v ON (t.Vatandas_Id = v.id OR t.Vatandas_Id = v.TCKN)
          WHERE (t.deleted_at IS NULL OR t.deleted_at = '') AND (t.Fis_id IS NULL OR t.Fis_id = '')
          ORDER BY t.created_at DESC LIMIT 5
        `).all() as any[];
        activities.push(...accruals);
      } catch (e) { console.error("RECENT_ACCRUAL_ERROR", e); }

      // Tarihe göre sırala
      activities.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

      return { success: true, data: activities.slice(0, 15) };
    } catch(e: any) { 
      return { success: false, data: [], error: e.message }; 
    }
  });

  ipcMain.handle('get-personnel', async () => {
    try {
      const db = getDb();
      if (!db) return { success: false, data: [] };
      const data = db.prepare(`
        SELECT 
          p.*, 
          (v.Ad || ' ' || v.Soyad) as Ad_Soyad,
          v.Telefon as Telefon
        FROM TANIM_Personel p
        LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
        WHERE p.Aktif = 1
      `).all();
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-system-performance', async () => {
    try {
      const memory = process.memoryUsage();
      const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
      const os = await import('os');
      const load = os.loadavg();
      
      return { 
        success: true, 
        memory: `${heapUsedMB} MB`, 
        cpu: `%${Math.round((load[0] || 0) * 10)}`
      };
    } catch (e) {
      return { success: false, memory: '---', cpu: '---' };
    }
  });

  // KULLANICI PROFİLİ (Sarsılmaz Dinamik Yapı)
  ipcMain.handle('get-profile', async () => {
    try {
      const db = getDb();
      
      // Varsayılan yedek profil
      const profile = { ...SYSTEM_CONFIG.DEFAULT_PROFILE };

      if (db) {
        // Sarsılmaz Nizam: Önce aktif kullanıcıyı bul ve kütükle birleştir
        const user = db.prepare(`
          SELECT 
            p.*, 
            (v.Ad || ' ' || v.Soyad) as Gercek_Ad_Soyad
          FROM TANIM_Personel p
          LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
          WHERE p.Aktif = 1 
          LIMIT 1
        `).get() as any;
        
        if (user) {
          profile.id = user.id;
          profile.name = user.Gercek_Ad_Soyad || 'İSİMSİZ YETKİLİ';
          profile.title = user.Unvan || profile.title;
          profile.email = user.Eposta || profile.email;
          profile.phone = user.Telefon || profile.phone;
          profile.citizenId = user.Vatandas_Id || profile.citizenId;

          // Şimdi ID üzerinden vatandaş kütüğüne gidip o mühürlü resmi alalım
          if (profile.citizenId) {
            const citizen = db.prepare("SELECT Profil_Foto_Yolu FROM DATA_Vatandas WHERE id = ?").get(profile.citizenId) as any;
            if (citizen && citizen.Profil_Foto_Yolu) {
              profile.image = citizen.Profil_Foto_Yolu; // İşte burası!
            }
          }
        }
      }

      return { success: true, data: profile };
    } catch (err: any) {
      console.error('[STATS_PROFILE_ERROR]', err);
      return { success: false, error: err.message };
    }
  });
}
