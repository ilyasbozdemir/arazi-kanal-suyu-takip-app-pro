import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { translations } from '@renderer/utils/translations';
import { translateHeader } from '@renderer/utils/translations';

// Screens
import { DashboardScreen } from '@renderer/screens/sistem/DashboardScreen';
import { PricingManagementScreen } from '@renderer/screens/su/PricingManagementScreen';
import { TableView } from '@renderer/components/TableView';
import { RecordDetailViewScreen } from '@renderer/components/RecordDetailViewScreen';
import { AnnualWaterReportScreen } from '@renderer/screens/su/AnnualWaterReportScreen';
import { SystemLogsScreen } from '@renderer/screens/sistem/SystemLogsScreen';
import { AboutScreen } from '@renderer/screens/sistem/AboutScreen';
import { UnknownGenderManager } from '@renderer/components/UnknownGenderManager';
import { AuditScreen } from '@renderer/screens/sistem/AuditScreen';
import { AccountingScreen } from '@renderer/screens/finans/AccountingScreen';
import { SettingsScreen } from '@renderer/screens/sistem/SettingsScreen';
import { CollectionReportScreen } from '@renderer/screens/finans/CollectionReportScreen';
import { ProfileDetailsScreen } from '@renderer/screens/settings/ProfileDetailsScreen';
import { ReportsScreen } from '@renderer/screens/analiz/ReportsScreen';
import { AnalyticsScreen } from '@renderer/screens/analiz/AnalyticsScreen';
import { HelpSettingsScreen } from '@renderer/screens/settings/HelpSettingsScreen';
import { ActiveLedgersScreen } from '@renderer/screens/su/ActiveLedgersScreen';
import { LedgerDetailScreen } from '@renderer/screens/su/LedgerDetailScreen';
import { SchemaVisualizer } from '@renderer/screens/sistem/components/SchemaVisualizer';
import { GeoTesterScreen } from '@renderer/screens/sistem/GeoTesterScreen';
import { FinanceSettingsScreen } from '@renderer/screens/settings/FinanceSettingsScreen';
import { SimplifiedDistributionScreen } from '@renderer/screens/su/SimplifiedDistributionScreen';
import { useAppStore } from '@renderer/store/useAppStore';

interface MainContentRendererProps {
  tabs: any[];
  activeTabId: string;
  addTab: (tab: any) => void;
  removeTab: (id: string) => void;
  handleOpenDetail: (table: string, id: string) => void;
  handleOpenCreate: (table: string) => void;
  cachedData: any;
  refreshAll: () => void;
  devMode: boolean;
  dbPath: string;
  showAlert: any;
  combinedLocations: any[];
  draftGeometry: any;
  setDraftGeometry: (g: any) => void;
  settingsTab: any;
  setSettingsTab: (t: any) => void;
  setIsMappingModalOpen: (o: boolean) => void;
}

