import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, User, MapPin, CheckCircle2, XCircle, Search, RefreshCw, Loader2, ArrowLeft, Plus, 
  Hash, ShieldCheck, Activity, Trash2, Lock as LockIcon, Info, Droplets, Clock, 
  ChevronLeft, ChevronRight, Edit2, Calendar, Banknote
} from 'lucide-react';
import { ElectronService } from '../../services/ElectronService';
import { useAppStore } from '../../store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { SimplifiedDistributionFormModal } from './components/SimplifiedDistributionFormModal';
import { SimplifiedDistributionDetailModal } from './components/SimplifiedDistributionDetailModal';
import { ModernAlert } from '../../components/ui/ModernAlert';

interface SimplifiedDistributionScreenProps {
  data: {
    ledger: any;
    mahalle: any;
  };
  onClose: () => void;
  onOpenCreate?: (table: string, data?: any) => void;
}

export const SimplifiedDistributionScreen: React.FC<SimplifiedDistributionScreenProps> = ({ data, onClose }) => {
  const { ledger, mahalle } = data;
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<any | null>(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info' as any, title: '', message: '' });

  const [citizens, setCitizens] = useState<any[]>([]);
  const [selectedCitizenProperties, setSelectedCitizenProperties] = useState<any[]>([]);
  const [activePrice, setActivePrice] = useState<any>(null);
  const [receiptBooks, setReceiptBooks] = useState<any[]>([]);
  const [personel, setPersonel] = useState<any[]>([]);
  const [selectedPropertySuHakki, setSelectedPropertySuHakki] = useState<number | null>(null);
  const [usedMinutesForSelected, setUsedMinutesForSelected] = useState<number>(0);

  const [newEntry, setNewEntry] = useState<any>({
    id: '', TCKN: '', Ad_Soyad: '', Tasinmaz_id: '', Ada_Parsel: '', Sure_Saat: 0, Tutar: 0, Tarife_Modu: 'SUN',
    Makbuz_Defter_id: '', Makbuz_Defter_Adi: '', Makbuz_No: '', Odeme_Durumu: 'Beklemede', Tahsildar_id: '', Aciklama: '', Tarih: '', vatandas_id: ''
  });

  const [activeSubView, setActiveSubView] = useState('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid
  const [stats, setStats] = useState({
    totalCount: 0, totalHours: 0, paidCount: 0, unpaidCount: 0
  });

  const [isAddingMerav, setIsAddingMerav] = useState(false);
  const [allMeravs, setAllMeravs] = useState<any[]>([]);
  const [selectedMeravId, setSelectedMeravId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingKocan, setIsAddingKocan] = useState(false);
  const [editingKocan, setEditingKocan] = useState<any>(null);
  const [newKocan, setNewKocan] = useState({
    defter_adi: '', baslangic_no: '', son_no: '', Sorumlu_Merav_id: ''
  });

  const [activePersonnel, setActivePersonnel] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Kayıtları Getir
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT 
          t.*, 
          (v.Ad || ' ' || v.Soyad) as Full_Name,
          v.TCKN as Vatandas_TCKN,
          (p.Ada || ' / ' || p.Parsel) as Ada_Parsel,
          th.Durum as Tahakkuk_Durum
        FROM DATA_Dagitim_Kayitlar t
        LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
        LEFT JOIN DATA_Tapu_Verisi p ON t.Tasinmaz_id = p.id
        LEFT JOIN MUHASEBE_Tahakkuk th ON t.id = th.Fis_id
        WHERE t.Donem_id = ? AND (t.deleted_at IS NULL OR t.deleted_at = '')
        ORDER BY t.Tarih DESC
      `, [ledger.id]);

      if (res.success) {
        const data = res.data.map((r: any) => ({
          ...r,
          // Öncelik Tahakkuk tablosundaki durumda (Gerçek finansal veri)
          Odeme_Durumu: r.Tahakkuk_Durum || r.Odeme_Durumu || 'Beklemede',
          Ad_Soyad: r.Full_Name || 'Bilinmeyen',
          Ada_Parsel: r.Ada_Parsel || 'Tanımsız'
        }));
        setRecords(data);
        
        // Stats
        setStats({
          totalCount: data.length,
          totalHours: data.reduce((sum: number, r: any) => sum + (r.Sure_Saat || 0), 0),
          paidCount: data.filter((r: any) => r.Odeme_Durumu === 'Ödendi').length,
          unpaidCount: data.filter((r: any) => r.Odeme_Durumu !== 'Ödendi').length
        });
      }

      // 2. Aktif Personeli Getir (Operatör)
      const personnelRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT p.id, (v.Ad || ' ' || v.Soyad) as Ad_Soyad
        FROM TANIM_Personel p
        JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
        WHERE p.Aktif = 1 LIMIT 1
      `);
      if (personnelRes.success && personnelRes.data?.[0]) {
        setActivePersonnel(personnelRes.data[0]);
      }

      const priceRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', "SELECT * FROM TANIM_Su_Ucretleri WHERE is_active = 1 LIMIT 1");
      if (priceRes.success && priceRes.data?.[0]) setActivePrice(priceRes.data[0]);

      const bookRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Sulama_Fis_Kocanlari', { Donem_id: ledger.id });
      if (bookRes.success) setReceiptBooks(bookRes.data || []);

      const pRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT m.id as merav_id, (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
        FROM REL_Defter_Merav r
        JOIN TANIM_Meravlar m ON r.Merav_id = m.id
        JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
        WHERE r.Defter_id = ? AND (r.deleted_at IS NULL OR r.deleted_at = '')
      `, [ledger.id]);
      if (pRes.success) setPersonel(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [ledger.id]);

  const searchCitizens = async (term: string) => {
    if (term.length < 2) { setCitizens([]); return; }
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      "SELECT id, Ad, Soyad, TCKN, Sicil_No, Baba_Adi, Mahalle_Koy, Unvan FROM DATA_Vatandas WHERE (deleted_at IS NULL OR deleted_at = '') AND (TR_SEARCH(Ad) LIKE TR_SEARCH(?) OR TR_SEARCH(Soyad) LIKE TR_SEARCH(?) OR TR_SEARCH(Unvan) LIKE TR_SEARCH(?) OR TCKN LIKE ?) LIMIT 10", 
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
    );
    if (res.success) setCitizens(res.data || []);
  };

  const loadProperties = async (vatandasId: string) => {
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
      SELECT t.*, m.Mevki_Adi as Mevki FROM DATA_Tapu_Verisi t
      LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
      LEFT JOIN REL_TASINMAZ_VATANDAS s ON t.id = s.Tasinmaz_id
      WHERE s.Vatandas_Id = ? AND (t.deleted_at IS NULL OR t.deleted_at = '')
    `, [vatandasId]);
    if (res.success) setSelectedCitizenProperties(res.data || []);
  };

  const fetchUsedMinutes = async (tasinmazId: string) => {
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      "SELECT SUM(Kullanim_Saati) as total FROM DATA_Dagitim_Kayitlar WHERE Tasinmaz_id = ? AND Donem_id = ? AND (deleted_at IS NULL OR deleted_at = '')", 
      [tasinmazId, ledger.id]
    );
    if (res.success) setUsedMinutesForSelected((res.data[0].total || 0) * 60);
  };

  const handleCalculateTutar = (hours: number, tarife: string) => {
    if (!activePrice) return 0;
    const birimFiyat = tarife === 'SUN' ? activePrice.gunduz_fiyat : activePrice.gece_fiyat;
    return hours * (birimFiyat || 0);
  };

  const isOverLimit = useMemo(() => {
    if (!selectedPropertySuHakki) return false;
    return (usedMinutesForSelected + ((newEntry.Sure_Saat || 0) * 60)) > (selectedPropertySuHakki * 60);
  }, [newEntry.Sure_Saat, usedMinutesForSelected, selectedPropertySuHakki]);

  const handleUpdateStatus = async (record: any, newStatus: string) => {
    try {
      // 1. DATA_Dagitim_Kayitlar tablosunu güncelle
      await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
        "UPDATE DATA_Dagitim_Kayitlar SET Odeme_Durumu = ? WHERE id = ?", 
        [newStatus, record.id]
      );

      // 2. MUHASEBE_Tahakkuk tablosunu güncelle (Eğer varsa)
      await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
        "UPDATE MUHASEBE_Tahakkuk SET Durum = ? WHERE Fis_id = ?", 
        [newStatus, record.id]
      );

      // 3. Verileri Yenile
      loadData();
      
      // Bildirim
      ElectronService.trackAnalytics({
        type: 'ACTION',
        screen: 'SimplifiedDistribution',
        action: 'UPDATE_STATUS',
        details: { id: record.id, status: newStatus }
      });
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
      ElectronService.showAlert({ message: "Güncelleme sırasında bir hata oluştu.", type: 'error' });
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntry.TCKN || !newEntry.Tasinmaz_id) {
      ElectronService.showAlert({ message: "Zorunlu alanları doldurun.", type: 'error' });
      return;
    }
    const res = await ElectronService.saveRecord('DATA_Dagitim_Kayitlar', {
      id: newEntry.id || window.crypto.randomUUID(),
      Donem_id: ledger.id,
      Mahalle_id: mahalle.id,
      Tasinmaz_id: newEntry.Tasinmaz_id,
      Vatandas_Id: newEntry.vatandas_id || newEntry.TCKN,
      Merav_id: newEntry.Tahsildar_id || (activePersonnel?.id || ''),
      Tarih: newEntry.Tarih || new Date().toISOString(),
      Kullanim_Saati: newEntry.Sure_Saat,
      Sure_Saat: newEntry.Sure_Saat,
      Tarife_Modu: newEntry.Tarife_Modu,
      Toplam_Tutar: newEntry.Tutar || 0,
      Birim_Fiyat: handleCalculateTutar(1, newEntry.Tarife_Modu),
      Makbuz_Defter_id: receiptBooks.find(b => b.defter_adi === newEntry.Makbuz_Defter_Adi)?.id || '',
      Makbuz_No: newEntry.Makbuz_No,
      Aciklama: newEntry.Aciklama,
      Odeme_Durumu: newEntry.Odeme_Durumu || 'Beklemede'
    });
    if (res.success) {
      setIsAddModalOpen(false);
      loadData();
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = (r.Ad_Soyad || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (r.Ada_Parsel || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true :
                           statusFilter === 'paid' ? r.Odeme_Durumu === 'Ödendi' :
                           r.Odeme_Durumu !== 'Ödendi';
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const formatDate = (ds: string) => new Date(ds).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Veriler Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarCollapsed ? 80 : 320 }}
        className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col relative z-[100] shadow-2xl"
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-24 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-50 border-2 border-white dark:border-slate-800"
          title={isSidebarCollapsed ? "Genişlet" : "Daralt"}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 border-b border-slate-100 dark:border-white/5 ${isSidebarCollapsed ? 'items-center px-0' : ''} flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onClose} title="Geri Dön" className="text-slate-400 hover:text-primary-500 transition-colors shrink-0">
              <ArrowLeft size={20} />
            </button>
            {!isSidebarCollapsed && (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <Droplets size={22} />
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight truncate">{mahalle?.Mahalle_Adi}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ledger?.Baslangic_Yili} SAHA SEZONU</p>
            </motion.div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-1">
              {!isSidebarCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">MENÜ</span>}
              <SidebarItem collapsed={isSidebarCollapsed} active={activeSubView === 'dashboard'} onClick={() => setActiveSubView('dashboard')} icon={Activity} label="Özet Rapor" />
              <SidebarItem collapsed={isSidebarCollapsed} active={activeSubView === 'grid'} onClick={() => setActiveSubView('grid')} icon={BookOpen} label="Dağıtım Defteri" />
              <SidebarItem collapsed={isSidebarCollapsed} active={activeSubView === 'personel'} onClick={() => setActiveSubView('personel')} icon={User} label="Görevli Meravlar" />
              <SidebarItem collapsed={isSidebarCollapsed} active={activeSubView === 'kocanlar'} onClick={() => setActiveSubView('kocanlar')} icon={Hash} label="Fiş Koçanları" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeSubView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">SEZON ÖZETİ</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] italic">Anlık Saha İstatistikleri</p>
                  </div>
                  <button title="Verileri Yenile" onClick={loadData} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary-500 rounded-2xl shadow-sm transition-all"><RefreshCw size={20} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <QuickStat icon={Activity} label="Toplam Kayıt" value={stats.totalCount} color="indigo" />
                  <QuickStat icon={Clock} label="Toplam Saat" value={Math.round(stats.totalHours)} color="blue" />
                  <QuickStat icon={CheckCircle2} label="Tamamlanan" value={stats.paidCount} color="emerald" />
                </div>

                <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group border border-white/10">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter mb-6 relative z-10">OPERASYON DURUMU</h3>
                  <div className="space-y-8 relative z-10 max-w-md">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span>Tamamlanan İşlemler</span>
                        <span>%{Math.round((stats.paidCount / (stats.totalCount || 1)) * 100)}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.paidCount / (stats.totalCount || 1)) * 100}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span>Tahsilat Bekleyen</span>
                        <span>%{Math.round((stats.unpaidCount / (stats.totalCount || 1)) * 100)}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.unpaidCount / (stats.totalCount || 1)) * 100}%` }} className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                      </div>
                    </div>
                  </div>
                  <ShieldCheck size={200} className="absolute -bottom-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                </div>
              </div>
            </motion.div>
          )}

          {activeSubView === 'grid' && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">DAĞITIM DEFTERİ</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Saha Kayıtları Listesi</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-sm' : 'text-slate-400'}`}>TÜMÜ</button>
                    <button onClick={() => setStatusFilter('paid')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400'}`}>TAMAMLANAN</button>
                    <button onClick={() => setStatusFilter('unpaid')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'unpaid' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400'}`}>BEKLEYEN</button>
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="ARAZİ VEYA KİŞİ ARA..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-primary-500 transition-all w-64"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (personel.length === 0 || receiptBooks.length === 0) {
                        setAlertConfig({ isOpen: true, type: 'error', title: 'EKSİKLER VAR', message: 'Kayıt için önce Merav ve Fiş Koçanı tanımlamalısınız.' });
                        return;
                      }
                      setIsAddModalOpen(true);
                    }}
                    className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center gap-3 transition-all active:scale-95"
                  >
                    <Plus size={18} /> YENİ KAYIT
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-3">
                  {filteredRecords.map((row) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={row.id}
                      className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-between hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-pointer"
                      onClick={() => setSelectedDetailRecord(row)}
                    >
                      {/* Sol Kısım: İkon ve İsim */}
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                          <User size={22} />
                        </div>
                        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{row.Ad_Soyad}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.Ada_Parsel}</p>
                          </div>
                          
                          <div className="hidden lg:block">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{row.Sure_Saat || 0} SAAT</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Kullanım Süresi</p>
                          </div>

                          <div className="hidden lg:block">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{row.Tarih ? formatDate(row.Tarih).split(' ')[0] : '---'}</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">İşlem Tarihi</p>
                          </div>

                          <div className="hidden xl:block">
                             <div className="flex items-center gap-2">
                                <Banknote size={14} className="text-emerald-500" />
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{row.Toplam_Tutar || 0} ₺</span>
                             </div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tahakkuk Tutarı</p>
                          </div>

                          <div className="hidden xl:block">
                             <div className="flex items-center gap-2">
                                <Hash size={14} className="text-slate-400" />
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{row.Makbuz_No || '---'}</span>
                             </div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Makbuz / Fiş No</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sağ Kısım: Durum ve Aksiyonlar */}
                      <div className="flex items-center gap-4 md:gap-8 ml-6">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <select 
                            title="Ödeme Durumu Güncelle"
                            value={row.Odeme_Durumu === 'Ödendi' ? 'Ödendi' : 'Beklemede'}
                            onChange={(e) => handleUpdateStatus(row, e.target.value)}
                            className={`pl-4 pr-10 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 transition-all cursor-pointer appearance-none ${
                              row.Odeme_Durumu === 'Ödendi' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white'
                            }`}
                          >
                            <option value="Beklemede" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">BEKLEMEDE</option>
                            <option value="Ödendi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TAMAMLANDI</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            {row.Odeme_Durumu === 'Ödendi' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNewEntry({...row}); setIsAddModalOpen(true); }}
                            className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={async (e) => { 
                               e.stopPropagation(); 
                               const ok = await (window as any).electron.ipcRenderer.invoke('show-confirm', { title: 'KAYIT SİLME', message: 'Bu kaydı silmek istediğinize emin misiniz?', type: 'warning' });
                               if (ok) {
                                  await (window as any).api.deleteRecord('DATA_Dagitim_Kayitlar', row.id);
                                  loadData();
                               }
                            }}
                            className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredRecords.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[40px] text-slate-400 space-y-6">
                      <BookOpen size={48} className="opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest italic opacity-40">Kayıt Bulunamadı</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubView === 'personel' && (
            <motion.div key="personel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">GÖREVLİ MERAVLAR</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Bu defterde yetkili saha personeli</p>
                  </div>
                  <button onClick={async () => {
                    const res = await (window as any).api.executeRaw(`
                      SELECT m.id, (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
                      FROM TANIM_Meravlar m
                      JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
                      WHERE (m.deleted_at IS NULL OR m.deleted_at = '')
                    `);
                    if (res.success) setAllMeravs(res.data || []);
                    setIsAddingMerav(true);
                  }} className="px-6 py-3 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20"><Plus size={16} /> MERAV EKLE</button>
                </div>

                {isAddingMerav && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary-500/5 border-2 border-dashed border-primary-500/30 p-8 rounded-[32px] space-y-6">
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black text-primary-500 uppercase tracking-widest ml-1">SİSTEME KAYITLI MERAV SEÇİN</label>
                      <div className="flex gap-4">
                        <select 
                          title="Merav Seçin"
                          value={selectedMeravId}
                          onChange={(e) => setSelectedMeravId(e.target.value)}
                          className="flex-1 p-5 bg-white dark:bg-slate-800 border-2 border-primary-500/20 rounded-2xl outline-none focus:border-primary-500 transition-all text-sm font-black uppercase"
                        >
                          <option value="">GÖREVLİ SEÇİNİZ...</option>
                          {allMeravs.map(m => (
                            <option key={m.id} value={m.id}>{m.Ad_Soyad}</option>
                          ))}
                        </select>
                        <button 
                          disabled={isSaving || !selectedMeravId}
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              const relRes = await (window as any).api.saveRecord('REL_Defter_Merav', {
                                Defter_id: ledger?.id,
                                Merav_id: selectedMeravId,
                                Baslangic_Tarihi: new Date().toISOString(),
                                Aktif: 1
                              });
                              if (relRes.success) { 
                                setIsAddingMerav(false); 
                                setSelectedMeravId(''); 
                                loadData(); 
                              }
                            } catch (err: any) { alert("Hata: " + err.message); } finally { setIsSaving(false); }
                          }}
                          className="px-10 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                        >
                          {isSaving ? 'İŞLENİYOR...' : 'GÖREVLENDİR'}
                        </button>
                        <button onClick={() => setIsAddingMerav(false)} className="px-6 bg-slate-200 dark:bg-white/10 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest">İPTAL</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personel.map(p => (
                    <div key={p.merav_id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-6 group">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500">
                        <User size={32} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-black text-slate-800 dark:text-white uppercase">{p.Ad_Soyad}</h4>
                        <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest"><ShieldCheck size={12} /> Saha Yetkisi Aktif</div>
                      </div>
                      <button 
                        title="Görevi Sonlandır / Arşivle"
                        onClick={async () => {
                          const ok = await (window as any).electron.ipcRenderer.invoke('show-confirm', {
                             title: 'GÖREV SONLANDIRMA',
                             message: `${p.Ad_Soyad} isimli görevlinin bu defterdeki yetkisini sonlandırmak istediğinize emin misiniz?`,
                             type: 'warning'
                          });
                          if (!ok) return;
                          await (window as any).api.executeRaw(`UPDATE REL_Defter_Merav SET deleted_at = CURRENT_TIMESTAMP WHERE Defter_id = ? AND Merav_id = ?`, [ledger.id, p.merav_id]);
                          loadData();
                        }}
                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubView === 'kocanlar' && (
            <motion.div key="kocanlar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">FİŞ KOÇANLARI</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Kayıt girişi için kullanılan defterler</p>
                  </div>
                  <button onClick={() => {
                    const defaultMeravId = personel.length > 0 ? personel[0].merav_id : '';
                    setNewKocan({ ...newKocan, Sorumlu_Merav_id: defaultMeravId });
                    setIsAddingKocan(true);
                  }} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"><Plus size={16} /> YENİ KOÇAN TESCİL ET</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {receiptBooks.map(b => (
                    <div key={b.id} className="bg-slate-50 dark:bg-white/5 p-6 rounded-[28px] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
                      <Hash size={40} className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-150 transition-transform text-indigo-500" />
                      <h4 className="text-base font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">{b.defter_adi}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Başlangıç: {b.baslangic_no}</p>
                      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">AKTİF KOÇAN</span>
                        <div className="flex gap-2">
                           <button title="Düzenle" onClick={() => setEditingKocan(b)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all text-slate-400"><Edit2 size={14} /></button>
                           <button title="İptal Et / Sil" onClick={async () => {
                              const ok = await (window as any).electron.ipcRenderer.invoke('show-confirm', { title: 'KOÇAN İPTALİ', message: 'Bu koçanı iptal etmek istediğinize emin misiniz?', type: 'warning' });
                              if (!ok) return;
                              await (window as any).api.deleteRecord('TANIM_Sulama_Fis_Kocanlari', b.id);
                              loadData();
                           }} className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <Dialog open={isAddingKocan || !!editingKocan} onOpenChange={(val) => { if (!val) { setIsAddingKocan(false); setEditingKocan(null); } }}>
             <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                   <DialogTitle>{editingKocan ? 'KOÇAN DÜZENLEME' : 'YENİ KOÇAN TESCİLİ'}</DialogTitle>
                   <DialogDescription>{mahalle?.Mahalle_Adi} - {ledger?.Baslangic_Yili} SEZONU</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SERİ NO / DEFTER ADI</label>
                      <input
                         type="text"
                         title="Defter Adı"
                         value={editingKocan ? editingKocan.defter_adi : newKocan.defter_adi}
                         onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, defter_adi: e.target.value }) : setNewKocan({ ...newKocan, defter_adi: e.target.value })}
                         placeholder="Örn: SERİ-A"
                         className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BAŞLANGIÇ NO</label>
                         <input
                            type="number"
                            title="Başlangıç No"
                            value={editingKocan ? editingKocan.baslangic_no : newKocan.baslangic_no}
                            onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, baslangic_no: e.target.value }) : setNewKocan({ ...newKocan, baslangic_no: e.target.value })}
                            placeholder="1"
                            className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BİTİŞ NO (OPSİYONEL)</label>
                         <input
                            type="number"
                            title="Bitiş No"
                            value={editingKocan ? (editingKocan.son_no || '') : newKocan.son_no}
                            onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, son_no: e.target.value }) : setNewKocan({ ...newKocan, son_no: e.target.value })}
                            placeholder="SINIRSIZ"
                            className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg text-emerald-500"
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SORUMLU MERAV</label>
                      <select 
                         title="Sorumlu Merav"
                         value={editingKocan ? editingKocan.Sorumlu_Merav_id : newKocan.Sorumlu_Merav_id}
                         onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, Sorumlu_Merav_id: e.target.value }) : setNewKocan({ ...newKocan, Sorumlu_Merav_id: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-sm uppercase"
                      >
                         <option value="">SORUMLU SEÇİNİZ...</option>
                         {personel.map(m => (
                            <option key={m.merav_id} value={m.merav_id}>{m.Ad_Soyad}</option>
                         ))}
                      </select>
                   </div>
                   <button 
                      onClick={async () => {
                         setIsSaving(true);
                         try {
                            const dataToSave = editingKocan ? editingKocan : { ...newKocan, Donem_id: ledger.id, aktif: 1 };
                            const res = await (window as any).api.saveRecord('TANIM_Sulama_Fis_Kocanlari', dataToSave);
                            if (res.success) {
                               setIsAddingKocan(false);
                               setEditingKocan(null);
                               loadData();
                            }
                         } catch (err: any) { alert(err.message); } finally { setIsSaving(false); }
                      }}
                      className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                   >
                      {isSaving ? 'KAYDEDİLİYOR...' : (editingKocan ? 'GÜNCELLEMEYİ KAYDET' : 'KOÇANI TESCİL ET')}
                   </button>
                </div>
             </DialogContent>
          </Dialog>
        </AnimatePresence>
      </div>

      <SimplifiedDistributionFormModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        newEntry={newEntry} setNewEntry={setNewEntry}
        citizens={citizens} searchCitizens={searchCitizens} setCitizens={setCitizens}
        selectedCitizenProperties={selectedCitizenProperties} loadProperties={loadProperties}
        receiptBooks={receiptBooks}
        selectedPropertySuHakki={selectedPropertySuHakki}
        setSelectedPropertySuHakki={setSelectedPropertySuHakki}
        usedMinutesForSelected={usedMinutesForSelected}
        isOverLimit={isOverLimit}
        handleCalculateTutar={handleCalculateTutar}
        fetchUsedMinutes={fetchUsedMinutes}
        handleSaveEntry={handleSaveEntry}
      />

      <SimplifiedDistributionDetailModal 
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
        onEdit={(r) => { 
          setSelectedDetailRecord(null); 
          setNewEntry({
            ...r,
            TCKN: r.Vatandas_TCKN || r.TCKN,
            Ad_Soyad: r.Ad_Soyad,
            Tarih: r.Tarih ? new Date(r.Tarih).toISOString().split('T')[0] : '',
            Tutar: r.Toplam_Tutar || 0
          }); 
          setIsAddModalOpen(true); 
        }}
        formatDate={formatDate}
      />

      {alertConfig.isOpen && <ModernAlert config={alertConfig} onClose={() => setAlertConfig({...alertConfig, isOpen: false})} />}
    </div>
  );
};

const SidebarItem = ({ collapsed, active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
  >
    <Icon size={20} className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
    {!collapsed && <span className="ml-4 text-[11px] font-black uppercase tracking-widest">{label}</span>}
  </button>
);

const QuickStat = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = {
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  };
  return (
    <div className={`p-6 rounded-[32px] border ${colors[color]} flex flex-col gap-3 shadow-sm`}>
      <Icon size={24} />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-2xl font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
};
