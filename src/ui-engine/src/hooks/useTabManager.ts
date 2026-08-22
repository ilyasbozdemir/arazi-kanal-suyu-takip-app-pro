import { useState, useCallback } from 'react';
import { Tab } from '../components/TabSystem';
import { useAppStore } from '../store/useAppStore';

export const useTabManager = () => {
  const { cachedData } = useAppStore();
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'dashboard', title: 'Panel', type: 'dashboard' }]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');

  const addTab = useCallback((tab: Omit<Tab, 'id'> & { id?: string }) => {
    let id = tab.id;
    if (!id) {
      if (tab.type === 'create') {
        id = `create-${tab.table}-${Date.now()}`;
      } else {
        id = tab.type + (tab.table ? '-' + tab.table : '') + (tab.data?.id ? '-' + (tab.data.id || tab.data.Mahalle_id) : '');
      }
    }

    setTabs(prev => {
      const exists = prev.find(t => t.id === id);
      if (exists) return prev;
      return [...prev, { ...tab, id } as Tab];
    });
    setActiveTabId(id!);
  }, []);

  const removeTab = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const newTabs = prev.filter(t => t.id !== id);
      
      if (newTabs.length === 0) {
        setActiveTabId('dashboard');
        return [{ id: 'dashboard', title: 'Panel', type: 'dashboard' }];
      }

      if (activeTabId === id) {
        const nextTab = newTabs[idx] || newTabs[idx - 1] || newTabs[0];
        setActiveTabId(nextTab.id);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const handleOpenDetail = useCallback((table: string, id: any, extraData: any = {}) => {
    const data = cachedData[table]?.find((r: any) => (r.id === id || r.Mahalle_id === id)) || { id };
    
    let title = (data?.Ad || data?.Adi || data?.Mahalle_Adi || data?.Mevki_Adi || data?.mevki_adi || id).toString().substring(0, 20).toLocaleUpperCase('tr-TR');
    
    if (table === 'DATA_Tapu_Verisi') {
      title = `${data.Mevki || data.Mevkii || 'Bilinmeyen Mevki'} ${data.Ada ? data.Ada + '/' : ''}${data.Parsel || '-'}`.toLocaleUpperCase('tr-TR');
    }
    
    if (table === 'DATA_Dagitim_Donemleri') {
       title = (data.Donem_Adi || data.Mahalle_Adi || title).toString().toLocaleUpperCase('tr-TR');
    }

    const tableLabels: Record<string, string> = {
      'DATA_Vatandas': 'KİŞİ',
      'DATA_Tapu_Verisi': 'TAPU',
      'DATA_Tasinmaz_Mevkileri': 'MEVKİ',
      'DATA_Dagitim_Bolgeleri': 'DAĞITIM BÖLGESİ',
      'DATA_Dagitim_Donemleri': 'SULAMA DEFTERİ',
      'ISLEM_Su_Dagitim': 'SU DAĞITIM',
      'TANIM_Meravlar': 'MERAV',
      'MUHASEBE_Tahsilat': 'TAHSİLAT'
    };

    const isLedger = table === 'DATA_Dagitim_Donemleri';

    addTab({
      type: isLedger ? 'ledger-detail' : 'detail',
      title: `${tableLabels[table] || 'KAYIT'}: ${title}`,
      table,
      data: isLedger ? { 
        ledger: data, 
        mahalle: { id: data.Mahalle_id, Mahalle_Adi: data.Mahalle_Adi, Tip: data.Mahalle_Tip },
        ...extraData 
      } : { ...data, ...extraData }
    });
  }, [cachedData, addTab]);

  const handleOpenCreate = useCallback((table: string, initialData: any = {}) => {
    const titles: any = {
      'DATA_Vatandas': 'YENİ KİŞİ',
      'DATA_Tapu_Verisi': 'YENİ TAPU/ARAZİ',
      'DATA_Dagitim_Bolgeleri': 'YENİ DAĞITIM BÖLGESİ EKLE',
      'DATA_Tasinmaz_Mevkileri': 'YENİ TAŞINMAZ MEVKİİ',
      'TANIM_Meravlar': 'YENİ SAHA GÖREVLİSİ',
      'ISLEM_Su_Dagitim': 'YENİ SU DAĞITIMI'
    };
    localStorage.removeItem('CLONE_DATA');
    addTab({ type: 'create', title: titles[table] || 'YENİ KAYIT', table, data: initialData });
  }, [addTab]);

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    addTab,
    removeTab,
    handleOpenDetail,
    handleOpenCreate
  };
};