export const MainContentRenderer: React.FC<MainContentRendererProps> = (props) => {
  const {
    tabs, activeTabId, addTab, removeTab, handleOpenDetail, handleOpenCreate,
    cachedData, refreshAll, devMode, dbPath, showAlert, combinedLocations,
    draftGeometry, setDraftGeometry, settingsTab, setSettingsTab, setIsMappingModalOpen
  } = props;

  return (
    <AnimatePresence mode="popLayout">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`h-full w-full ${activeTabId === tab.id ? "block" : "hidden"}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full w-full"
          >
            {tab.type === "dashboard" && (
              <DashboardScreen
                onNavigate={(target) => {
                  if (target === 'map') {
                    addTab({ id: 'map-view', title: 'İnteraktif Harita', type: 'map' });
                  } else if (target === 'su') {
                    addTab({ id: 'active-ledgers', type: 'activeLedgers', title: 'Aktif Defterler' });
                  } else if (target === 'audit' || target === 'accounting') {
                    addTab({ type: "accounting", title: "Muhasebe" });
                  } else if (target === 'tapu' || target === 'tapuManagement') {
                    addTab({ type: "tableView", table: "DATA_Tapu_Verisi", title: "TAPU KAYITLARI" });
                  } else if (target === 'vatandas') {
                    addTab({ type: "tableView", table: "DATA_Vatandas", title: "Vatandaşlar" });
                  } else {
                    addTab({ id: target, title: (translations as any)[target] || target, type: 'tableView', table: target });
                  }
                }}
                addTab={addTab}
              />
            )}
            {tab.table === 'TANIM_Su_Ucretleri' && <PricingManagementScreen />}
            {tab.type === "tableView" && tab.table !== 'TANIM_Su_Ucretleri' && (
              <TableView
                title={translateHeader(tab.table!).toLocaleUpperCase('tr-TR')}
                description={`${translateHeader(tab.table!)} resmi veri kütüğü kayıtları.`}
                tableName={tab.table!}
                icon={BookOpen}
                initialData={cachedData[tab.table!] || []}
                onRowClick={handleOpenDetail}
                onCreateClick={() => handleOpenCreate(tab.table!)}
                searchTerm={tab.searchTerm}
              />
            )}

            {tab.type === "SU_TAHAKKUK_RAPORU" && <AnnualWaterReportScreen />}
            {tab.type === "systemLogs" && <SystemLogsScreen />}
            {tab.type === "about" && <AboutScreen />}
            {tab.type === "genderAnalyzer" && <UnknownGenderManager onRefresh={refreshAll} />}
            {tab.type === "audit" && <AuditScreen onOpenDetail={handleOpenDetail} />}
            {tab.type === "accounting" && (
              <AccountingScreen
                addTab={addTab}
                initialSubTab={(tab.id === 'accounting-makbuz' || tab.id === 'accounting-fisler') ? 'fisler' : 'kasa'}
              />
            )}

            {tab.type === "settings" && <SettingsScreen settingsTab={settingsTab} setSettingsTab={setSettingsTab} onRefresh={refreshAll} handleSendBackup={() => { }} dbPath={dbPath} showAlert={showAlert} devMode={devMode} />}
            {tab.type === "COLLECTION_REPORT" && <CollectionReportScreen />}
            {tab.type === "pricingManagement" && <PricingManagementScreen />}
            {tab.type === "profile" && <ProfileDetailsScreen onClose={() => removeTab(tab.id)} />}
            {tab.type === "reports" && <ReportsScreen />}
            {tab.type === "analytics" && <AnalyticsScreen />}
            {tab.type === "schemaVisualizer" && <SchemaVisualizer />}
            {tab.type === "geoTester" && <GeoTesterScreen />}
            {tab.type === "financeSettings" && <FinanceSettingsScreen initialTab={tab.initialTab} />}
            {tab.type === "excelImport" && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white dark:bg-slate-900 p-16 rounded-[64px] shadow-2xl border border-slate-200 dark:border-white/5 text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                    <FileSpreadsheet size={48} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white">TOPLU VERİ AKTARIMI</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Excel dosyalarınızı güvenli bir şekilde sisteme kaydetmek için<br />aşağıdaki butona basarak sihirbazı başlatın.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMappingModalOpen(true)}
                    className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-4 mx-auto"
                  >
                    SİHİRBAZI BAŞLAT <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}
            {tab.type === "help" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm h-full overflow-y-auto">
                <HelpSettingsScreen />
              </div>
            )}
            {tab.type === "activeLedgers" && <ActiveLedgersScreen addTab={addTab} />}
            {tab.type === "ledger-detail" && (
              !useAppStore.getState().accountingEnabled ? (
                <SimplifiedDistributionScreen 
                  data={tab.data}
                  onClose={() => removeTab(tab.id)}
                />
              ) : (
                <LedgerDetailScreen
                  tabId={tab.id}
                  data={tab.data}
                  onClose={() => removeTab(tab.id)}
                  addTab={addTab}
                />
              )
            )}

            {(tab.type === "detail" || tab.type === "create") && (
              <RecordDetailViewScreen key={tab.id} isOpen={true} onClose={() => removeTab(tab.id)} onRefresh={refreshAll} type={tab.type as any} table={tab.table!} data={tab.data} devMode={devMode} inline={true} onOpenDetail={handleOpenDetail} onOpenCreate={handleOpenCreate} citizens={cachedData.DATA_Vatandas} locations={combinedLocations} draftGeometry={draftGeometry} setDraftGeometry={setDraftGeometry} allTapus={cachedData.DATA_Tapu_Verisi} regions={cachedData.DATA_Dagitim_Bolgeleri} />
            )}
          </motion.div>
        </div>
      ))}
    </AnimatePresence>
  );
};
