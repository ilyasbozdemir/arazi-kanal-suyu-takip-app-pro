
import { NavigationHeader } from './layout/NavigationHeader'
import { MainContentRenderer } from './layout/MainContentRenderer'

// Layout & UI
import TitleBar from './layout/components/TitleBar'
import { TabSystem } from './components/TabSystem'
import { StatusFooter } from './layout/components/StatusFooter'
import { GlobalSearchModal } from './components/modals/GlobalSearchModal'
import { JSONMappingModal } from './components/modals/JSONMappingModal'
import { QuickActionModal } from './components/modals/QuickActionModal'
import { AccountingModuleOnboarding } from './components/modals/AccountingModuleOnboarding'

import { MapViewScreen } from './screens/tasinmaz/MapViewScreen'
// Hooks & Services
import { useAppLogic } from './hooks/useAppLogic'
import { BORDER_RADIUS_MAP, FONT_SIZE_MAP } from './config/uiConfig'

export default function App(): JSX.Element {
  const {
    tabs, activeTabId, setActiveTabId, addTab, removeTab, handleOpenDetail, handleOpenCreate,
    cachedData, refreshAll, devMode, dbPath, isLoading, identity, uiConfig,
    settingsTab, setSettingsTab, isQuickActionModalOpen, setIsQuickActionModalOpen,
    isMappingModalOpen, setIsMappingModalOpen, isGlobalSearchOpen, setIsGlobalSearchOpen,
    windowWidth, navContainerRef, draftGeometry, setDraftGeometry, menuMode, setMenuMode,
    visibleItems, overflowItems, showAlert, combinedLocations, activeTab,
    accountingEnabled, initialSetupCompleted, setInitialSetupCompleted, setAccountingEnabled
  } = useAppLogic();

  return (
    <div 
      className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200 transition-all duration-300"
      style={{ 
        fontFamily: uiConfig.fontFamily,
        // UI Scaling via CSS Variable
        ['--ui-scale' as any]: uiConfig.uiScale,
        ['--app-radius' as any]: BORDER_RADIUS_MAP[uiConfig.borderRadius]
      }}
    >
      <style>{`
        :root {
          --app-font-size: ${FONT_SIZE_MAP[uiConfig.fontSize]};
          --app-radius: ${BORDER_RADIUS_MAP[uiConfig.borderRadius]};
        }
        html { 
          font-size: var(--app-font-size) !important;
        }
        body {
          font-size: var(--app-font-size);
        }
      `}</style>
      <TitleBar addTab={addTab}>
        <NavigationHeader 
          navContainerRef={navContainerRef}
          identity={identity}
          appLogo={(window as any).APP_LOGO_BASE64 || "/logo.png"}
          windowWidth={windowWidth}
          menuMode={menuMode}
          setMenuMode={setMenuMode}
          visibleItems={visibleItems}
          overflowItems={overflowItems}
        />
      </TitleBar>

      <TabSystem
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSwitch={setActiveTabId}
        onTabClose={removeTab}
        onAddTabClick={() => setIsQuickActionModalOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden p-2 bg-slate-50 dark:bg-slate-950/50">
        <MainContentRenderer 
          tabs={tabs}
          activeTabId={activeTabId}
          addTab={addTab}
          removeTab={removeTab}
          handleOpenDetail={handleOpenDetail}
          handleOpenCreate={handleOpenCreate}
          cachedData={cachedData}
          refreshAll={refreshAll}
          devMode={devMode}
          dbPath={dbPath}
          showAlert={showAlert}
          combinedLocations={combinedLocations}
          draftGeometry={draftGeometry}
          setDraftGeometry={setDraftGeometry}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          setIsMappingModalOpen={setIsMappingModalOpen}
        />

        {activeTab?.type === "map" && (
          <div className="absolute inset-0 z-[10] bg-slate-900 overflow-hidden animate-in fade-in duration-700">
            <MapViewScreen onOpenDetail={handleOpenDetail} onOpenCreate={handleOpenCreate} citizens={cachedData.DATA_Vatandas} allTapus={cachedData.DATA_Tapu_Verisi} setDraftGeometry={setDraftGeometry} activeDraft={!!draftGeometry} />
          </div>
        )}
      </main>

      <StatusFooter />

      <JSONMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        onComplete={() => {
          refreshAll();
          const excelTab = tabs.find(t => t.id === 'excel-import');
          if (excelTab) removeTab(excelTab.id);
        }}
      />
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onItemClick={(t, id) => {
          const tableMap: any = { "Kişi": "DATA_Vatandas", "Tapu": "DATA_Tapu_Verisi", "Mevki": "DATA_Tasinmaz_Mevkileri" };
          handleOpenDetail(tableMap[t] || "DATA_Vatandas", id);
        }}
      />
      <QuickActionModal isOpen={isQuickActionModalOpen} onClose={() => setIsQuickActionModalOpen(false)} onAction={(id, table) => table && handleOpenCreate(table)} />
      
      <AccountingModuleOnboarding 
        isOpen={!initialSetupCompleted}
        onChoice={(enabled) => {
          setAccountingEnabled(enabled);
          setInitialSetupCompleted(true);
          showAlert('YAPILANDIRILDI', `Sistem ${enabled ? 'Muhasebe Dahil' : 'Sadece Takip'} modunda yapılandırıldı.`, 'success');
        }}
      />

      {isLoading && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[130] flex items-center justify-center"><div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div><p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">YÜKLENİYOR...</p></div></div>}
    </div>
  )
}
