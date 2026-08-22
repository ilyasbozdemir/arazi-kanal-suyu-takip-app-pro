import { IApi } from '../types/api';

/**
 * 🛡️ ELECTRON SERVICE (IPC BRIDGE)
 * This service acts as the strictly-typed bridge between React components and the Electron Main process.
 * No business logic here, only IPC routing and type enforcement.
 */
export const ElectronService = {
  // 🌍 GENEL
  getDbPath: () => window.api.getDbPath(),
  getSystemMetrics: () => window.api.getSystemMetrics(),
  openDbFolder: () => window.api.openDbFolder(),
  showAlert: (opts: { title?: string, message: string, type?: string }) => window.api.showAlert(opts),
  showConfirm: (opts: { title?: string, message: string, type?: string }) => window.api.showConfirm(opts),
  getSettings: () => window.api.getSettings(),
  updateSetting: (key: string, value: string) => window.api.updateSetting(key, value),
  moveDatabase: () => window.api.moveDatabase(),
  updateDatabaseLocation: () => window.api.updateDatabaseLocation(),
  trackAnalytics: (data: { type: 'NAV' | 'ERROR' | 'WARN' | 'ACTION', screen: string, action: string, details?: any, user?: string }) => {
    if (window.api && typeof window.api.trackAnalytics === 'function') {
      return window.api.trackAnalytics(data);
    }
    console.warn('[ANALYTICS_PENDING] trackAnalytics is not available yet. Please restart the app.');
    return Promise.resolve();
  },

  // 📊 VERİ
  getRecords: (table: string, query?: any, orderBy?: string) => window.api.getDbData(table, query, orderBy),
  getDeletedRecords: (table: string) => window.api.getDeletedRecords(table),
  getMapPoints: (query: any) => window.api.getMapPoints(query),
  saveMapPoint: (data: any) => window.api.saveMapPoint(data),
  saveRecord: (table: string, data: any) => window.api.saveRecord(table, data),
  updateRecord: (table: string, id: string, data: any) => window.api.saveRecord(table, { ...data, id }),
  deleteRecord: (table: string, id: any, note?: string) => window.api.deleteRecord(table, id, note),
  hardDeleteRecord: (table: string, id: any) => window.api.hardDeleteRecord(table, id),
  restoreRecord: (table: string, id: any) => window.api.restoreRecord(table, id),
  executeRaw: (sql: string, params?: any[]) => window.api.executeRaw(sql, params),
  createDynamicLedger: (neighborhoodId: string, year: string) => window.api.createDynamicLedger(neighborhoodId, year),
  getAllLedgersSummary: () => (window as any).electron.ipcRenderer.invoke('get-all-ledgers-summary'),
  openExcelDialog: () => window.api.openExcelDialog(),
  downloadExcelTemplate: () => window.api.downloadExcelTemplate(),
  importExcelWithJson: (filePath: string, responsibleId: string) => window.api.importExcelWithJson(filePath, responsibleId),

  // 🏗️ TAPU
  tapu: {
    getDetails: (id: string) => window.api.tapu.getDetails(id),
    getOwners: (id: string) => window.api.tapu.getOwners(id),
    getZilyetler: (id: string) => window.api.tapu.getZilyetler(id),
    getHistory: (ada: string, parsel: string, mevki: string) => window.api.tapu.getHistory(ada, parsel, mevki),
    saveFull: (command: any) => window.api.tapu.saveFull(command),
  },

  // 👤 CITIZEN
  citizen: {
    getByTckn: (tckn: string) => window.api.citizen.getByTckn(tckn),
    getBySicil: (sicil: string) => window.api.citizen.getBySicil(sicil),
    getLands: (citizenId: string) => window.api.citizen.getLands(citizenId),
    pickProfilePicture: (id: string) => window.api.citizen.pickProfilePicture(id),
    getProfileImage: (path: string) => window.api.citizen.getProfileImage(path),
  },

  // 🔄 CITIZEN LEGACY & SHORTCUTS
  pickCitizenProfilePicture: (id: string) => window.api.citizen.pickProfilePicture(id),
  getCitizenProfileImage: (path: string) => window.api.citizen.getProfileImage(path),

  // 📍 MEVKİ
  mevki: {
    getDetails: (id: string) => window.api.mevki.getDetails(id),
    sync: () => window.api.mevki.sync(),
  },

  // 💰 ACCOUNTING
  accounting: {
    getProfile: () => window.api.accounting.getProfile(),
    saveWaterBill: (data: any, table?: string) => window.api.accounting.saveWaterBill(data, table),
    saveCollection: (data: any, table?: string) => window.api.accounting.saveCollection(data, table),
  },

  // 🪟 WINDOW
  window: {
    minimize: () => window.api.window.minimize(),
    maximize: () => window.api.window.maximize(),
    close: () => window.api.window.close(),
    isMaximized: () => window.api.window.isMaximized(),
  },

  // 🔄 LEGACY (Backward Compatibility)
  getProfile: (id: string) => window.api.getProfile(id),
  getLocStats: () => window.api.getLocStats(),
  getCitizenLands: (id: string) => window.api.citizen.getLands(id),
  isMaximized: () => window.api.isMaximized(),
  minimize: () => window.api.minimize(),
  maximize: () => window.api.maximize(),
  close: () => window.api.close(),

  // 🛡️ YEDEKLEME & E-POSTA
  saveMailSettings: (config: any) => (window as any).electron.ipcRenderer.invoke('save-mail-settings', config),
  sendTestEmail: (customSettings?: any) => (window as any).electron.ipcRenderer.invoke('send-test-email', customSettings),
  sendBackupEmail: () => (window as any).electron.ipcRenderer.invoke('send-backup-email'),
  restoreBackupFromFile: () => (window as any).electron.ipcRenderer.invoke('restore-backup-from-file'),

  // 🔔 EVENTS
  onUpdate: (callback: (data: { table: string }) => void) => window.api.onDbUpdated(callback),
};
