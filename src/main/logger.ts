import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import * as crypto from 'node:crypto';
import { getDb } from './db';

const isDev = !app.isPackaged;
const baseLogDir = isDev 
  ? path.join(process.cwd(), 'data', 'logs') 
  : path.join(path.dirname(app.getPath('exe')), 'data', 'logs');

if (!fs.existsSync(baseLogDir)) {
  fs.mkdirSync(baseLogDir, { recursive: true });
}

const logFilePath = path.join(baseLogDir, 'kurum_audit.log');

// 🛡️ UTC+3 (Türkiye) Zaman Damgası Üreticisi
const getTimestamp = () => {
  const now = new Date();
  // Türkiye sabit UTC+3 kullanır (Gün ışığından yararlanma yok)
  const turkeyTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return turkeyTime.toISOString().replace('Z', '') + '+03:00';
};

export const Logger = {
  log: (level: 'INFO' | 'WARN' | 'ERROR', action: string, details: string, user?: string) => {
    const timestamp = getTimestamp();
    const db = getDb();
    
    // 🛡️ Sarsılmaz Dinamik Kullanıcı Tespiti
    let activeUser = user || 'Sistem Yöneticisi';
    if (!user && db) {
      try {
        const personnel = db.prepare(`
          SELECT (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
          FROM TANIM_Personel p 
          JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id 
          WHERE p.Aktif = 1 LIMIT 1
        `).get() as any;
        if (personnel) activeUser = personnel.Ad_Soyad;
      } catch (e) { /* ignore */ }
    }

    const logEntry = `[${timestamp}] [${level}] [${action}] : ${details} (User: ${activeUser})\n`;
    
    // 1. Fiziksel Dosyaya Kaydet (Audit Trail)
    try {
      fs.appendFileSync(logFilePath, logEntry);
    } catch (e) {
      console.error('[LOGGER] Dosya yazma hatası:', e);
    }

    // 2. Veritabanına Kaydet (UI/Log Viewer için)
    try {
      if (db) {
        db.prepare('INSERT INTO SYSTEM_Logs (id, level, action, details, user, timestamp) VALUES (?, ?, ?, ?, ?, ?)')
          .run(crypto.randomUUID(), level, action, details, activeUser, timestamp);
      }
    } catch (e) { /* DB not ready */ }

    // 3. Konsola Yaz
    if (isDev) {
      const colorMap = { 'INFO': '\x1b[32m', 'WARN': '\x1b[33m', 'ERROR': '\x1b[31m' };
      console.log(`${colorMap[level] || ''}[${level}] ${action}\x1b[0m: ${details}`);
    }
  },

  analytics: (type: 'NAV' | 'ERROR' | 'WARN' | 'ACTION', screen: string, action: string, details: any = {}, user?: string) => {
    const timestamp = getTimestamp();
    const detailStr = typeof details === 'string' ? details : JSON.stringify(details);
    const db = getDb();

    // 🛡️ Sarsılmaz Dinamik Kullanıcı Tespiti
    let activeUser = user || 'Sistem Yöneticisi';
    if (!user && db) {
      try {
        const personnel = db.prepare(`
          SELECT (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
          FROM TANIM_Personel p 
          JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id 
          WHERE p.Aktif = 1 LIMIT 1
        `).get() as any;
        if (personnel) activeUser = personnel.Ad_Soyad;
      } catch (e) { /* ignore */ }
    }

    try {
      if (db) {
        db.prepare(`
          INSERT INTO SYSTEM_Analytics (id, type, screen, action, details, user, timestamp) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), type, screen, action, detailStr, activeUser, timestamp);
      }
    } catch (e) { /* DB not ready */ }

    if (isDev) {
      console.log(`\x1b[35m[ANALYTICS] [${type}] [${screen}]\x1b[0m ${action}`);
    }
  },

  info: (action: string, details: string, user?: string) => Logger.log('INFO', action, details, user),
  warn: (action: string, details: string, user?: string) => Logger.log('WARN', action, details, user),
  error: (action: string, details: string, user?: string) => Logger.log('ERROR', action, details, user),
  
  // ALIAS: addLog (Sistem uyumluluğu için)
  addLog: (level: any, action: string, details: string, user?: string) => {
    const lvl = String(level).toUpperCase() as 'INFO' | 'WARN' | 'ERROR';
    return Logger.log(lvl, action, details, user);
  },

  getLogPath: () => logFilePath
};

