import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface HardwareConfig {
  performanceMode: 'HIGH' | 'LOW';
  disableGPU: boolean;
  ramLimitMB: number;
  lowGraphics: boolean; // For CSS effects like blur/animations
  defaultFontSize: 'small' | 'normal' | 'large' | 'xlarge';
  defaultUIScale: number;
}

const DEFAULT_CONFIG: HardwareConfig = {
  performanceMode: 'HIGH',
  disableGPU: false,
  ramLimitMB: 2048,
  lowGraphics: false,
  defaultFontSize: 'normal',
  defaultUIScale: 1.0
};

const CONFIG_FILE_NAME = 'hardware-settings.json';

export class HardwareConfigManager {
  private static config: HardwareConfig | null = null;

  static getFilePath(): string {
    // 🛡️ Öncelik: Uygulamanın çalıştığı dizin (Taşınabilir mod için)
    const exePath = path.dirname(app.getPath('exe'));
    const localPath = path.join(exePath, CONFIG_FILE_NAME);
    
    if (app.isPackaged && fs.existsSync(localPath)) {
      return localPath;
    }

    // Fallback: UserData (Standart)
    return path.join(app.getPath('userData'), CONFIG_FILE_NAME);
  }

  static load(): HardwareConfig {
    const filePath = this.getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
        return this.config!;
      }
    } catch (e) {
      console.error('[HARDWARE_CONFIG] Yükleme hatası:', e);
    }

    this.config = { ...DEFAULT_CONFIG };
    return this.config;
  }

  static save(config: HardwareConfig): boolean {
    const filePath = this.getFilePath();
    try {
      this.config = config;
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('[HARDWARE_CONFIG] Kayıt hatası:', e);
      return false;
    }
  }

  static getConfig(): HardwareConfig {
    if (!this.config) return this.load();
    return this.config;
  }
}
