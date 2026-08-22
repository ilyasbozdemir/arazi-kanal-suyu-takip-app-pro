import { ipcMain, dialog, app } from 'electron'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { getDb, dbPath, closeDb } from '../../db'
import { Logger } from '../../logger'
import { VaultService } from '../../vault'

export const getMailSettings = () => {
  try {
    const rows = getDb().prepare("SELECT anahtar, deger FROM TANIM_Ayarlar WHERE anahtar LIKE 'smtp_%' OR anahtar = 'backup_email'").all() as any[];
    const settings: any = {};
    rows.forEach(r => settings[r.anahtar] = r.deger);
    
    const passwordRow = getDb().prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
    const appPassword = passwordRow?.deger || '';

    const port = parseInt(settings.smtp_port) || 587;
    // 🛡️ KRİTİK: Port 465 değilse secure false olmalı (STARTTLS)
    const secure = port === 465 ? (settings.smtp_secure !== 'false') : false;

    const host = settings.smtp_host || '';
    const user = settings.smtp_user || '';
    const pass = settings.smtp_pass || '';

    return {
      host,
      port,
      secure,
      user,
      pass: (appPassword && pass) ? VaultService.decrypt(pass, appPassword) : pass,
      targetEmail: settings.backup_email || user
    };
  } catch (e: any) {
    console.error('[GET_MAIL_SETTINGS_ERROR]', e.message);
    return null;
  }
};

export const sendBackupInternal = async () => {
  try {
    const settings = getMailSettings();
    if (!settings || !settings.user || !settings.pass) {
      throw new Error('E-posta (SMTP) ayarları henüz yapılandırılmamış.');
    }

    const now = new Date();
    const unixTime = Math.floor(now.getTime() / 1000);
    const dateStr = now.getFullYear().toString() + 
                      (now.getMonth() + 1).toString().padStart(2, '0') + 
                      now.getDate().toString().padStart(2, '0') + "_" + 
                      now.getHours().toString().padStart(2, '0') + 
                      now.getMinutes().toString().padStart(2, '0') + 
                      now.getSeconds().toString().padStart(2, '0');
    
    const timestamp = `${dateStr}_${unixTime}`; // 🛡️ Arazi Suyu Takip Sistemi KOMBO ANAHTAR
    
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.pass }
    });

    Logger.info('MAIL', `Yedek paketi hazırlanıyor (Kombo Anahtar): ${timestamp}`);

    const passwordRow = getDb().prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
    const appPassword = passwordRow?.deger;

    // 📦 ZIP PAKETLEME (Arazi Suyu Takip Sistemi ARŞİV)
    const zip = new AdmZip();
    const dbDir = path.dirname(dbPath);
    const recoveryKeyPath = path.join(dbDir, '.vault_recovery.key');

    // 1. Veritabanını Ekle (Şifreli veya Şifresiz)
    if (appPassword) {
      Logger.info('MAIL_ENCRYPT', 'Veritabanı şifrelenerek pakete ekleniyor...');
      const fileBuffer = fs.readFileSync(dbPath);
      const encryptedBuffer = VaultService.encryptBuffer(fileBuffer, appPassword);
      zip.addFile('arazi_sulama_takip.db.enc', encryptedBuffer);
    } else {
      zip.addLocalFile(dbPath);
    }

    // 2. Kurtarma Anahtarını Ekle (Varsa - Kullanıcı Talebi)
    if (fs.existsSync(recoveryKeyPath)) {
      Logger.info('MAIL_ZIP', 'Kurtarma anahtarı pakete dahil edildi.');
      zip.addLocalFile(recoveryKeyPath);
    }

    const zipBuffer = zip.toBuffer();
    
    // 🛡️ Arazi Suyu Takip Sistemi KRİPTO: ZIP paketini timestamp (anahtar) ile şifrele
    Logger.info('MAIL_ZIP_ENCRYPT', `Paket timestamp (${timestamp}) ile şifreleniyor...`);
    const encryptedZipBuffer = VaultService.encryptBuffer(zipBuffer, timestamp);
    
    const zipFileName = `G_KURUM_YEDEK_${timestamp}.zip.aes`;
    const tempZipPath = path.join(dbDir, zipFileName);
    fs.writeFileSync(tempZipPath, encryptedZipBuffer);

    await transporter.sendMail({
      from: `"Kurum Arazi Takip (Sistem)" <${settings.user}>`,
      to: settings.targetEmail || settings.user,
      subject: `Sistem Yedeği [${timestamp}] (KRİPTO PAKET)`,
      text: `Kurum Başkanlığı Arazi Suyu Takibi - Güvenli Yedek Paketi.\n\n` +
            `Bu paket sistem tarafından ${now.toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuş ve AES-256 (Kripto) ile zırhlandırılmıştır.\n\n` +
            `Dosya İçeriği: Veritabanı + Kurtarma Anahtarı\n` +
            `İşlem Durumu: BAŞARILI\n\n` +
            `NOT: Bu dosya sadece Kurum Başkanlığı ERP terminali üzerinden "Yedekten Geri Yükle" butonu ile açılabilir.`,
      attachments: [{
        filename: zipFileName,
        path: tempZipPath
      }]
    });

    // Temizlik: Geçici ZIP'i 10 saniye sonra sil (Dosya kilitli kalmasın diye bekletiyoruz)
    setTimeout(() => {
      if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
    }, 10000);

    Logger.info('MAIL_SUCCESS', `Yedek paketi [${zipFileName}] başarıyla gönderildi.`);
    return { success: true };
  } catch (e: any) {
    Logger.error('MAIL_FAIL', `Yedek gönderim hatası: ${e.message}`);
    return { success: false, message: e.message };
  }
};

