import { ipcMain, dialog, app, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { closeDb, dbPath } from '../../db';
import { Logger } from '../../logger';

const CONFIG_PATH = path.join(app.getPath('userData'), 'db_config.json');
const RECOMMENDED_D_BASE = 'D:/KURUM_GIS_VAULT_CORE';

export const registerSystemHandlers = () => {
  ipcMain.handle('check-d-drive', () => fs.existsSync('D:/'));

  ipcMain.handle('get-recommended-path', () => {
    if (fs.existsSync('D:/')) {
      return path.join(RECOMMENDED_D_BASE, app.getName());
    }
    return null;
  });

  ipcMain.handle('get-db-path', () => dbPath);

  ipcMain.handle('open-db-folder', async () => { 
    shell.openPath(path.dirname(dbPath)); 
    return { success: true }; 
  });

  ipcMain.handle('move-database', async (_, targetDirArg?: string) => {
    let targetDir = targetDirArg;
    if (!targetDir) {
      const result = dialog.showOpenDialogSync({
        title: 'Veritabanını Taşınacağı Klasörü Seçin',
        properties: ['openDirectory', 'createDirectory']
      });
      if (!result || result.length === 0) return { success: false, message: 'İptal edildi.' };
      targetDir = result[0];
    }
    const fileName = path.basename(dbPath);
    const targetPath = path.join(targetDir, fileName);
    if (dbPath === targetPath) return { success: false, message: 'Veritabanı zaten bu konumda.' };
    try {
      closeDb();
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        if (process.platform === 'win32' && targetDir.includes(RECOMMENDED_D_BASE)) {
           const { exec } = require('child_process');
           exec(`attrib +s +h "${targetDir}"`);
        }
      }
      fs.copyFileSync(dbPath, targetPath);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ dbPath: targetPath }));
      app.relaunch();
      app.exit(0);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: `Taşıma hatası: ${e.message}` };
    }
  });

  ipcMain.handle('update-database-location', async () => {
    const result = dialog.showOpenDialogSync({
      title: 'Mevcut Veritabanı Dosyasını Seçin',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'db.enc'] }],
      properties: ['openFile']
    });
    if (!result || result.length === 0) return { success: false, message: 'İptal edildi.' };
    const selectedPath = result[0];
    try {
      const buffer = Buffer.alloc(16);
      const fd = fs.openSync(selectedPath, 'r');
      fs.readSync(fd, buffer, 0, 16, 0);
      fs.closeSync(fd);
      if (!buffer.toString().startsWith('SQLite format 3')) {
        return { success: false, message: 'Seçilen dosya geçerli bir veritabanı dosyası değil!' };
      }
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ dbPath: selectedPath }));
      app.relaunch();
      app.exit(0);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: `Hata: ${e.message}` };
    }
  });

  let lastCpuInfo = os.cpus();
  ipcMain.handle('get-system-stats', () => {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = Math.round((usedMem / totalMem) * 100);
      const currentCpuInfo = os.cpus();
      let idle = 0;
      let total = 0;
      for (let i = 0; i < currentCpuInfo.length; i++) {
        const cpu = currentCpuInfo[i];
        const lastCpu = lastCpuInfo[i] || cpu;
        for (const type in cpu.times) {
          total += (cpu.times as any)[type] - (lastCpu.times as any)[type];
        }
        idle += cpu.times.idle - lastCpu.times.idle;
      }
      lastCpuInfo = currentCpuInfo;
      const cpuUsagePercent = total === 0 ? 0 : Math.round((1 - idle / total) * 100);
      return { success: true, data: { cpu: cpuUsagePercent, ram: memUsagePercent } };
    } catch (e) {
      return { success: false, data: { cpu: 0, ram: 0 } };
    }
  });

  ipcMain.handle('track-analytics', async (_, data: { type: any, screen: string, action: string, details?: any, user?: string }) => {
    Logger.analytics(data.type, data.screen, data.action, data.details, data.user);
    return { success: true };
  });
};
