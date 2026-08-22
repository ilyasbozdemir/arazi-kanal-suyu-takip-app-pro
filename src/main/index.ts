import 'reflect-metadata'
import { app, shell, BrowserWindow, ipcMain, dialog, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Modules
import { getDb, initDb, schema, dbPath } from './db'
import { Logger } from './logger'
import { 
  setupStatsHandlers, 
  setupDataHandlers, 
  setupServerHandlers, 
  setupTkgmHandlers, 
  setupMailHandlers, 
  setupMapLayerHandlers, 
  setupImportHandlers, 
  setupExportHandlers,
  registerSystemHandlers,
  getMailSettings,
  sendBackupInternal,
  startLanServerInternal,
  stopLanServerInternal
} from './handlers'
import { runAutoBackup } from './db-helpers/backup'
import { VaultService } from './vault'
import { TapuIpcHandler } from './ipc/TapuIpcHandler'
import { CitizenIpcHandler } from './ipc/CitizenIpcHandler'

import { bootstrapDI } from './core/di/container'
import { WindowService } from './services/WindowService'

// 🛡️ Config Imports
import { WINDOW_CONFIG } from './config/windowConfig'
import { APP_FLAGS } from './config/appFlags'
import { HardwareConfigManager } from './config/hardwareConfig'

// 🛡️ LOW-END HARDWARE OPTIMIZATION PROTOCOL
const hwConfig = HardwareConfigManager.load();

if (hwConfig.performanceMode === 'LOW' || hwConfig.disableGPU) {
  app.disableHardwareAcceleration();
  Logger.info('SYSTEM', 'Low-End Hardware Mode Active: Hardware Acceleration Disabled.');
} else {
  Logger.info('SYSTEM', 'High-Performance Mode Active: GPU Acceleration Enabled.');
}

// Apply RAM limits from hardware config if specified
if (hwConfig.ramLimitMB) {
  app.commandLine.appendSwitch('js-flags', `--max-old-space-size=${hwConfig.ramLimitMB}`);
}

// Command Line Switches
APP_FLAGS.commandLineSwitches.forEach(s => {
  if (s.value) app.commandLine.appendSwitch(s.switch, s.value)
  else app.commandLine.appendSwitch(s.switch)
})


let mainWindow: BrowserWindow | null = null

// 🛡️ SINGLE INSTANCE LOCK (Tek Örnek Kilidi)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function setupHandlers() {
  // 🛡️ Initialize DI & Mediator
  const di = bootstrapDI();

  setupStatsHandlers();
  setupDataHandlers();
  setupServerHandlers();
  setupTkgmHandlers();
  setupMailHandlers();
  setupMapLayerHandlers();
  registerSystemHandlers();
  
  ipcMain.handle('show-alert', async (_, opts: { title?: string, message: string, type?: string }) => {
    let type = opts.type || 'info';
    if (type === 'success') type = 'info';
    if (!['none', 'info', 'error', 'question', 'warning'].includes(type)) type = 'info';

    Logger.info('ALERT', `${opts.title || 'MESAJ'}: ${opts.message}`);
    return dialog.showMessageBox({
      title: opts.title || 'Sistem Mesajı',
      message: opts.message,
      type: type as any,
      buttons: ['Tamam']
    });
  });

  ipcMain.handle('show-confirm', async (_, opts: { title?: string, message: string, type?: string }) => {
    let type = opts.type || 'question';
    if (type === 'success') type = 'info';
    if (!['none', 'info', 'error', 'question', 'warning'].includes(type)) type = 'info';

    const { response } = await dialog.showMessageBox({
      title: opts.title || 'Onay Gerekli',
      message: opts.message,
      type: type as any,
      buttons: ['İptal', 'Evet'],
      defaultId: 1,
      cancelId: 0
    });
    const result = response === 1;
    Logger.info('CONFIRM', `${opts.message} -> ${result ? 'EVET' : 'HAYIR'}`);
    return result;
  });

  ipcMain.handle('get-settings', async () => {
    try {
      const rows = getDb().prepare("SELECT anahtar, deger FROM TANIM_Ayarlar").all() as any[];
      const settings: Record<string, any> = {};
      rows.forEach(r => settings[r.anahtar] = r.deger);
      return { success: true, settings };
    } catch(e) { return { success: false }; }
  });

  ipcMain.handle('get-hardware-config', async () => {
    return HardwareConfigManager.getConfig();
  });

  ipcMain.handle('save-hardware-config', async (_, config: any) => {
    return HardwareConfigManager.save(config);
  });

  ipcMain.handle('verify-app-password', async (_, password: string) => {
    try {
      const row = getDb().prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
      if (!row) return { empty: true, match: password === '' }; 
      return { empty: false, match: row.deger === password };
    } catch(e) { return { empty: true, match: false }; }
  });

  ipcMain.handle('get-vault-info', async () => {
    try {
      const row = getDb().prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
      // We pass the pass to the service for hashing, we don't expose it back to renderer here
      const info = VaultService.getVaultInfo(row?.deger || '');
      return info;
    } catch(e) { return { success: false }; }
  });

  ipcMain.handle('pick-logo', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Kurum Logosu Seçin',
      filters: [{ name: 'Resimler', extensions: ['jpg', 'png', 'jpeg', 'svg', 'webp'] }],
      properties: ['openFile']
    });
    if (canceled || filePaths.length === 0) return null;
    const buffer = fs.readFileSync(filePaths[0]);
    const ext = path.extname(filePaths[0]).substring(1);
    return `data:image/${ext};base64,${buffer.toString('base64')}`;
  });

  // Window Controls
  ipcMain.handle('set-window-icon', async (_, base64: string) => {
    if (!mainWindow) return;
    try {
      const icon = nativeImage.createFromDataURL(base64);
      mainWindow.setIcon(icon);
      return { success: true };
    } catch (e) { return { success: false }; }
  });

  ipcMain.handle('get-citizen-profile-image', async (_, relativePath: string) => {
    try {
      if (!relativePath) return null;
      const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(path.dirname(dbPath), relativePath);
      if (!fs.existsSync(fullPath)) return null;
      const buffer = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).substring(1);
      return `data:image/${ext};base64,${buffer.toString('base64')}`;
    } catch (e) { return null; }
  });

  ipcMain.handle('open-external', async (_, url: string) => {
    if (url) shell.openExternal(url);
    return { success: true };
  });

  // 🛡️ KRİTİK: Dosya sistemi yolları için appPath bilgisini dön
  ipcMain.on('get-app-path', (event) => {
    event.returnValue = app.getAppPath();
  });

  ipcMain.handle('get-schema-history', async () => {
    try {
      const appPath = app.getAppPath();
      const possiblePaths = [
        path.join(appPath, 'sql_history'),
        path.join(appPath, '..', 'sql_history'),
        path.join(appPath, '..', '..', 'sql_history'),
        path.join(process.cwd(), 'sql_history'),
      ];

      let historyDir = "";
      for (const p of possiblePaths) {
        if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) {
          historyDir = p;
          break;
        }
      }

      if (!historyDir) {
        return { 
          success: false, 
          error: 'Klasör bulunamadı. Denenen yollar: ' + possiblePaths.join(', ') 
        };
      }

      const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json'));
      const history = files.map(f => {
        try {
          const content = fs.readFileSync(path.join(historyDir, f), 'utf8');
          return JSON.parse(content);
        } catch (e) { return null; }
      }).filter(Boolean);

      return { success: true, history };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  return di;
}

function createWindow(): void {
  mainWindow = new BrowserWindow(WINDOW_CONFIG)
  mainWindow.on('ready-to-show', () => {
    mainWindow!.show();
    // 🛡️ Sadece geliştirme modunda DevTools'u aç (Performans & Güvenlik)
    if (is.dev) {
      mainWindow!.webContents.openDevTools({ mode: 'detach' });
    }
  });
  
  // Shortcut for F12 (Only if enabled in flags and is dev)
  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (APP_FLAGS.devToolsShortcut && is.dev && input.type === 'keyDown' && input.key === 'F12') {
      mainWindow!.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.on('close', async (e) => {
    // If we already confirmed exit, just let it close
    if ((app as any).isQuitting) return;

    e.preventDefault();
    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Yedekle ve Çık', 'Sadece Çık', 'İptal'],
      defaultId: 0,
      cancelId: 2,
      title: 'Güvenli Çıkış',
      message: 'Uygulamadan çıkmadan önce veritabanı yedeğinin e-posta ile gönderilmesini ister misiniz?',
      detail: 'Not: Yedekleme işlemi internet hızınıza bağlı olarak birkaç saniye sürebilir.'
    });

    if (response === 2) return; // Cancel

    if (response === 0) {
      // Backup and Exit
      const settings = getMailSettings();
      const hasConfig = settings && settings.host && settings.user && settings.pass;

      if (!hasConfig) {
        const { response: confirmSkip } = await dialog.showMessageBox({
          type: 'warning',
          buttons: ['Ayarları Yap', 'Yedeklemeden Çık'],
          title: 'SMTP Ayarları Eksik',
          message: 'E-posta (SMTP) ayarlarınız tam olarak yapılmamış, bu yüzden yedek gönderilemiyor.',
          detail: 'Lütfen Host, Kullanıcı ve Şifre alanlarının dolu olduğundan emin olun. Yine de çıkmak istiyor musunuz?'
        });
        if (confirmSkip === 0) return; // Stay to fix settings
      } else {
        mainWindow?.setProgressBar(2); 
        mainWindow?.webContents.send('app-status', 'Sistem yedeği mail adresinize gönderiliyor, lütfen bekleyiniz...');
        
        try {
          await sendBackupInternal();
        } catch (err) {
          console.error('Backup failed on exit:', err);
        }
      }
    }

    // 🛡️ HER KAPANIŞTA YEREL YEDEK AL (Sarsılmaz Güvence)
    await runAutoBackup();

    (app as any).isQuitting = true;
    app.quit();
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../ui-engine/index.html'))
  }
}

app.whenReady().then(() => {
  console.log('[MAIN] App Ready. Starting Initialization...');
  electronApp.setAppUserModelId('com.sulama.crm.pro')
  initDb()
  const { container } = setupHandlers()

  console.log("[LAN] Standalone Mode: Starting internal server on 7070...");
  startLanServerInternal(7070).catch(err => {
    console.error('[LAN_SERVER_ERROR]', err);
  });

  createWindow()
  
  // 🛡️ Register window in WindowService (DI)
  const windowService = container.resolve(WindowService);
  windowService.setWindow(mainWindow!);
  
  // Custom Icon Initialization (kurum Kimlik)
  try {
    const db = getDb();
    if (db && mainWindow) {
      const row = db.prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'kurum_logo'").get() as any;
      if (row && row.deger) {
        const icon = nativeImage.createFromDataURL(row.deger);
        mainWindow.setIcon(icon);
      }
    }
  } catch (e: any) {
    console.error('[LOGO_INIT_ERROR]', e.message);
  }
  
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
}).catch(err => {
  console.error('[APP_INIT_FATAL_ERROR]', err);
  Logger.error('APP_INIT_FATAL', err.message);
})

// 🛡️ TKGM SSL FIX: Kurumun geçersiz/dahili sertifikalarını Electron'da görmezden gel
app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
  if (url.includes('tkgm.gov.tr')) {
    event.preventDefault();
    callback(true); // Güvenli kabul et
  } else {
    callback(false);
  }
});

app.on('before-quit', () => {
  stopLanServerInternal();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });

