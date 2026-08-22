import { 
  Users, BookOpen, MapPin, Waves, UserPlus, Search, 
  DollarSign, History, FileText, Scale, Download, 
  BarChart3, Globe, CloudSun, FileSpreadsheet, ShieldCheck, 
  Settings as SettingsIcon, HelpCircle, Database,
  Box, Percent, TrendingUp
} from 'lucide-react';

export const getMenuItems = (deps: {
  handleOpenCreate: (table: string) => void;
  addTab: (tab: any) => void;
  openExternal: (url: string) => void;
  handleBulkExcelExport: () => void;
}) => {
  const { handleOpenCreate, addTab, openExternal } = deps;

  return [
    {
      id: 'kayit_veri_giris',
      label: "Kayıt & Veri Giriş",
      visibleIn: ['dagitim_oncesi'],
      items: [
        { label: "Kişi Ekle", icon: UserPlus, shortcut: "Ctrl+N", onClick: () => handleOpenCreate("DATA_Vatandas"), visibleIn: ['dagitim_oncesi'] },
        { label: "Arazi / Tapu Ekle", icon: BookOpen, shortcut: "Ctrl+D", onClick: () => handleOpenCreate("DATA_Tapu_Verisi"), visibleIn: ['dagitim_oncesi'] },
        { label: "Mevki Ekle", icon: MapPin, onClick: () => handleOpenCreate("DATA_Tasinmaz_Mevkileri"), visibleIn: ['dagitim_oncesi'] },
        { label: "Yeni Dağıtım Bölgesi Ekle", icon: Waves, onClick: () => handleOpenCreate("DATA_Dagitim_Bolgeleri"), visibleIn: ['dagitim_oncesi'] },
        { label: "Yeni Saha Görevlisi Ekle", icon: UserPlus, onClick: () => handleOpenCreate("TANIM_Meravlar"), visibleIn: ['dagitim_oncesi'] },
      ]
    },
    {
      id: 'sorgula_goruntule',
      label: "Sorgula & Görüntüle",
      items: [
        { label: "Vatandaş Listesi", icon: Users, onClick: () => addTab({ type: "tableView", table: "DATA_Vatandas", title: "Vatandaşlar" }) },
        { label: "Tapu Listesi", icon: BookOpen, onClick: () => addTab({ type: "tableView", table: "DATA_Tapu_Verisi", title: "TAPU KAYITLARI" }) },
        { label: "Mevki Listesi", icon: MapPin, onClick: () => addTab({ type: "tableView", table: "DATA_Tasinmaz_Mevkileri", title: "Mevki Listesi" }) },
        { label: "Dağıtım Bölgesi Listesi", icon: Waves, onClick: () => addTab({ type: "tableView", table: "DATA_Dagitim_Bolgeleri", title: "Dağıtım Bölgeleri" }), visibleIn: ['dagitim_oncesi'] },
        { label: "Merav Listesi", icon: Users, onClick: () => addTab({ type: "tableView", table: "TANIM_Meravlar", title: "Saha Merav Görevlileri" }), visibleIn: ['dagitim_oncesi'] },
      ]
    },
    {
      id: 'dagitim_defterler',
      label: "Dağıtım Operasyonları",
      visibleIn: ['dagitim_sonrasi'],
      items: [
        { label: "Aktif Dağıtım Defterleri", icon: BookOpen, onClick: () => addTab({ id: 'active-ledgers', type: 'activeLedgers', title: 'Aktif Defterler' }), visibleIn: ['dagitim_sonrasi'] },
        { label: "Vatandaş Listesi", icon: Users, onClick: () => addTab({ type: "tableView", table: "DATA_Vatandas", title: "Vatandaşlar" }), visibleIn: ['dagitim_sonrasi'] },
        { label: "Tapu / Arazi Sorgu", icon: Search, onClick: () => addTab({ type: "tableView", table: "DATA_Tapu_Verisi", title: "TAPU KAYITLARI" }), visibleIn: ['dagitim_sonrasi'] },
      ]
    },
    {
      id: 'mali_rapor',
      label: "Ön Muhasebe & Rapor",
      requiresAccounting: true,
      items: [
        { label: "Ön Muhasebe & Kasa", icon: DollarSign, onClick: () => addTab({ type: "accounting", title: "Ön Muhasebe" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Tahakkuk & Tahsilat Takibi", icon: History, onClick: () => addTab({ type: "accounting", title: "Ön Muhasebe", id: 'accounting-fisler' }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Makbuz Defterleri", icon: FileText, onClick: () => addTab({ type: "accounting", title: "Ön Muhasebe", id: 'accounting-fisler' }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Ücret Tarifeleri", icon: Scale, onClick: () => addTab({ type: "pricingManagement", title: "Ücretler" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Vergi Oranları", icon: Percent, onClick: () => addTab({ type: "financeSettings", initialTab: 'tax', title: "Vergi Oranları" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Gecikme Zammı & Faiz", icon: TrendingUp, onClick: () => addTab({ type: "financeSettings", initialTab: 'interest', title: "Faiz Oranları" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { type: 'separator' as const, visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Tahsilat İcmali", icon: Download, onClick: () => addTab({ id: 'collection-report', type: "COLLECTION_REPORT", title: "Tahsilat İcmali" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Yıllık Su Tahakkuk Raporu", icon: FileText, onClick: () => addTab({ type: "SU_TAHAKKUK_RAPORU", title: "Yıllık Tahakkuk", id: 'SU_TAHAKKUK_RAPORU' }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
        { label: "Rapor Merkezi", icon: BarChart3, onClick: () => addTab({ id: 'reports', type: "reports", title: "Rapor Merkezi" }), visibleIn: ['dagitim_oncesi', 'dagitim_sonrasi'] },
      ]
    },
    {
      id: 'harita_servis',
      label: "Harita & Servis",
      items: [
        { label: "İnteraktif Harita", icon: MapPin, onClick: () => addTab({ type: "map", title: "Harita" }) },
        { label: "Kurum Web Sitesi", icon: Globe, onClick: () => openExternal("https://kurum.gov.tr") },
        { type: 'separator' as const },
        { label: "TKGM Parsel Sorgu", icon: Search, onClick: () => openExternal("https://parselsorgu.tkgm.gov.tr/") },
        { label: "TUCBS Atlas", icon: MapPin, onClick: () => openExternal("https://tucbs-atlas.csb.gov.tr/") },
        { label: "MGM Hava Durumu", icon: CloudSun, onClick: () => openExternal("https://www.mgm.gov.tr/") },
        { type: 'separator' as const },
        { label: "GeoJSON Test Laboratuvarı", icon: Box, onClick: () => addTab({ id: 'geo-tester', type: 'geoTester', title: 'Geo Laboratuvarı' }) },
      ]
    },
    {
      id: 'yonetim_admin',
      label: "Ayarlar & Raporlar",
      items: [
        { label: "Excel'den Veri Aktar", icon: FileSpreadsheet, onClick: () => addTab({ id: 'excel-import', title: 'Excel Veri Aktarımı', type: 'excelImport' }), visibleIn: ['dagitim_oncesi'] },
        { type: 'separator' as const },
        { label: "Denetim Kayıtları", icon: ShieldCheck, onClick: () => addTab({ type: "audit", title: "Denetim" }) },
        { label: "Sistem Logları", icon: History, onClick: () => addTab({ type: "systemLogs", title: "Loglar" }) },
        { label: "Veritabanı Mimari Haritası", icon: Database, onClick: () => addTab({ type: "schemaVisualizer", title: "Veritabanı Mimarisi" }) },
        { label: "Genel Ayarlar", icon: SettingsIcon, onClick: () => addTab({ type: "settings", title: "Ayarlar" }) },
        { type: 'separator' as const },
        { label: "Sistem Yardım Kılavuzu", icon: HelpCircle, onClick: () => addTab({ type: "help", title: "Yardım ve Kılavuz" }) },
      ]
    }
  ];
};
