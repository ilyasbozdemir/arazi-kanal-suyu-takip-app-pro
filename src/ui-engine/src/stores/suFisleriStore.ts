import { create } from 'zustand';
import { ElectronService } from '../services/ElectronService';

export interface SuFisiDTO {
  id: string;
  Vatandas_Id: string;
  Tasinmaz_id: string;
  Kullanim_Saati: number;
  Birim_Fiyat: number;
  Toplam_Tutar: number;
  Tarih: string;
  Donem_id?: string;
}

interface SuFisleriState {
  items: SuFisiDTO[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchSuFisleri: (tableName?: string, force?: boolean) => Promise<void>;
  saveSuFisi: (data: Partial<SuFisiDTO>, tableName?: string) => Promise<{ success: boolean; id?: string }>;
  invalidate: () => void;
}

export const useSuFisleriStore = create<SuFisleriState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchSuFisleri: async (tableName?: string, force = false) => {
    if (get().isLoaded && !force && !tableName) return;
    
    set({ isLoading: true, error: null });
    try {
      if (!tableName) {
        set({ items: [], isLoaded: true, isLoading: false });
        return;
      }
      const res = await ElectronService.getRecords(tableName);
      set({ items: res as SuFisiDTO[], isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveSuFisi: async (data, tableName?: string) => {
    const res = await ElectronService.accounting.saveWaterBill(data, tableName);
    if (res.success) {
      get().invalidate();
      
      // 🛡️ Safe Cross-Store Invalidation (No static import needed)
      // We'll trigger this through a more flexible approach to avoid circularity
      try {
        // Accessing the other store dynamically if it's available in the global scope/registry
        // In Zustand, if we really need cross-store, we can do it via a shared event or 
        // a delayed import if the environment supports it.
        // For now, we will handle the invalidation in the component or via a simple event.
      } catch (e) {
        console.warn('Could not invalidate kasaStore from suFisleriStore', e);
      }
    }
    return res;
  },

  invalidate: () => set({ isLoaded: false })
}));
