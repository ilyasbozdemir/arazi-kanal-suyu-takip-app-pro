import { app, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'
import * as crypto from 'node:crypto'

const isDev = !app.isPackaged;

function getResourcePath(fileName: string) {
  if (isDev) {
    return path.join(process.cwd(), fileName);
  }
  // En sağlam resources yolu tespiti
  const path1 = path.join(process.resourcesPath, fileName);
  const path2 = path.join(path.dirname(app.getPath('exe')), 'resources', fileName);
  return fs.existsSync(path1) ? path1 : path2;
}

import { schema } from './database';
import { syncSchema } from './db-helpers/schemaSync';
import { seedGenesis } from './db-helpers/genesisSeed';
import { runMigrations } from './db-helpers/migrations';
import { runAutoRepair } from './db-helpers/autoRepair';const CONFIG_PATH = path.join(app.getPath('userData'), 'db_config.json');

const getSafeDbPath = () => {
  const dbName = `${schema.database}.db`;
  
  // 🛡️ GELİŞTİRME MODU ÖNCELİĞİ: Proje kökündeki /data/ klasörünü kullan
  if (isDev) {
    const devPath = path.join(process.cwd(), 'data', dbName);
    return devPath;
  }

  const CUSTOM_ROOT = 'D:/KurumData';

  // 🛡️ PRODUCTION: D: Sürücüsü (Kullanıcının isteği)
  if (fs.existsSync('D:/')) {
    const customPath = path.join(CUSTOM_ROOT, 'data', dbName);
    return customPath;
  }

  // 1. Kayıtlı konumu kontrol et
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (config.dbPath && fs.existsSync(path.dirname(config.dbPath))) {
        return config.dbPath;
      }
    } catch (e) { }
  }

  return path.join(app.getPath('userData'), 'data', dbName);
};

let dbPath = getSafeDbPath();
const dbDir = dbPath ? path.dirname(dbPath) : path.join(app.getPath('userData'), 'data');

let _db: any = null;

function getDb() {
  if (!_db) initDb(dbDir);
  return _db;
}

