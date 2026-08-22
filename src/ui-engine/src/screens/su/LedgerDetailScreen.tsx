import React, { useState, useEffect } from 'react';
import {
   Droplets, ArrowLeft, FileText, Users, Activity, LayoutGrid, DollarSign, Clock, BarChart3, ChevronRight,
   Search, Plus, RefreshCcw, Loader2, Settings, ShieldCheck,
   User, BookOpen, AlertCircle, Edit2, Trash2,
   ChevronLeft, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DistributionGrid } from '@renderer/screens/su/components/DistributionGrid';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@renderer/components/ui/dialog";
import { MeravAvatar, NavButton, StatCard, ActionButton, ProgressItem } from './LedgerDetailComponents';
import { useAppStore } from '../../store/useAppStore';

interface LedgerDetailScreenProps {
   tabId: string;
   data: {
      ledger: any;
      mahalle: any;
      activeTab?: string;
   };
   onClose: () => void;
   addTab?: (tab: any) => void;
}


export const LedgerDetailScreen: React.FC<LedgerDetailScreenProps> = ({ tabId, data, onClose, addTab }) => {
   const { ledger, mahalle, activeTab } = data;
   const [personel, setPersonel] = useState<any[]>([]);
   const [kocanlar, setKocanlar] = useState<any[]>([]);
   const [stats, setStats] = useState<any>({
      totalCount: 0, totalAmount: 0, totalHours: 0, paidCount: 0, unpaidCount: 0
   });

   const [activeSubView, setActiveSubView] = useState<string>(activeTab === 'defter' ? 'grid' : 'dashboard');
   const [isLoading, setIsLoading] = useState(true);
   const [isAddingMerav, setIsAddingMerav] = useState(false);
   const [allMeravs, setAllMeravs] = useState<any[]>([]);
   const [selectedMeravId, setSelectedMeravId] = useState('');
   const [isSaving, setIsSaving] = useState(false);
   const [isAddingKocan, setIsAddingKocan] = useState(false);
   const [editingKocan, setEditingKocan] = useState<any>(null);
   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
   const [activePrice, setActivePrice] = useState<any>(null);
   const [sidebarSearch, setSidebarSearch] = useState('');
   const [newKocan, setNewKocan] = useState({
      defter_adi: '',
      baslangic_no: '',
      son_no: '',
      Sorumlu_Merav_id: ''
   });

   const loadData = async (isSilent = false) => {
      console.log("[LEDGER_DETAIL_LOAD_START]", { Ledger_id: ledger?.id });
      if (!isSilent) setIsLoading(true);
      try {
         const [pRes, kRes, sRes] = await Promise.all([
            (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
          SELECT 
            r.id as rel_id, 
            r.Defter_id,
            m.id as merav_id, 
            m.Vatandas_Id,
            (COALESCE(v.Ad, '') || ' ' || COALESCE(v.Soyad, '')) as Ad_Soyad, 
            v.Telefon,
            v.Profil_Foto_Yolu
          FROM REL_Defter_Merav r
          LEFT JOIN TANIM_Meravlar m ON r.Merav_id = m.id
          LEFT JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
          WHERE (r.deleted_at IS NULL OR r.deleted_at = '') 
          AND r.Defter_id = ?
        `, [ledger?.id]),
            (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
              SELECT k.*, (v.Ad || ' ' || v.Soyad) as Sorumlu_Adi 
              FROM TANIM_Sulama_Fis_Kocanlari k
              LEFT JOIN TANIM_Meravlar m ON k.Sorumlu_Merav_id = m.id
              LEFT JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
              WHERE k.Donem_id = ?
            `, [ledger.id]),
            (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
          SELECT 
            COUNT(*) as totalCount, 
            SUM(t.Toplam_Tutar) as totalAmount, 
            SUM(t.Kullanim_Saati) as totalHours,
            SUM(CASE WHEN th.Durum = 'Ödendi' THEN 1 ELSE 0 END) as paidCount,
            SUM(CASE WHEN th.Durum != 'Ödendi' OR th.Durum IS NULL THEN 1 ELSE 0 END) as unpaidCount
          FROM DATA_Dagitim_Kayitlar t
          LEFT JOIN MUHASEBE_Tahakkuk th ON t.id = th.Fis_id
          WHERE t.Donem_id = ? AND (t.deleted_at IS NULL OR t.deleted_at = '')
        `, [ledger.id])
         ]);

         if (pRes.success) setPersonel(pRes.data || []);
         if (kRes.success) setKocanlar(kRes.data || []);
         if (sRes.success && sRes.data?.[0]) {
            const d = sRes.data[0];
            setStats({
               totalCount: Number(d.totalCount) || 0,
               totalAmount: Number(d.totalAmount) || 0,
               totalHours: Number(d.totalHours) || 0,
               paidCount: Number(d.paidCount) || 0,
               unpaidCount: Number(d.unpaidCount) || 0
            });
         }

         // 🛡️ Sarsılmaz Birim Fiyat Yükleme
         const priceRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql',
            "SELECT * FROM TANIM_Su_Ucretleri WHERE is_active = 1 LIMIT 1"
         );
         if (priceRes.success && priceRes.data?.[0]) {
            setActivePrice(priceRes.data[0]);
         }
      } catch (err) {
         console.error("[LEDGER_DETAIL_LOAD_CRITICAL_ERROR]", err);
      } finally {
         setTimeout(() => setIsLoading(false), 300);
      }
   };

   useEffect(() => { loadData(); }, [ledger?.id]);

   if (isLoading) {
      return (
         <div className="flex flex-col h-full items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Defter Hazırlanıyor...</p>
         </div>
      );
   }

   const mahalleName = mahalle?.Mahalle_Adi || "Bilinmeyen Mahalle";
   const year = ledger?.Baslangic_Yili || new Date().getFullYear();

   return (
      <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
         <motion.div
            animate={{ width: isSidebarCollapsed ? 80 : 288 }}
            className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 z-30 transition-all duration-300 relative"
         >
            <button
               onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
               className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all z-50 shadow-sm"
            >
               {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}



            </button>

            <div className={`p-6 border-b border-slate-100 dark:border-white/5 ${isSidebarCollapsed ? 'items-center px-0' : ''} flex flex-col`}>
               <div className="flex items-center gap-3 mb-6">
                  <button onClick={onClose} title="Defteri Kapat" className="text-slate-400 hover:text-slate-900 dark:hover:white transition-colors shrink-0">
                     <ArrowLeft size={20} />
                  </button>
                  {!isSidebarCollapsed && (
                     <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
                        <Droplets size={22} />
                     </div>
                  )}
               </div>
               {!isSidebarCollapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <h2 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight truncate">{mahalleName}</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{year} SULAMA SEZONU</p>
                  </motion.div>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
               <div className="space-y-4">
                  <div className="space-y-1">
                     {!isSidebarCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">ARAMA</span>}
                     <div className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-4'} h-12 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group-hover:border-primary-500/30 transition-all`}>
                        <Search size={18} className="text-slate-400 shrink-0" />
                        {!isSidebarCollapsed && (
                           <input
                              type="text"
                              placeholder="FİŞLERDE ARA..."
                              value={sidebarSearch}
                              onChange={(e) => setSidebarSearch(e.target.value)}
                              className="ml-3 bg-transparent border-none outline-none w-full text-[11px] font-black uppercase text-slate-700 dark:text-white placeholder:text-slate-300"
                           />
                        )}
                     </div>
                  </div>

                  <div className="space-y-1">
                     {!isSidebarCollapsed && <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block mb-2">MENÜ</span>}
                     <NavButton collapsed={isSidebarCollapsed} active={activeSubView === 'dashboard'} onClick={() => setActiveSubView('dashboard')} icon={LayoutGrid} label="Defter Özeti" />
                     <NavButton collapsed={isSidebarCollapsed} active={activeSubView === 'grid'} onClick={() => setActiveSubView('grid')} icon={FileText} label="Defter İçeriği" />
                     <NavButton collapsed={isSidebarCollapsed} active={activeSubView === 'personel'} onClick={() => setActiveSubView('personel')} icon={Users} label="Görevli Meravlar" />
                     <NavButton collapsed={isSidebarCollapsed} active={activeSubView === 'kocanlar'} onClick={() => setActiveSubView('kocanlar')} icon={BookOpen} label="Fiş Koçanları" />
                  </div>
               </div>
            </div>

            <div className={`p-4 border-t border-slate-100 dark:border-white/5 space-y-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
               {activePrice && !isSidebarCollapsed ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-2">
                     <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        <DollarSign size={12} /> AKTİF BİRİM FİYAT
                     </div>
                     <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                           <span>GÜNDÜZ</span>
                           <span className="font-black text-slate-800 dark:text-white italic">{activePrice.gunduz_fiyat} ₺</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                           <span>GECE</span>
                           <span className="font-black text-slate-800 dark:text-white italic">{activePrice.gece_fiyat} ₺</span>
                        </div>
                     </div>
                  </div>
               ) : activePrice && (
                  <div title="Aktif Birim Fiyat" className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                     <DollarSign size={20} />
                  </div>
               )}
            </div>
         </motion.div>

         <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
               {activeSubView === 'dashboard' && (
                  <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                     <div className="max-w-[1200px] mx-auto space-y-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                           <div className="space-y-2">
                              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">DAĞITIM DEFTERİ</h1>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">{mahalleName} Mahallesi Canlı Fişler</p>
                           </div>
                           <button title="Verileri Yenile" onClick={() => loadData(true)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary-500 transition-all shadow-sm active:scale-95"><RefreshCcw size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <StatCard icon={FileText} color="blue" label="Toplam Fiş" value={stats.totalCount} sub="Sezonluk İşlem" />
                           <StatCard icon={Clock} color="blue" label="Sulama Saati" value={`${Math.round(stats.totalHours)} s`} sub="Toplam Süre" />
                           <StatCard icon={DollarSign} color="emerald" label="Tahakkuk" value={`${stats.totalAmount.toLocaleString('tr-TR')} ₺`} sub="Toplam Alacak" />
                           <StatCard icon={Activity} color="rose" label="Bekleyen" value={stats.unpaidCount} sub="Tahsilat Bekleyen" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 space-y-8">
                              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm">
                                 <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-8">HIZLI İŞLEMLER</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                    <ActionButton onClick={() => setActiveSubView('grid')} icon={Plus} label="Yeni Fiş Ekle" desc="Saha veri girişi" color="primary" />
                                    <ActionButton onClick={() => addTab?.({ id: 'reports', type: 'reports', title: 'Raporlar' })} icon={BarChart3} label="Sezonluk Rapor" desc="Analizler" color="slate" />
                                 </div>
                              </div>
                           </div>
                           <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-6 relative z-10">ÖDEME DURUMU</h3>
                              <div className="space-y-6 relative z-10">
                                 <ProgressItem label="Tahsil Edilen" value={stats.paidCount} total={stats.totalCount} color="bg-emerald-500" />
                                 <ProgressItem label="Tahakkuk Kalan" value={stats.unpaidCount} total={stats.totalCount} color="bg-blue-500" />
                              </div>
                              <DollarSign size={160} className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeSubView === 'grid' && (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col pt-6">
                     <div className="flex-1 overflow-hidden relative">
                        <DistributionGrid
                           ledgerId={ledger.id}
                           mahalleId={ledger.Mahalle_id}
                           mahalleName={mahalleName}
                           yil={year}
                           externalSearchTerm={sidebarSearch}
                           pricing={activePrice}
                           receiptBooks={kocanlar}
                        />
                     </div>
                  </motion.div>
               )}

               {activeSubView === 'personel' && (
                  <motion.div key="personel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                     <div className="max-w-[1000px] mx-auto space-y-8">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">GÖREVLİ MERAVLAR</h2>
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
                                                loadData(true); 
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {personel.map((p: any) => (
                              <div
                                 key={p.rel_id}
                                 onClick={() => addTab?.({
                                    id: `merav-${p.merav_id}`,
                                    type: 'detail',
                                    table: 'TANIM_Meravlar',
                                    title: p.Ad_Soyad,
                                    data: { id: p.merav_id }
                                 })}
                                 className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-6 group hover:border-primary-500/30 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary-500/5"
                              >
                                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors overflow-hidden">
                                    <MeravAvatar path={p.Profil_Foto_Yolu} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-black text-slate-800 dark:text-white uppercase truncate">{p.Ad_Soyad}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-primary-600 dark:text-primary-400"><ShieldCheck size={12} /> <span className="uppercase tracking-tighter italic">Saha Yetkisi Aktif</span></div>
                                 </div>
                                 <button
                                    title="Görevi Sonlandır / Arşivle"
                                    onClick={async (e) => {
                                       e.stopPropagation(); // 🛡️ Sarsılmaz Koruma: Detay sayfası açılmasın
                                       const ok = await (window as any).electron.ipcRenderer.invoke('show-confirm', {
                                          title: 'GÖREV SONLANDIRMA',
                                          message: `${p.Ad_Soyad} isimli görevlinin bu defterdeki yetkisini sonlandırmak istediğinize emin misiniz?`,
                                          type: 'warning'
                                       });
                                       if (!ok) return;

                                       const confirm = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql',
                                          `UPDATE REL_Defter_Merav SET Bitis_Tarihi = ?, Aktif = 0, deleted_at = ? WHERE id = ?`,
                                          [new Date().toISOString(), new Date().toISOString(), p.rel_id]
                                       );
                                       if (confirm.success) loadData(true);
                                    }} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-300 hover:text-rose-500 transition-colors relative z-10"><RefreshCcw size={18} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeSubView === 'kocanlar' && (
                  <motion.div key="kocanlar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                     <div className="max-w-[1000px] mx-auto space-y-8">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                           <div className="space-y-1">
                              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">FİŞ KOÇANLARI</h2>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">BU DEFTERE ÖZEL KOÇAN YÖNETİMİ</p>
                           </div>
                           <button onClick={() => {
                              const defaultMeravId = personel.length > 0 ? personel[0].merav_id : '';
                              setNewKocan({ ...newKocan, Sorumlu_Merav_id: defaultMeravId });
                              setIsAddingKocan(true);
                           }} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"><Plus size={16} /> YENİ KOÇAN TESCİL ET</button>
                        </div>

                        <Dialog open={isAddingKocan || !!editingKocan} onOpenChange={(val) => { if (!val) { setIsAddingKocan(false); setEditingKocan(null); } }}>
                           <DialogContent className="sm:max-w-[450px]">
                              <DialogHeader>
                                 <DialogTitle>{editingKocan ? 'KOÇAN DÜZENLEME' : 'YENİ KOÇAN TESCİLİ'}</DialogTitle>
                                 <DialogDescription>{mahalleName} - {year} SEZONU</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 py-8">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SERİ NO / DEFTER ADI</label>
                                    <input
                                       type="text"
                                       value={editingKocan ? editingKocan.defter_adi : newKocan.defter_adi}
                                       onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, defter_adi: e.target.value }) : setNewKocan({ ...newKocan, defter_adi: e.target.value })}
                                       placeholder="Örn: SERİ-A"
                                       className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg"
                                    />
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 flex items-start gap-3">
                                       <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5"><Info size={12} /></div>
                                       <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 leading-normal uppercase tracking-tighter italic">
                                          <span className="font-black">💡 YÖNETİMSEL ÖNERİ:</span> Defterlerinizi <span className="font-black">"{mahalleName} - {year}-A"</span> formatında isimlendirirseniz çok daha düzenli bir takip ve yönetim sağlarsınız.
                                       </p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BAŞLANGIÇ NO</label>
                                       <input
                                          type="number"
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
                                          value={editingKocan ? (editingKocan.son_no || '') : newKocan.son_no}
                                          onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, son_no: e.target.value }) : setNewKocan({ ...newKocan, son_no: e.target.value })}
                                          placeholder="BOŞ BIRAKIRSANIZ SINIRSIZ"
                                          className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black text-lg text-emerald-500 placeholder:text-[10px] placeholder:text-slate-300"
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">ZİMMETLENECEK MERAV</label>
                                    <select
                                       title="Sorumlu Merav Seç"
                                       value={editingKocan ? editingKocan.Sorumlu_Merav_id : newKocan.Sorumlu_Merav_id}
                                       onChange={(e) => editingKocan ? setEditingKocan({ ...editingKocan, Sorumlu_Merav_id: e.target.value }) : setNewKocan({ ...newKocan, Sorumlu_Merav_id: e.target.value })}
                                       className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-black uppercase text-xs"
                                    >
                                       <option value="">SEÇİNİZ...</option>
                                       {personel.map(p => <option key={p.merav_id} value={p.merav_id}>{p.Ad_Soyad}</option>)}
                                    </select>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <button onClick={() => { setIsAddingKocan(false); setEditingKocan(null); }} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">İPTAL</button>
                                 <button
                                    disabled={isSaving}
                                    onClick={async () => {
                                       setIsSaving(true);
                                       try {
                                          const payload = editingKocan ? {
                                             ...editingKocan,
                                             baslangic_no: Number(editingKocan.baslangic_no),
                                             son_no: editingKocan.son_no ? Number(editingKocan.son_no) : 0
                                          } : {
                                             Donem_id: ledger.id,
                                             defter_adi: newKocan.defter_adi,
                                             baslangic_no: Number(newKocan.baslangic_no),
                                             son_no: newKocan.son_no ? Number(newKocan.son_no) : 0,
                                             Sorumlu_Merav_id: newKocan.Sorumlu_Merav_id,
                                             Zimmet_Tarihi: new Date().toISOString(),
                                             aktif: 1
                                          };
                                          await (window as any).electron.ipcRenderer.invoke('save-record', 'TANIM_Sulama_Fis_Kocanlari', payload);
                                          setIsAddingKocan(false);
                                          setEditingKocan(null);
                                          setNewKocan({ defter_adi: '', baslangic_no: '', son_no: '', Sorumlu_Merav_id: mahalle?.Sorumlu_Merav_id || '' });
                                          // 🛡️ Sarsılmaz Senkron: Veritabanının mühürlenmesi için ufak bir nefes al
                                          setTimeout(() => loadData(true), 300);
                                       } catch (e: any) { alert("Hata: " + e.message); } finally { setIsSaving(false); }
                                    }}
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                 >
                                    {isSaving ? 'İŞLENİYOR...' : (editingKocan ? 'GÜNCELLE' : 'KOÇANI ONAYLA')}
                                 </button>
                              </div>
                           </DialogContent>
                        </Dialog>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {kocanlar.map((k: any) => (
                              <div key={k.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><BookOpen size={28} /></div>
                                    <div>
                                       <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">
                                          {k.defter_adi || 'KAYITLI KOÇAN'}
                                       </div>
                                       <h4 className="text-xl font-black text-slate-800 dark:text-white italic tracking-tighter">#{k.baslangic_no} - {k.son_no ? `#${k.son_no}` : '∞'}</h4>
                                       <p className="text-[9px] font-bold text-primary-500 uppercase tracking-widest mt-1">SORUMLU: {k.Sorumlu_Adi || 'ATANMAMIŞ'}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-2">
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-full border border-emerald-500/20 tracking-widest">KULLANIMA HAZIR</div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                       <button title="Koçanı Düzenle" onClick={() => setEditingKocan(k)} className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"><Edit2 size={16} /></button>
                                       <button title="Koçanı Sil" onClick={async () => {
                                          // 🛡️ Sarsılmaz Güvenlik: Koçan boş mu kontrol et
                                          const checkRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', "SELECT COUNT(*) as sayi FROM DATA_Dagitim_Kayitlar WHERE Makbuz_Defter_id = ?", [k.id]);
                                          if (checkRes.success && checkRes.data[0].sayi > 0) {
                                             await (window as any).electron.ipcRenderer.invoke('show-alert', {
                                                title: "SİLEMEZSİNİZ!",
                                                message: `Bu koçan üzerinde ${checkRes.data[0].sayi} adet sulama kaydı bulunmaktadır. Dolu koçanlar sarsılmaz bir nizamla silinemez!`,
                                                type: 'error'
                                             });
                                             return;
                                          }

                                          const confirm = await (window as any).electron.ipcRenderer.invoke('show-confirm', { message: "Bu koçanı silmek istediğinize emin misiniz?", title: "KOÇAN SİLME" });
                                          if (confirm) {
                                             await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', "DELETE FROM TANIM_Sulama_Fis_Kocanlari WHERE id = ?", [k.id]);
                                             loadData(true);
                                          }
                                       }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           {kocanlar.length === 0 && (
                              <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[40px] text-slate-400 space-y-4">
                                 <AlertCircle size={48} className="opacity-20" />
                                 <p className="text-xs font-black uppercase tracking-widest opacity-40 italic">Bu defter için henüz koçan tescil edilmemiş</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
};

