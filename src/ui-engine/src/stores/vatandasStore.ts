import { create } from 'zustand';
import { ElectronService } from '../services/ElectronService';

export interface VatandasDTO {
  id: string;
  TCKN: string;
  Ad: string;
  Soyad: string;
  Telefon?: string;
  Adres?: string;
  Baba_Adi?: string;
  Sicil_No?: string;
}

interface VatandasState {
  items: VatandasDTO[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchVatandaslar: (force?: boolean) => Promise<void>;
  saveVatandas: (data: Partial<VatandasDTO>) => Promise<{ success: boolean; id?: string }>;
  deleteVatandas: (id: string) => Promise<{ success: boolean }>;
  invalidate: () => void;
}

export const useVatandasStore = create<VatandasState>((set, get) => ({
  items: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchVatandaslar: async (force = false) => {
    if (get().isLoaded && !force) return;
    
    set({ isLoading: true, error: null });
    try {
      const res = await ElectronService.getRecords('DATA_Vatandas');
      set({ items: res as VatandasDTO[], isLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveVatandas: async (data) => {
    const res = await ElectronService.saveRecord('DATA_Vatandas', data);
    if (res.success) {
      get().invalidate();
    }
    return res;
  },

  deleteVatandas: async (id) => {
    const res = await ElectronService.deleteRecord('DATA_Vatandas', id);
    if (res.success) {
      get().invalidate();
    }
    return res;
  },

  invalidate: () => set({ isLoaded: false })
}));
