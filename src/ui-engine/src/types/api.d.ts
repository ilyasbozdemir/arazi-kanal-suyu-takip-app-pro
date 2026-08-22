export interface IApi {
  // 🛡️ GENEL
  getDbPath: () => Promise<string>;
  openDbFolder: () => Promise<{ success: boolean }>;
  showAlert: (opts: { title?: string, message: string, type?: string }) => Promise<any>;
  showConfirm: (opts: { title?: string, message: string, type?: string }) => Promise<boolean>;
  getSettings: () => Promise<any>;
  updateSetting: (key: string, value: string) => Promise<any>;
  moveDatabase: () => Promise<{ success: boolean, message?: string }>;
  updateDatabaseLocation: () => Promise<{ success: boolean, message?: string }>;
  trackAnalytics: (data: any) => Promise<any>;

  // 🛡️ VERİ İŞLEMLERİ (Generic)
  getDbData: (table: string, query?: any, orderBy?: string) => Promise<{ success: boolean, data: any[] }>;
  getDeletedRecords: (table: string) => Promise<{ success: boolean, data: any[] }>;
  saveRecord: (table: string, data: any) => Promise<{ success: boolean, id: string }>;
  deleteRecord: (table: string, id: any, note?: string) => Promise<{ success: boolean }>;
  hardDeleteRecord: (table: string, id: any) => Promise<{ success: boolean }>;
  restoreRecord: (table: string, id: any) => Promise<{ success: boolean }>;
  executeRaw: (sql: string, params?: any[]) => Promise<{ success: boolean, data: any }>;

  // 🛡️ TAPU & TAŞINMAZ
  tapu: {
    getDetails: (id: string) => Promise<{ success: boolean, data: any }>;
    getOwners: (id: string) => Promise<{ success: boolean, data: any[] }>;
    getZilyetler: (id: string) => Promise<{ success: boolean, data: any[] }>;
    getHistory: (ada: string, parsel: string, mevki: string) => Promise<any>;
    saveFull: (command: any) => Promise<{ success: boolean, id: string }>;
  };

  // 🛡️ VATANDAŞ & MÜKELLEF
  citizen: {
    getByTckn: (tckn: string) => Promise<{ success: boolean, data: any }>;
    getBySicil: (sicil: string) => Promise<{ success: boolean, data: any }>;
    getLands: (citizenId: string) => Promise<{ success: boolean, data: any[] }>;
    pickProfilePicture: (id: string) => Promise<{ success: boolean, path?: string }>;
    getProfileImage: (path: string) => Promise<string | null>;
  };

  // 🛡️ MEVKİ & MAHALLE
  mevki: {
    getDetails: (id: string) => Promise<any>;
    sync: () => Promise<any>;
  };

  // 🛡️ MUHASEBE
  accounting: {
    getProfile: () => Promise<any>;
    saveWaterBill: (data: any) => Promise<any>;
    saveCollection: (data: any) => Promise<{ success: boolean, id?: string }>;
  };

  // 🪟 PENCERE
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  windowControls: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };

  // 🔄 LEGACY SUPPORT (Geriye Dönük Uyumluluk)
  getProfile: (id: string) => Promise<any>;
  getLocStats: () => Promise<any>;
  getCitizenLands: (id: string) => Promise<any[]>;
  getTapuOwners: (id: string) => Promise<any>;
  getTapuZilyetler: (id: string) => Promise<any>;
  getHistory: (table: string, key: string) => Promise<any>;
  checkDuplicate: (table: string, field: string, val: any, id?: string) => Promise<any>;
  isMaximized: () => Promise<boolean>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getRecords: (table: string) => Promise<any[]>;

  // 🛡️ YEDEKLEME & E-POSTA
  saveMailSettings: (config: any) => Promise<{ success: boolean, message?: string }>;
  sendTestEmail: (customSettings?: any) => Promise<{ success: boolean, message?: string }>;
  sendBackupEmail: () => Promise<{ success: boolean, message?: string }>;
  restoreBackupFromFile: () => Promise<{ success: boolean, message?: string }>;

  // 🔔 EVENTS
  onDbUpdated: (callback: (data: { table: string }) => void) => void;
}

declare global {
  interface Window {
    api: IApi;
  }
}