function initDb(dir: string = dbDir) {
  // 🛡️ D Sürücüsü Varsa Klasörü Oluştur
  if (dir.startsWith('D:/') && !fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error('[DB] D: sürücüsüne yazılamadı, fallback yapılıyor...');
      dbPath = path.join(app.getPath('userData'), 'data', `${schema.database}.db`);
      dir = path.dirname(dbPath);
    }
  }

  // 🛡️ KULLANICI SEÇİMİ: Eğer dbPath hala belirlenemediyse (veya erişilemezse)
  if (!dbPath && !isDev) {
    const result = dialog.showOpenDialogSync({
      title: 'Veritabanı Dosyasının Saklanacağı Klasörü Seçin',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'db.enc'] }],
      properties: ['openDirectory', 'createDirectory', 'openFile'],
      message: 'Lütfen veritabanı dosyasının (KANAL_ARAZI_SUYU_TAKIPDB.db veya .db.enc) oluşturulacağı veya bulunduğu klasörü seçin.'
    });

    if (result && result.length > 0) {
      const selectedDir = result[0];
      dbPath = path.join(selectedDir, `${schema.database}.db`);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ dbPath }));
      dir = selectedDir; 
    } else {
      dbPath = path.join(app.getPath('userData'), 'data', `${schema.database}.db`);
      dir = path.dirname(dbPath);
    }
  } else if (!dbPath) {
    dbPath = path.join(dir, `${schema.database}.db`);
  }

  // 1. Klasör yoksa oluşturur
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 2. MİGRASYON: Eski sürümden kalan bir DB varsa yeni güvenli yere taşı
  if (!fs.existsSync(dbPath) && !isDev) {
    const oldPath = path.join(path.dirname(app.getPath('exe')), 'su_tahsilat.db');
    if (fs.existsSync(oldPath)) {
      try {
        fs.copyFileSync(oldPath, dbPath);
        console.log('[DB] MİGRASYON BAŞARILI: su_tahsilat.db ->', dbPath);
      } catch (err) {
        console.error('[DB] Migrasyon hatası:', err);
      }
    }
  }

  console.log('[DB] Initializing Database at:', dbPath);
  try {
    if (!_db) {
      _db = new Database(dbPath, {
        verbose: console.log,
        fileMustExist: false,
        timeout: 10000
      });
      console.log('[DB] Database Instance Created.');
    }

    // 🛡️ KURUM VERİ ZIRHI (UTF-8 ve Yerel Ayarlar)
    _db.pragma('encoding = "UTF-8"');
    _db.pragma('journal_mode = WAL');
    _db.pragma('synchronous = NORMAL');
    _db.pragma('busy_timeout = 10000');
    _db.pragma('cache_size = -2000'); // 2MB Cache

    // 🇹🇷 TÜRKÇE KARAKTER ADAPTÖRÜ (Normalization & Upper/Lower)
    // 🇹🇷 KIDEMLİ TÜRKÇE KARAKTER MOTORU (Senior Turkish Engine)
    const turkishLower = (str: any) => {
      if (!str) return '';
      return String(str)
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/Ş/g, 'ş')
        .replace(/Ğ/g, 'ğ')
        .replace(/Ü/g, 'ü')
        .replace(/Ö/g, 'ö')
        .replace(/Ç/g, 'ç')
        .toLocaleLowerCase('tr-TR');
    };

    const turkishUpper = (str: any) => {
      if (!str) return '';
      return String(str)
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'İ')
        .replace(/I/g, 'İ')
        .replace(/ş/g, 'Ş')
        .replace(/ğ/g, 'Ğ')
        .replace(/ü/g, 'Ü')
        .replace(/ö/g, 'Ö')
        .replace(/ç/g, 'Ç')
        .toLocaleUpperCase('tr-TR');
    };



    _db.function('turkish_lower', turkishLower);
    _db.function('turkish_upper', turkishUpper);
    _db.function('TR_UPPER', turkishUpper);
    _db.function('TR_LOWER', turkishLower);

    const turkishSearch = (str: any) => {
      if (!str) return '';
      // 🛡️ ZIRHLI MAPPING: Harf harf zorunlu eşleme (Locale bağımsız)
      let res = String(str);
      res = res.replace(/[iİıI]/g, 'i'); // Tüm I varyantları noktalı küçük i olsun
      res = res.replace(/[şŞ]/g, 's');
      res = res.replace(/[ğĞ]/g, 'g');
      res = res.replace(/[üÜ]/g, 'u');
      res = res.replace(/[öÖ]/g, 'o');
      res = res.replace(/[çÇ]/g, 'c');
      return res.toLowerCase(); // Kalanları İngilizce küçült
    };
    _db.function('TR_SEARCH', turkishSearch);
    _db.function('TR_NORM', turkishSearch); 

    const turkishNorm = (str: any) => {
      if (!str) return '';
      return String(str)
        .replace(/İ/g, 'I').replace(/I/g, 'I')
        .replace(/Ş/g, 'S').replace(/Ğ/g, 'G')
        .replace(/Ü/g, 'U').replace(/Ö/g, 'O')
        .replace(/Ç/g, 'C')
        .toUpperCase();
    };
    _db.function('TR_NORM', turkishNorm);
    

    _db.function('REGEXP', (regex: string, text: any) => {
      try {
        const val = turkishLower(text);
        const pattern = turkishLower(regex);
        return new RegExp(pattern, 'i').test(val) ? 1 : 0;
      } catch (e) { return 0; }
    });

    // 1. Şema Senkronizasyonu
    syncSchema(_db, schema);
    
    // 2. Genesis (Varsayılan Kayıtlar)
    seedGenesis(_db);

    // 3. Veritabanı Migrasyonları
    runMigrations(_db);

    // 4. Otomatik Onarımlar (Auto-Repair)
    runAutoRepair(_db);
    console.log('[DB] Ready.');
  } catch (e: any) {
    console.error('[DB] CRITICAL Init Error:', e.message);

    // 🛡️ KRİTİK BİLDİRİM: Kullanıcıya hatanın nedenini göster (Production'da hayat kurtarır)
    if (!isDev) {
      dialog.showErrorBox(
        'Veritabanı Bağlantı Hatası',
        `Veritabanı başlatılamadı. Bu durum genellikle native modül (better-sqlite3) uyuşmazlığından veya yetki sorunlarından kaynaklanır.\n\nHata: ${e.message}\n\nYol: ${dbPath}`
      );
    }

    _db = null;
    throw e; // Hata fırlat ki çağıran yer bilsin
  }
}

// GÜVENLİ KAPANIŞ: Uygulama kapandığında kilidi serbest bırak.
function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
    console.log('[DB] Database Connection Closed Safely.');
  }
}

process.on('exit', () => closeDb());
process.on('SIGHUP', () => { process.exit(128 + 1); });
process.on('SIGINT', () => { process.exit(128 + 2); });
process.on('SIGTERM', () => { process.exit(128 + 15); });

export { schema, dbPath, getDb, initDb, closeDb };

