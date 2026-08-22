import { create } from 'zustand';
import { ElectronService } from '../services/ElectronService';

export interface MevkiDTO {
  id: string;
  Mevki_Adi: string;
  Aciklama?: string;
  Aktif: number;
}

interface MevkiState {
  items: MevkiDTO[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchMevkiler: (force?: boolean) => Promise<void>;
  invalidate: () => void;
}

export const useMevkiStore = create<MevkiState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchMevkiler: async (force = false) => {
    if (get().isLoaded && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await ElectronService.getRecords('DATA_Tasinmaz_Mevkileri');
      set({ items: res as MevkiDTO[], isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  invalidate: () => set({ isLoaded: false })
}));
