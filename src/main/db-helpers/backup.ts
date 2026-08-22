import fs from 'fs';
import path from 'path';
import { dbPath } from '../db';
import { Logger } from '../logger';

/**
 * 🛡️ SARSILMAZ YEDEKLEME SİSTEMİ
 * Veritabanını .backups klasörüne tarih damgasıyla kopyalar.
 */
export const runAutoBackup = async () => {
  try {
    if (!dbPath || !fs.existsSync(dbPath)) {
      Logger.error('BACKUP', 'Yedekleme başarısız: Kaynak veritabanı bulunamadı.');
      return { success: false, error: 'Database not found' };
    }

    const dbDir = path.dirname(dbPath);
    const backupDir = path.join(dbDir, 'backups');

    // 1. Klasör yoksa oluştur
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 2. Dosya adını oluştur (YYYY-MM-DD_HH-mm-ss)
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
    const fileName = path.basename(dbPath, '.db');
    const backupFileName = `${fileName}_${timestamp}.db`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // 3. Kopyala
    fs.copyFileSync(dbPath, backupFilePath);

    // 4. Eski yedekleri temizle (Sadece son 10 yedeği tut)
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith(fileName) && f.endsWith('.db'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
      files.slice(10).forEach(f => {
        fs.unlinkSync(path.join(backupDir, f.name));
      });
    }

    Logger.info('BACKUP', `Yerel yedek başarıyla oluşturuldu: ${backupFileName}`);
    return { success: true, path: backupFilePath };
  } catch (err: any) {
    Logger.error('BACKUP_ERROR', err.message);
    return { success: false, error: err.message };
  }
};
