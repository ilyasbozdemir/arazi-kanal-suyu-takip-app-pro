import { create } from 'zustand';
import { ElectronService } from '../services/ElectronService';

export interface TapuDTO {
  id: string;
  Ada: string;
  Parsel: string;
  Mevki_id: string;
  Mevki_Adi?: string;
  Alan_m2: number;
  Cins: string;
  Pafta?: string;
  Aciklama?: string;
}

interface TapuState {
  items: TapuDTO[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchTapular: (force?: boolean) => Promise<void>;
  saveTasinmaz: (command: any) => Promise<{ success: boolean; id?: string }>;
  deleteTapu: (id: string) => Promise<{ success: boolean }>;
  invalidate: () => void;
}

export const useTapuStore = create<TapuState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchTapular: async (force = false) => {
    if (get().isLoaded && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await ElectronService.getRecords('DATA_Tapu_Verisi');
      set({ items: res as TapuDTO[], isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveTasinmaz: async (command) => {
    // 🛡️ Uses the specialized atomic transaction handler
    const res = await ElectronService.tapu.saveFull(command);
    if (res.success) {
      get().invalidate();
    }
    return res;
  },

  deleteTapu: async (id) => {
    const res = await ElectronService.deleteRecord('DATA_Tapu_Verisi', id);
    if (res.success) {
      get().invalidate();
    }
    return res;
  },

  invalidate: () => set({ isLoaded: false })
}));