export const sendReportEmailInternal = async (reportData: any) => {
  try {
    const settings = getMailSettings();
    if (!settings || !settings.user || !settings.pass) {
      throw new Error('E-posta (SMTP) ayarları henüz yapılandırılmamış.');
    }

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: { user: settings.user, pass: settings.pass }
    });

    const { stats, period, csvAttachment } = reportData;
    const now = new Date().toLocaleString('tr-TR');

    const attachments: any[] = [];
    if (csvAttachment) {
      attachments.push({
        filename: `G_Kurum_Mali_Icmal_${period.replace('/', '_')}.csv`,
        content: csvAttachment
      });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-style: italic; text-transform: uppercase; letter-spacing: 2px;">Mali İcmal Raporu</h2>
          <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.7;">KURUM BAŞKANLIĞI ARAZİ SUYU TAKİP SİSTEMİ</p>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <div style="margin-bottom: 30px;">
            <p style="font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase;">RAPOR DÖNEMİ</p>
            <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0;">${period}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p style="font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 5px;">TOPLAM TAHAKKUK</p>
              <p style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0;">${stats.totalAcc.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p style="font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 5px;">TOPLAM TAHSİLAT</p>
              <p style="font-size: 20px; font-weight: bold; color: #059669; margin: 0;">${stats.totalColl.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe; margin-bottom: 30px; text-align: center;">
            <p style="font-size: 12px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">TAHSİLAT PERFORMANSI</p>
            <p style="font-size: 32px; font-weight: bold; color: #1e3a8a; margin: 0;">%${stats.rate}</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">Rapor Oluşturma Tarihi: ${now}</p>
            <p style="margin: 5px 0 0;">Bu rapor sistem yöneticisi tarafından muhasebe birimine bilgilendirme amaçlı gönderilmiştir.</p>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 10px; color: #94a3b8;">
          © ${new Date().getFullYear()} G-KURUM ERP SİSTEMİ - GÜVENLİ MÜHÜRLÜ RAPOR
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Arazi Takip Mali Rapor" <${settings.user}>`,
      to: settings.targetEmail || settings.user,
      subject: `Mali İcmal Raporu [${period}] - ${now}`,
      html: html,
      attachments: attachments
    });

    Logger.info('MAIL_SUCCESS', `Mali rapor e-postası başarıyla gönderildi.`);
    return { success: true };
  } catch (e: any) {
    Logger.error('MAIL_REPORT_FAIL', `Rapor gönderim hatası: ${e.message}`);
    return { success: false, message: e.message };
  }
};

