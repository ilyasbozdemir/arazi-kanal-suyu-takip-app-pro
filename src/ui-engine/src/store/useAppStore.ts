import { create } from 'zustand';
import { UIConfig, DEFAULT_UI_CONFIG } from '../config/uiConfig';

export type AppModule = 'SULAMA_BIRLIGI' | 'SU_DEFTERI';

interface AppState {
  activeModule: AppModule;
  stats: any;
  cachedData: Record<string, any[]>;
  recentActivity: any[];
  locStats: any;
  mevkiStats: any;
  isLoading: boolean;
  dbPath: string;
  theme: 'light' | 'dark';
  identity: { name: string; logo: string };
  profile: { 
    id: string;
    name: string; 
    title: string; 
    email: string;
    phone: string;
    image: string; 
    citizenId: string | null 
  };
  devMode: boolean;
  setDevMode: (val: boolean) => void;
  uiConfig: UIConfig;
  updateUIConfig: (config: Partial<UIConfig>) => void;
  accountingEnabled: boolean;
  setAccountingEnabled: (val: boolean) => void;
  initialSetupCompleted: boolean;
  setInitialSetupCompleted: (val: boolean) => void;
  
  // Actions
  setActiveModule: (module: AppModule) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDbPath: (path: string) => void;
  setLoading: (loading: boolean) => void;
  setCachedData: (updater: (prev: Record<string, any[]>) => Record<string, any[]>) => void;
  setIdentity: (identity: { name: string; logo: string }) => void;
  
  // Async Sync Actions
  refreshStats: () => Promise<void>;
  refreshRecentActivity: () => Promise<void>;
  refreshData: (table?: string) => Promise<void>;
  refreshIdentity: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAll: () => Promise<void>;
  initSync: () => (() => void) | void;
  
