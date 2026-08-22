import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * 🛡️ PRELOAD API BRIDGE (Sarsılmaz Nizam)
 * Organized into logical domains for better maintainability and type safety.
 */
const api = {
  // 🌍 GENEL
  pickLogo: () => ipcRenderer.invoke('pick-logo'),
  getDbPath: () => ipcRenderer.invoke('get-db-path'),
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics'),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  openDbFolder: () => ipcRenderer.invoke('open-db-folder'),
  showAlert: (opts: any) => ipcRenderer.invoke('show-alert', opts),
  showConfirm: (opts: any) => ipcRenderer.invoke('show-confirm', opts),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSetting: (key: string, value: string) => ipcRenderer.invoke('update-setting', key, value),
  getHardwareConfig: () => ipcRenderer.invoke('get-hardware-config'),
  saveHardwareConfig: (config: any) => ipcRenderer.invoke('save-hardware-config', config),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  moveDatabase: (targetPath?: string) => ipcRenderer.invoke('move-database', targetPath),
  updateDatabaseLocation: () => ipcRenderer.invoke('update-database-location'),
  checkDDrive: () => ipcRenderer.invoke('check-d-drive'),
  getRecommendedPath: () => ipcRenderer.invoke('get-recommended-path'),
  getDbData: (table: string, query?: any, orderBy?: string) => ipcRenderer.invoke('get-db-data', table, query, orderBy),
  saveRecord: (table: string, data: any) => ipcRenderer.invoke('save-record', table, data),
  deleteRecord: (table: string, id: any, note?: string) => ipcRenderer.invoke('delete-db-row', table, id, note),
  hardDeleteRecord: (table: string, id: any) => ipcRenderer.invoke('hard-delete-record', table, id),
  restoreRecord: (table: string, id: any) => ipcRenderer.invoke('restore-record', table, id),
  getDeletedRecords: (table: string) => ipcRenderer.invoke('get-deleted-records', table),
  getMapPoints: (query: any) => ipcRenderer.invoke('get-map-points', query),
  saveMapPoint: (data: any) => ipcRenderer.invoke('save-map-point', data),
  getMapLayers: () => ipcRenderer.invoke('get-map-layers'),
  getParselData: () => ipcRenderer.invoke('get-parsel-data'),
  saveParselData: (data: any) => ipcRenderer.invoke('save-parsel-data', data),
  getMapInfrastructure: () => ipcRenderer.invoke('get-map-infrastructure'),
  saveMapInfrastructure: (table: string, data: any, sourcePath?: string) => ipcRenderer.invoke('save-map-infrastructure', { table, data, sourcePath }),
  saveMapLayer: (data: any) => ipcRenderer.invoke('save-map-layer', data),
  deleteMapLayer: (id: string) => ipcRenderer.invoke('delete-map-layer', id),
  importMapLayerFileDialog: (customId?: string) => ipcRenderer.invoke('import-map-layer-file-dialog', customId),
  executeRaw: (sql: string, params: any[] = []) => ipcRenderer.invoke('execute-raw', sql, params),
  globalSearch: (query: string) => ipcRenderer.invoke('global-search', query),
  getStats: () => ipcRenderer.invoke('get-stats'),
  getMevkiStats: () => ipcRenderer.invoke('get-mevki-stats'),
  getRecentActivity: () => ipcRenderer.invoke('get-recent-activity'),
  createDynamicLedger: (neighborhoodId: string, year: string) => ipcRenderer.invoke('create-dynamic-ledger', neighborhoodId, year),
  getSchemaHistory: () => ipcRenderer.invoke('get-schema-history'),
  getDirtyDataReport: () => ipcRenderer.invoke('get-dirty-data-report'),
  getActivityLogs: () => ipcRenderer.invoke('get-activity-logs'),
  exportExcel: (opts: any) => ipcRenderer.invoke('export-excel', opts),
  openExcelDialog: () => ipcRenderer.invoke('openExcelDialog'),
  downloadExcelTemplate: () => ipcRenderer.invoke('downloadExcelTemplate'),
  importExcelWithJson: (filePath: string, responsibleId: string) => ipcRenderer.invoke('importExcelWithJson', filePath, responsibleId),
  analyzeGenders: () => ipcRenderer.invoke('analyze-genders'),
  getUnknownGenders: () => ipcRenderer.invoke('get-unknown-genders'),
  bulkUpdateGender: (name: string, gender: string) => ipcRenderer.invoke('bulk-update-gender', name, gender),
  trackAnalytics: (data: any) => ipcRenderer.invoke('track-analytics', data),

  // 🪟 PENCERE
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.invoke('is-window-maximized'),
    setWindowIcon: (base64: string) => ipcRenderer.invoke('set-window-icon', base64),
  },
  windowControls: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.invoke('is-window-maximized'),
    setWindowIcon: (base64: string) => ipcRenderer.invoke('set-window-icon', base64),
  },

  // 🏗️ TAPU & TAŞINMAZ
  tapu: {
    getDetails: (id: string) => ipcRenderer.invoke('get-tapu-details', id),
    getOwners: (id: string) => ipcRenderer.invoke('get-tapu-owners', id),
    getZilyetler: (id: string) => ipcRenderer.invoke('get-tapu-zilyetler', id),
    getHistory: (ada: string, parsel: string, mevki: string) => ipcRenderer.invoke('get-tapu-history', ada, parsel, mevki),
    saveFull: (command: any) => ipcRenderer.invoke('tasinmaz:save', command),
  },

  // 🛡️ TKGM & MEGSIS ENTEGRASYON
  fetchTkgmParcel: (lat: number, lng: number) => ipcRenderer.invoke('tkgm-identify-parcel', { lat, lng }),
  autoRegisterTkgmParcel: (geojson: any) => ipcRenderer.invoke('auto-register-tkgm-parcel', geojson),
  tkgmOpenDownload: (opts: any) => ipcRenderer.invoke('tkgm-open-download', opts),
  resolveMahalleId: (tapuId: string) => ipcRenderer.invoke('tkgm-resolve-mahalle-id', tapuId),
  fetchBoundaryGeoJSON: (path: string) => ipcRenderer.invoke('tkgm-get-boundary-geojson', path),

  // 👤 VATANDAŞ & MÜKELLEF
  citizen: {
    getByTckn: (tckn: string) => ipcRenderer.invoke('get-citizen-by-tckn', tckn),
    getBySicil: (sicil: string) => ipcRenderer.invoke('get-citizen-by-sicil', sicil),
    getLands: (citizenId: string) => ipcRenderer.invoke('get-citizen-lands', citizenId),
    pickProfilePicture: (id: string) => ipcRenderer.invoke('pick-citizen-profile-picture', id),
    getProfileImage: (path: string) => ipcRenderer.invoke('get-citizen-profile-image', path),
  },

  // 📍 MEVKİ & MAHALLE
  mevki: {
    getDetails: (id: string) => ipcRenderer.invoke('get-mevki-details', id),
    sync: () => ipcRenderer.invoke('sync-mevkiler'),
  },

  // 💰 MUHASEBE
  accounting: {
    getProfile: () => ipcRenderer.invoke('get-profile'),
    saveWaterBill: (data: any) => ipcRenderer.invoke('save-water-bill', data), // Special handler
    saveCollection: (data: any) => ipcRenderer.invoke('save-collection', data), // Special handler
  },

  // 🚀 EVRENSEL CRUD & VERİ AKTARIMI (IPC Bridge)
  crud: {
    find: (table: string, options?: any) => ipcRenderer.invoke('crud:find', table, options),
    findOne: (table: string, id: string) => ipcRenderer.invoke('crud:findOne', table, id),
    create: (table: string, data: any) => ipcRenderer.invoke('crud:create', table, data),
    update: (table: string, id: string, data: any) => ipcRenderer.invoke('crud:update', table, id, data),
    delete: (table: string, id: string, note?: string) => ipcRenderer.invoke('crud:delete', table, id, note),
    restore: (table: string, id: string) => ipcRenderer.invoke('crud:restore', table, id),
    hardDelete: (table: string, id: string) => ipcRenderer.invoke('crud:hardDelete', table, id),
    export: (table: string, format?: 'json' | 'csv') => ipcRenderer.invoke('crud:export', table, format),
    import: (table: string, records: any[], options?: any) => ipcRenderer.invoke('crud:import', table, records, options),
  },


  // 🔄 GERİYE DÖNÜK UYUMLULUK (Legacy Support)
  getProfile: (id: string) => ipcRenderer.invoke('get-profile', id),
  getLocStats: () => ipcRenderer.invoke('get-loc-stats'),
  getCitizenLands: (id: string) => ipcRenderer.invoke('get-citizen-lands', id),
  getTapuOwners: (id: string) => ipcRenderer.invoke('get-tapu-owners', id),
  getTapuZilyetler: (id: string) => ipcRenderer.invoke('get-tapu-zilyetler', id),
  getHistory: (table: string, key: string) => ipcRenderer.invoke('get-history', table, key),
  checkDuplicate: (table: string, field: string, val: any, id?: string) => ipcRenderer.invoke('check-duplicate', table, field, val, id),
  isMaximized: () => ipcRenderer.invoke('is-window-maximized'),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  getRecords: (table: string) => ipcRenderer.invoke('get-db-data', table),

  // 🔔 EVENTS
  onDbUpdated: (callback: (data: { table: string }) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('db-updated', listener);
    return () => { ipcRenderer.removeListener('db-updated', listener); };
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