export const setupMailHandlers = () => {
  ipcMain.handle('send-backup-email', async () => {
    return await sendBackupInternal();
  });

  ipcMain.handle('send-report-email', async (_, reportData: any) => {
    return await sendReportEmailInternal(reportData);
  });

  ipcMain.handle('send-test-email', async (_, customSettings?: any) => {
    try {
      const settings = customSettings || getMailSettings();
      
      const host = settings.smtp_host || settings.host;
      const port = parseInt(settings.smtp_port || settings.port) || 587;
      const user = settings.smtp_user || settings.user;
      const pass = settings.smtp_pass || settings.pass;
      
      const secure = port === 465;
      const target = settings.backup_email || settings.targetEmail || user;

      if (!user || !pass) throw new Error('E-posta veya şifre boş olamaz.');

      const transporter = nodemailer.createTransport({
        host, port, secure,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"Arazi Suyu Takip Sistemi (Test)" <${user}>`,
        to: target,
        subject: `E-posta Bağlantı Testi`,
        text: `Tebrikler! Kurum Başkanlığı Arazi Takip sistemi e-posta ayarlarınız başarıyla doğrulandı.\n\nTest Tarihi: ${new Date().toLocaleString('tr-TR')}`,
      });

      return { success: true };
    } catch (e: any) {
      Logger.error('MAIL_TEST_FAIL', `Test e-postası hatası: ${e.message}`);
      return { success: false, message: e.message };
    }
  });

  ipcMain.handle('save-mail-settings', async (_, config: any) => {
    try {
      const db = getDb();
      const passwordRow = db.prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
      const appPassword = passwordRow?.deger;

      const entries = Object.entries(config);
      const stmt = db.prepare('INSERT OR REPLACE INTO TANIM_Ayarlar (anahtar, deger) VALUES (?, ?)');
      
      db.transaction(() => {
        for (const [key, val] of entries) {
          if (key && (key.startsWith('smtp_') || key === 'backup_email')) {
            let finalVal = val as string;
            if (key === 'smtp_pass' && appPassword && finalVal) {
              finalVal = VaultService.encrypt(finalVal, appPassword);
            }
            stmt.run(key, finalVal);
          }
        }
      })();

      return { success: true };
    } catch (e: any) {
      Logger.error('SAVE_MAIL_SETTINGS_FAIL', e.message);
      return { success: false, message: e.message };
    }
  });

  ipcMain.handle('restore-backup-from-file', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Geri Yüklenecek Yedek Dosyasını Seçin (.zip.aes)',
        filters: [{ name: 'Sarsılmaz Kriptolu Yedek', extensions: ['zip.aes'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { success: false, message: 'İşlem iptal edildi.' };

      const filePath = filePaths[0];
      const fileName = path.basename(filePath);
      
      // 🛡️ Sarsılmaz Timestamp Ayıklama: G_KURUM_YEDEK_{timestamp}.zip.aes
      const match = fileName.match(/G_KURUM_YEDEK_(.+)\.zip\.aes/);
      if (!match) throw new Error('Geçersiz yedek dosyası ismi. Dosya ismi değiştirilmemiş olmalıdır.');
      
      const timestamp = match[1];
      const encryptedBuffer = fs.readFileSync(filePath);
      
      Logger.info('RESTORE', `Paket deşifre ediliyor (Anahtar: ${timestamp})...`);
      const zipBuffer = VaultService.decryptBuffer(encryptedBuffer, timestamp);
      
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      let dbBuffer: Buffer | null = null;
      let isEncrypted = false;

      const encEntry = zipEntries.find(e => e.entryName === 'arazi_sulama_takip.db.enc' || e.entryName.endsWith('.db.enc'));
      const plainEntry = zipEntries.find(e => e.entryName === 'arazi_sulama_takip.db' || e.entryName.endsWith('.db'));

      if (encEntry) {
        dbBuffer = encEntry.getData();
        isEncrypted = true;
      } else if (plainEntry) {
        dbBuffer = plainEntry.getData();
        isEncrypted = false;
      }

      if (!dbBuffer) throw new Error('Paket içerisinde veritabanı dosyası bulunamadı.');

      // 🛡️ Eğer şifreliyse, mevcut sistem şifresiyle deşifre etmeyi dene
      if (isEncrypted) {
        const passwordRow = getDb().prepare("SELECT deger FROM TANIM_Ayarlar WHERE anahtar = 'app_password'").get() as any;
        const appPassword = passwordRow?.deger;
        if (!appPassword) throw new Error('Veritabanı şifreli ama sistemde uygulama şifresi tanımlı değil.');
        
        Logger.info('RESTORE_DECRYPT', 'Veritabanı deşifre ediliyor...');
        dbBuffer = VaultService.decryptBuffer(dbBuffer, appPassword);
      }

      // 🛡️ Sarsılmaz Değişim: Veritabanını Kapat ve Dosyayı Değiştir
      Logger.info('RESTORE_FINAL', 'Veritabanı dosyası değiştiriliyor...');
      closeDb();
      
      // Mevcut olanın yedeğini al (Güvenlik için)
      if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, dbPath + '.bak');
      
      fs.writeFileSync(dbPath, dbBuffer);
      
      Logger.info('RESTORE_SUCCESS', 'Geri yükleme tamamlandı. Sistem yeniden başlatılıyor.');
      
      app.relaunch();
      app.exit(0);

      return { success: true };
    } catch (e: any) {
      Logger.error('RESTORE_FAIL', `Geri yükleme hatası: ${e.message}`);
      return { success: false, message: e.message };
    }
  });
};

