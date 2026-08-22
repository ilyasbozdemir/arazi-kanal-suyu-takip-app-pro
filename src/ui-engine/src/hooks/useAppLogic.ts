import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getMenuItems } from '../config/menuConfig'
import { useTabManager } from './useTabManager'
import { useAppStore } from '../store/useAppStore'
import { ElectronService } from '../services/ElectronService'

export const useAppLogic = () => {
  const {
    tabs, setTabs, activeTabId, setActiveTabId, addTab, removeTab,
    handleOpenDetail, handleOpenCreate
  } = useTabManager()

  const cachedData = useAppStore(state => state.cachedData);
  const refreshAll = useAppStore(state => state.refreshAll);
  const devMode = useAppStore(state => state.devMode);
  const dbPath = useAppStore(state => state.dbPath);
  const isLoading = useAppStore(state => state.isLoading);
  const identity = useAppStore(state => state.identity);
  const initSync = useAppStore(state => state.initSync);
  const profile = useAppStore(state => state.profile);
  const uiConfig = useAppStore(state => state.uiConfig);
  const accountingEnabled = useAppStore(state => state.accountingEnabled);
  const initialSetupCompleted = useAppStore(state => state.initialSetupCompleted);
  const setInitialSetupCompleted = useAppStore(state => state.setInitialSetupCompleted);
  const setAccountingEnabled = useAppStore(state => state.setAccountingEnabled);

  const [settingsTab, setSettingsTab] = useState<any>('general')
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false)
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [visibleCount, setVisibleCount] = useState(8)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const [draftGeometry, setDraftGeometry] = useState<any>(null)
  const [menuMode, setMenuMode] = useState<'dagitim_oncesi' | 'dagitim_sonrasi'>('dagitim_oncesi')

  // REAL-TIME WINDOW RESIZE DETECTOR
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🎹 KLAVYE KISAYOLLARI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) { e.preventDefault(); setActiveTabId(tabs[idx].id); }
        return;
      }
      if (e.key === 'w' || e.key === 'W') {
        if (activeTabId !== 'dashboard') { e.preventDefault(); removeTab(activeTabId); }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const idx = tabs.findIndex(t => t.id === activeTabId);
        if (e.shiftKey) {
          const prev = tabs[idx - 1] || tabs[tabs.length - 1];
          setActiveTabId(prev.id);
        } else {
          const next = tabs[idx + 1] || tabs[0];
          setActiveTabId(next.id);
        }
        return;
      }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); setActiveTabId('dashboard'); return; }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setIsGlobalSearchOpen(true); return; }
    };

    const handleGlobalNav = (e: any) => { if (e.detail) addTab(e.detail); };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('KURUM_NAV_TAB', handleGlobalNav);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('KURUM_NAV_TAB', handleGlobalNav);
    };
  }, [tabs, activeTabId, setActiveTabId, removeTab, addTab]);

  // 🛡️ KURUM ANALYTICS INTEGRATION
  const lastLoggedTabId = useRef<string | null>(null);
  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (activeTabId && currentTab && activeTabId !== lastLoggedTabId.current) {
      lastLoggedTabId.current = activeTabId;
      ElectronService.trackAnalytics({
        type: 'NAV',
        screen: currentTab.title || activeTabId,
        action: 'EKRAN_GECISI',
        details: { tabId: activeTabId, type: currentTab.type, table: currentTab.table },
        user: profile?.name || identity?.name || 'Sistem Yöneticisi'
      });
    }
  }, [activeTabId, identity, tabs]);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      ElectronService.trackAnalytics({
        type: 'ERROR',
        screen: tabs.find(t => t.id === activeTabId)?.title || 'GLOBAL_SHELL',
        action: 'RENDERER_ERROR',
        details: { message: e.message, filename: e.filename, lineno: e.lineno },
        user: profile?.name || identity?.name || 'Sistem Yöneticisi'
      });
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [activeTabId, identity, tabs]);

  const openExternal = (url: string) => {
    if ((window as any).api?.openExternal) (window as any).api.openExternal(url);
    else window.open(url, '_blank');
  };

  const showAlert = useCallback(
    (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      if (type === 'warning' || type === 'error') {
        ElectronService.trackAnalytics({
          type: type === 'error' ? 'ERROR' : 'WARN',
          screen: tabs.find(t => t.id === activeTabId)?.title || 'SİSTEM',
          action: 'KULLANICI_UYARISI',
          details: { title, message },
          user: profile?.name || identity?.name || 'Sistem Yöneticisi'
        });
      }
      if ((window as any).api) (window as any).api.showAlert({ title, message, type });
    },
    [activeTabId, identity, tabs],
  )

  const handleBulkExcelExport = async () => {
    try {
      showAlert('HAZIRLANIYOR', 'Veriler hazırlanıyor...', 'info');
      const tables = ['DATA_Vatandas', 'DATA_Tapu_Verisi', 'DATA_Dagitim_Bolgeleri', 'MUHASEBE_Kasa_Hareketleri'];
      const exportData: Record<string, any[]> = {};
      for (const table of tables) {
        const res = await (window as any).api.getDbData(table);
        if (res.success) exportData[table] = res.data || [];
      }
      const res = await (window as any).api.exportExcel({
        table: 'TUM_VERILER',
        data: exportData['DATA_Vatandas'],
        fileName: `Kurum_Tum_Veriler_${new Date().toISOString().split('T')[0]}.xlsx`,
      });
      if (res.success) showAlert('BAŞARILI', 'Veriler aktarıldı.', 'success');
    } catch (err: any) {
      showAlert('HATA', 'Hata: ' + err.message, 'error');
    }
  };

  const menuItems = useMemo(() => getMenuItems({ 
    handleOpenCreate, addTab, openExternal, handleBulkExcelExport 
  }), [handleOpenCreate, addTab, handleBulkExcelExport]);

  const filteredMenuItems = useMemo(() => {
    const filterByMode = (items: any[]) => items.filter(item => {
      if (item.requiresAccounting && !accountingEnabled) return false;
      return !item.visibleIn || item.visibleIn.includes(menuMode);
    });

    return menuItems
      .filter(group => {
        if (group.requiresAccounting && !accountingEnabled) return false;
        return !group.visibleIn || group.visibleIn.includes(menuMode);
      })
      .map(group => ({
        ...group,
        items: filterByMode(group.items)
      }));
  }, [menuItems, menuMode, accountingEnabled]);

  useEffect(() => {
    const itemWidth = 145;
    const logoAreaWidth = 320;
    const controlsSafetyWidth = 180;
    const availableWidth = (windowWidth / uiConfig.uiScale) - logoAreaWidth - controlsSafetyWidth;
    const maxPossible = Math.floor(availableWidth / itemWidth);
    setVisibleCount(Math.min(filteredMenuItems.length, Math.max(1, maxPossible)));
  }, [windowWidth, filteredMenuItems, uiConfig.uiScale]);

  useEffect(() => {
    (window as any).showAlert = showAlert;
    
    // 🛡️ KURUM MOUNT SYNC: Sadece ilk açılışta verileri çek
    const timeout = setTimeout(() => useAppStore.getState().setLoading(false), 2000);
    refreshAll().finally(() => clearTimeout(timeout));
    
    const cleanupSync = initSync();
    return () => {
      if (typeof cleanupSync === 'function') cleanupSync();
    };
  }, []); // Sadece bir kere çalışır, her sekme değişiminde değil!

  const combinedLocations = useMemo(() => {
    const mevkiler = (cachedData.DATA_Tasinmaz_Mevkileri || []).map(m => ({
      Ad: (m.Mevki_Adi || "").trim().toLocaleUpperCase('tr-TR'), id: m.id, Tip: 'MEVKİ'
    }));
    const mahalleler = (cachedData.TANIM_Konumlar || []).map(m => ({
      Ad: (m.Ad || "").trim().toLocaleUpperCase('tr-TR'), id: m.id, Tip: m.Tip || 'MAHALLE'
    }));
    return [...mevkiler, ...mahalleler];
  }, [cachedData.DATA_Tasinmaz_Mevkileri, cachedData.TANIM_Konumlar]);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

  return {
    tabs, activeTabId, setActiveTabId, addTab, removeTab, handleOpenDetail, handleOpenCreate,
    cachedData, refreshAll, devMode, dbPath, isLoading, identity, uiConfig,
    settingsTab, setSettingsTab, isQuickActionModalOpen, setIsQuickActionModalOpen,
    isMappingModalOpen, setIsMappingModalOpen, isGlobalSearchOpen, setIsGlobalSearchOpen,
    windowWidth, navContainerRef, draftGeometry, setDraftGeometry, menuMode, setMenuMode,
    visibleItems: filteredMenuItems.slice(0, visibleCount),
    overflowItems: filteredMenuItems.slice(visibleCount).map(mi => ({ label: mi.label, items: mi.items, type: 'submenu' as const })),
    showAlert, combinedLocations, activeTab,
    accountingEnabled, initialSetupCompleted, setInitialSetupCompleted, setAccountingEnabled
  };
};
