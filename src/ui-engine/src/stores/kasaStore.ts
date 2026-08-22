import { create } from 'zustand';
import { ElectronService } from '../services/ElectronService';

export interface KasaHareketiDTO {
  id: string;
  Kasa_id: string;
  Vatandas_Id?: string;
  Tur: 'GELİR' | 'GİDER';
  Miktar: number;
  Aciklama?: string;
  Tarih: string;
}

interface KasaState {
  items: KasaHareketiDTO[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchKasaHareketleri: (force?: boolean) => Promise<void>;
  saveTahsilat: (data: any) => Promise<{ success: boolean; id?: string }>;
  invalidate: () => void;
}

export const useKasaStore = create<KasaState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchKasaHareketleri: async (force = false) => {
    if (get().isLoaded && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await ElectronService.getRecords('MUHASEBE_Kasa_Hareketleri');
      set({ items: res as KasaHareketiDTO[], isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveTahsilat: async (data) => {
    // 🛡️ Uses the specialized accounting handler for collections
    const res = await ElectronService.accounting.saveCollection(data);
    if (res.success) {
      get().invalidate();
    }
    return res;
  },

  invalidate: () => set({ isLoaded: false })
}));
