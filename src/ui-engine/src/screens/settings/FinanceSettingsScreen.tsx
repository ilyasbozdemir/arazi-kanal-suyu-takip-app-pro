import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Percent as TaxIcon, 
  TrendingUp as InterestIcon, 
  Plus as PlusIcon,
  Save as SaveIcon,
  X as XIcon,
  CheckCircle2 as CheckIcon,
  Calendar as CalendarIcon,
  ShieldCheck as ShieldIcon,
  FileText as FileIcon,
  AlertCircle as AlertIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Activity
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

type FinanceTab = 'tax' | 'interest';

export const FinanceSettingsScreen: React.FC<{ initialTab?: FinanceTab }> = ({ initialTab = 'tax' }) => {
  const [activeTab, setActiveTab] = React.useState<FinanceTab>(initialTab);
  const [taxRates, setTaxRates] = React.useState<any[]>([]);
  const [interestRates, setInterestRates] = React.useState<any[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editData, setEditData] = React.useState<any>(null);

  React.useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const table = activeTab === 'tax' ? 'TANIM_Vergi_Oranlari' : 'TANIM_Faiz_Oranlari';
      const res = await (window as any).electron.ipcRenderer.invoke('get-db-data', table);
      if (res && res.success) {
        if (activeTab === 'tax') setTaxRates(res.data);
        else setInterestRates(res.data);
      }
    } catch (err) {
      console.error("❌ VERİ YÜKLEME HATASI:", err);
    }
  };

  const openForm = (data: any = null) => {
    setEditData(data ? { ...data } : (activeTab === 'tax' ? {
      vergi_adi: '',
      vergi_orani: 20,
      kod: '',
      aciklama: '',
      is_active: 1
    } : {
      faiz_adi: '',
      faiz_orani: 5,
      periyot: 'AYLIK',
      dayanak_mevzuat: '',
      yururluluk_tarihi: new Date().toISOString().split('T')[0],
      is_active: 1
    }));
    setShowForm(true);
  };

  const handleSave = async () => {
    const table = activeTab === 'tax' ? 'TANIM_Vergi_Oranlari' : 'TANIM_Faiz_Oranlari';
    
    // Simple validation
    if (activeTab === 'tax' && (!editData.vergi_adi || editData.vergi_orani === undefined)) {
       alert("Lütfen tüm zorunlu alanları doldurun."); return;
    }
    if (activeTab === 'interest' && (!editData.faiz_adi || !editData.faiz_orani || !editData.periyot)) {
       alert("Lütfen tüm zorunlu alanları doldurun."); return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...editData,
        id: editData.id || crypto.randomUUID()
      };

      const res = await (window as any).electron.ipcRenderer.invoke('save-record', table, payload);
      if (res.success) {
        setShowForm(false);
        loadData();
      }
    } catch (err) {
      console.error("❌ KAYIT HATASI:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: number) => {
     try {
        const table = activeTab === 'tax' ? 'TANIM_Vergi_Oranlari' : 'TANIM_Faiz_Oranlari';
        await (window as any).electron.ipcRenderer.invoke('save-record', table, { id, is_active: currentStatus === 1 ? 0 : 1 });
        loadData();
     } catch (err) {
        console.error("❌ DURUM GÜNCELLEME HATASI:", err);
     }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="p-8 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white flex items-center gap-4">
              {activeTab === 'tax' ? <TaxIcon className="text-emerald-500" size={40} /> : <InterestIcon className="text-primary-500" size={40} />}
              {activeTab === 'tax' ? 'VERGİ VE KDV TANIMLARI' : 'GECİKME ZAMMI VE FAİZ'}
            </h1>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mt-2">
              MALİ PARAMETRELER VE YASAL ORANLARIN YÖNETİM PANELİ
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-slate-200 dark:bg-white/5 p-1.5 rounded-[24px]">
                <button 
                  onClick={() => setActiveTab('tax')}
                  className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tax' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  VERGİ ORANLARI
                </button>
                <button 
                  onClick={() => setActiveTab('interest')}
                  className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'interest' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  FAİZ / GECİKME ZAMMI
                </button>
             </div>
             
             <button 
               onClick={() => openForm()}
               className="flex items-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-[24px] font-black italic text-xs uppercase tracking-tighter shadow-2xl hover:scale-105 active:scale-95 transition-all"
             >
               <PlusIcon size={20} /> YENİ ORAN TANIMLA
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         <div className="max-w-6xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
               >
                  {(activeTab === 'tax' ? taxRates : interestRates).map((rate) => (
                    <div 
                      key={rate.id}
                      className={`group relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 ${rate.is_active === 0 ? 'grayscale opacity-60' : ''}`}
                    >
                       <div className="flex items-center justify-between mb-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'tax' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'}`}>
                             {activeTab === 'tax' ? <TaxIcon size={28} /> : <InterestIcon size={28} />}
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => toggleActive(rate.id, rate.is_active)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${rate.is_active === 1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
                               title={rate.is_active === 1 ? 'Pasifleştir' : 'Aktifleştir'}
                             >
                                <CheckIcon size={18} />
                             </button>
                             <button 
                               onClick={() => openForm(rate)}
                               className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                               title="Düzenle"
                             >
                                <SettingsIcon size={18} />
                             </button>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab === 'tax' ? 'VERGİ ADI' : 'FAİZ TÜRÜ'}</p>
                             <h3 className="text-xl font-black italic text-slate-800 dark:text-white uppercase tracking-tighter truncate">
                                {activeTab === 'tax' ? rate.vergi_adi : rate.faiz_adi}
                             </h3>
                          </div>

                          <div className="flex items-baseline gap-2">
                             <p className="text-5xl font-black italic text-slate-800 dark:text-white tracking-tighter">
                                {activeTab === 'tax' ? rate.vergi_orani : rate.faiz_orani}
                             </p>
                             <p className="text-2xl font-black text-primary-500 italic">%</p>
                             {activeTab === 'interest' && <span className="text-[10px] font-bold text-slate-400 uppercase italic ml-2">/ {rate.periyot}</span>}
                          </div>

                          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                                <FileIcon size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">
                                   {activeTab === 'tax' ? (rate.kod || 'KOD BELİRTİLMEDİ') : (rate.dayanak_mevzuat || 'MEVZUAT BELİRTİLMEDİ')}
                                </span>
                             </div>
                             {activeTab === 'interest' && (
                               <div className="flex items-center gap-3">
                                  <CalendarIcon size={14} className="text-slate-400" />
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                     Yürürlük: {rate.yururluluk_tarihi || '-'}
                                  </span>
                               </div>
                             )}
                          </div>
                       </div>
                       
                       <div className={`absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity ${activeTab === 'tax' ? 'text-emerald-500' : 'text-primary-500'}`}>
                          {activeTab === 'tax' ? <TaxIcon size={120} /> : <InterestIcon size={120} />}
                       </div>
                    </div>
                  ))}
                  
                  {(activeTab === 'tax' ? taxRates : interestRates).length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300">
                          <Activity size={48} />
                       </div>
                       <div className="space-y-2">
                          <p className="text-xl font-black italic text-slate-800 dark:text-white uppercase">HENÜZ TANIMLAMA YAPILMAMIŞ</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sistemin çalışması için en az bir aktif oran tanımlanmalıdır.</p>
                       </div>
                    </div>
                  )}
               </motion.div>
            </AnimatePresence>
         </div>
      </main>

      {/* Modal Form */}
      <Dialog.Root open={showForm} onOpenChange={setShowForm}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-xl translate-x-[-50%] translate-y-[-50%] p-6">
               <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col">
                  <div className="p-10 pb-0 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl ${activeTab === 'tax' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary-500 shadow-primary-500/20'}`}>
                           {editData?.id ? <SettingsIcon size={28} /> : <PlusIcon size={28} />}
                        </div>
                        <div>
                           <Dialog.Title className="text-2xl font-black italic text-slate-800 dark:text-white uppercase tracking-tighter">
                              {editData?.id ? 'TANIM DÜZENLEME' : 'YENİ ORAN GİRİŞİ'}
                           </Dialog.Title>
                           <Dialog.Description className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              MALİ PARAMETRE TANIMLAMA FORMU
                           </Dialog.Description>
                        </div>
                     </div>
                     <Dialog.Close className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all">
                        <XIcon size={24} />
                     </Dialog.Close>
                  </div>

                  <div className="p-10 space-y-6">
                     {activeTab === 'tax' ? (
                       <>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Vergi / KDV Adı</label>
                             <input 
                               value={editData?.vergi_adi || ''}
                               onChange={e => setEditData({...editData, vergi_adi: e.target.value})}
                               className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase focus:ring-2 ring-emerald-500/20"
                               placeholder="Örn: KDV %20"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Vergi Oranı (%)</label>
                                <input 
                                  type="number"
                                  title="Vergi Oranı"
                                  value={editData?.vergi_orani || ''}
                                  onChange={e => setEditData({...editData, vergi_orani: parseFloat(e.target.value)})}
                                  className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-black text-2xl text-emerald-600 dark:text-emerald-400"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Muhasebe Kodu</label>
                                <input 
                                  value={editData?.kod || ''}
                                  onChange={e => setEditData({...editData, kod: e.target.value})}
                                  className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase focus:ring-2 ring-emerald-500/20"
                                  placeholder="Örn: 391.01"
                                />
                             </div>
                          </div>
                       </>
                     ) : (
                       <>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Faiz / Zam Adı</label>
                             <input 
                               value={editData?.faiz_adi || ''}
                               onChange={e => setEditData({...editData, faiz_adi: e.target.value})}
                               className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase focus:ring-2 ring-primary-500/20"
                               placeholder="Örn: Gecikme Zammı"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Oran (%)</label>
                                <input 
                                  type="number"
                                  title="Faiz Oranı"
                                  value={editData?.faiz_orani || ''}
                                  onChange={e => setEditData({...editData, faiz_orani: parseFloat(e.target.value)})}
                                  className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-black text-2xl text-primary-600 dark:text-primary-400"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Periyot</label>
                                <select 
                                  title="Periyot Seçimi"
                                  value={editData?.periyot || 'AYLIK'}
                                  onChange={e => setEditData({...editData, periyot: e.target.value})}
                                  className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase appearance-none"
                                >
                                   <option value="GUNLUK">GÜNLÜK</option>
                                   <option value="AYLIK">AYLIK</option>
                                   <option value="YILLIK">YILLIK</option>
                                </select>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Hukuki Dayanak / Mevzuat</label>
                             <input 
                               value={editData?.dayanak_mevzuat || ''}
                               onChange={e => setEditData({...editData, dayanak_mevzuat: e.target.value})}
                               className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-medium text-slate-800 dark:text-white focus:ring-2 ring-primary-500/20"
                               placeholder="Örn: 6183 Sayılı Kanun 51. Madde"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Yürürlük Tarihi</label>
                             <input 
                               type="date"
                               title="Yürürlük Tarihi"
                               value={editData?.yururluluk_tarihi || ''}
                               onChange={e => setEditData({...editData, yururluluk_tarihi: e.target.value})}
                               className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-bold text-slate-800 dark:text-white"
                             />
                          </div>
                       </>
                     )}

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Resmi Açıklama</label>
                        <textarea 
                          value={editData?.aciklama || ''}
                          onChange={e => setEditData({...editData, aciklama: e.target.value})}
                          rows={2}
                          className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] border-none outline-none font-medium text-slate-800 dark:text-slate-200 resize-none"
                          placeholder="İç denetim ve raporlama için açıklama giriniz..."
                        />
                     </div>
                  </div>

                  <div className="p-10 pt-0">
                     <button 
                       onClick={handleSave}
                       disabled={isSaving}
                       className={`w-full py-6 rounded-[24px] font-black uppercase text-sm tracking-[0.2em] text-white shadow-2xl transition-all flex items-center justify-center gap-4 ${activeTab === 'tax' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20'}`}
                     >
                        {isSaving ? 'KAYDEDİLİYOR...' : (
                          <>
                             <SaveIcon size={20} />
                             {editData?.id ? 'GÜNCELLEMELERİ KAYDET' : 'YENİ ORANI SİSTEME İŞLE'}
                          </>
                        )}
                     </button>
                  </div>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