  // Veri Versiyon Yönetimi
  dataVersions: Record<string, number>;
  notifyChange: (table: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  dataVersions: {},
  notifyChange: (table) => {
    set((state) => ({
      dataVersions: {
        ...state.dataVersions,
        [table]: (state.dataVersions[table] || 0) + 1
      }
    }));
    // 🛡️ Sarsılmaz Senkronizasyon: Değişim bildirildiği an veriyi tazele
    get().refreshData(table);
    get().refreshStats();
  },
  activeModule: (localStorage.getItem('active_module') as AppModule) || 'SULAMA_BIRLIGI',
  stats: {
    vatandasCount: 0,
    tapuCount: 0,
    totalArea: 0,
    yaylaCount: 0,
    usageHours: 0,
    totalSuHakki: 0,
    overUsageCount: 0,
    totalDebt: 0,
    totalPaid: 0,
    meravCount: 0
  },
  cachedData: {},
  recentActivity: [],
  locStats: null,
  mevkiStats: null,
  isLoading: false,
  dbPath: '',
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  identity: { name: 'KURUMSAL YÖNETİM SİSTEMİ', logo: '' },
  profile: { id: '', name: 'Yükleniyor...', title: 'Personel', email: '', phone: '', image: '', citizenId: null },
  devMode: localStorage.getItem('dev_mode') === 'true',
  uiConfig: JSON.parse(localStorage.getItem('ui_config') || JSON.stringify(DEFAULT_UI_CONFIG)),
  accountingEnabled: localStorage.getItem('accounting_enabled') !== 'false', // Default true
  initialSetupCompleted: localStorage.getItem('initial_setup_completed') === 'true',
  setAccountingEnabled: (val) => { set({ accountingEnabled: val }); localStorage.setItem('accounting_enabled', val ? 'true' : 'false'); },
  setInitialSetupCompleted: (val) => { set({ initialSetupCompleted: val }); localStorage.setItem('initial_setup_completed', val ? 'true' : 'false'); },
  setDevMode: (val) => { set({ devMode: val }); localStorage.setItem('dev_mode', val ? 'true' : 'false'); },

  setActiveModule: (module) => {
    set({ activeModule: module });
    localStorage.setItem('active_module', module);
  },
  
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  setDbPath: (path) => set({ dbPath: path }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCachedData: (updater) => { set((state) => ({ cachedData: updater(state.cachedData) })); },
  setIdentity: (identity) => set({ identity }),
  updateUIConfig: (config) => {
    const newConfig = { ...get().uiConfig, ...config };
    set({ uiConfig: newConfig });
    localStorage.setItem('ui_config', JSON.stringify(newConfig));
  },

  refreshStats: async () => {
    if (!(window as any).api?.getStats) return;
    const res = await (window as any).api.getStats();
    if (res.success) set({ stats: res.stats });
  },

  refreshRecentActivity: async () => {
    if (!(window as any).api?.getRecentActivity) return;
    const res = await (window as any).api.getRecentActivity();
    if (res.success) set({ recentActivity: res.data || [] });
  },

  refreshIdentity: async () => {
     try {
       const res = await (window as any).api.getSettings();
        if (res?.success && res.settings) {
          const newName = res.settings.kurum_adi || 'KURUMSAL YÖNETİM SİSTEMİ';
          const newLogo = res.settings.kurum_logo || '';
          const current = get().identity;
          
          if (current.name !== newName || current.logo !== newLogo) {
            set({ identity: { name: newName, logo: newLogo } });
          }
        }
     } catch (e) {
       console.error("IDENTITY_SYNC_ERROR", e);
     }
  },

  refreshProfile: async () => {
    try {
      const res = await (window as any).api.getProfile();
      if (res?.success && res.data) set({ profile: res.data });
      else if (res?.success === false) console.warn("[PROFILE_SYNC] Profil verisi boş geldi.");
    } catch (e) { console.error(e); }
  },

  refreshData: async (table) => {
    if (!(window as any).api?.getDbData) return;
    const currentCache = get().cachedData;
    const tables = table ? [table] : [
      'DATA_Vatandas', 'DATA_Tapu_Verisi', 'DATA_Tasinmaz_Mevkileri', 
      'MAP_Depolar', 'MUHASEBE_Tahsilat', 'DATA_Dagitim_Bolgeleri', 'DATA_Dagitim_Donemleri', 
      'MUHASEBE_Kasa_Hareketleri', 'TANIM_Kasalar', 'TANIM_Personel', 'TANIM_Konumlar'
    ];
    
    // Nükleer Optimizasyon: Sadece ilgili tabloyu paralel çek
    const results = await Promise.all(tables.map(async t => {
      const res = await (window as any).api.getDbData(t);
      return { table: t, data: res.success ? (res.data || []) : [] };
    }));

    const newCache = { ...currentCache };
    results.forEach(r => { newCache[r.table] = r.data; });
    
    set({ cachedData: newCache });
  },

  // KURUM SOCKET SYNC: Veritabanı değişimlerini anında kaydet
  initSync: () => {
    if (!(window as any).api?.onDbUpdated) return;
    return (window as any).api.onDbUpdated((payload: any) => {
      console.log(`[SYNC-REKOR] Veri Değişimi Tespit Edildi: ${payload.table}`);
      get().notifyChange(payload.table);
      get().refreshRecentActivity();
    });
  },

  refreshAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().refreshStats(),
        get().refreshData(),
        get().refreshRecentActivity(),
        get().refreshIdentity(),
        get().refreshProfile()
      ]);
      const locRes = await (window as any).api.getLocStats();
      if (locRes) set({ locStats: locRes });

      const mevkiRes = await (window as any).api.getMevkiStats();
      if (mevkiRes) set({ mevkiStats: mevkiRes });

      const pathRes = await (window as any).api.getDbPath();
      if (pathRes) set({ dbPath: pathRes });
    } finally {
      set({ isLoading: false });
    }
  }
}));

