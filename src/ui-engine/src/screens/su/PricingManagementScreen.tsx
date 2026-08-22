import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel as GavelIcon, 
  History as HistoryIcon, 
  CheckCircle2 as CheckIcon, 
  Plus as PlusIcon,
  Save as SaveIcon,
  ShieldCheck as ShieldIcon,
  Calendar as CalendarIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  AlertCircle as AlertIcon,
  Settings as SettingsIcon,
  X as XIcon
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  getDayanakLabel, 
  getNumberLabel, 
  getDayanakPlaceholder, 
  getDayanakHint 
} from './pricingHelpers';

export const PricingManagementScreen: React.FC = () => {
  const [tariffs, setTariffs] = React.useState<any[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);

  const [newTariff, setNewTariff] = React.useState({
    dayanak_tipi: 'MECLIS_KARARI',
    dayanak_no: '',
    dayanak_tarihi: new Date().toISOString().split('T')[0],
    gunduz_baslangic: '08:00',
    gece_baslangic: '20:00',
    gunduz_fiyat: '',
    gece_fiyat: '',
    aciklama: '',
    is_active: 0
  });

  React.useEffect(() => {
    loadTariffs();
  }, []);

  const openForm = (data: any = null) => {
    if (data) {
      setEditId(data.id);
      setNewTariff({ ...data });
    } else {
      setEditId(null);
      setNewTariff({
        dayanak_tipi: 'MECLIS_KARARI',
        dayanak_no: '',
        dayanak_tarihi: new Date().toISOString().split('T')[0],
        gunduz_baslangic: '08:00',
        gece_baslangic: '20:00',
        gunduz_fiyat: '',
        gece_fiyat: '',
        aciklama: '',
        is_active: 0
      });
    }
    setShowForm(true);
  };

  const loadTariffs = async () => {
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Su_Ucretleri');

      if (res && res.success && Array.isArray(res.data)) {
        setTariffs(res.data);
      } else {
        console.error("❌ TARİFE YÜKLEME HATASI:", res?.error || "Veri formatı uyumsuz");
        setTariffs([]);
      }
    } catch (err) {
      console.error("❌ BEKLENMEDİK KRİTİK HATA:", err);
      setTariffs([]);
    }
  };

  const handleSave = async () => {
    if (!newTariff.dayanak_no || !newTariff.gunduz_fiyat) {
      alert("Lütfen Dayanak No ve Fiyat bilgilerini eksiksiz giriniz.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...newTariff,
        id: editId || crypto.randomUUID(),
        is_active: editId ? newTariff.is_active : 0
      };

      const res = await (window as any).electron.ipcRenderer.invoke('save-record', 'TANIM_Su_Ucretleri', payload);
      if (res.success) {
        setShowForm(false);
        loadTariffs();
      }
    } catch (err) {
      console.error("❌ KAYIT HATASI:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activateTariff = async (id: string) => {
    try {
      await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', "UPDATE TANIM_Su_Ucretleri SET is_active = 0");
      await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `UPDATE TANIM_Su_Ucretleri SET is_active = 1 WHERE id = ?`, [id]);
      loadTariffs();
    } catch (err) {
      console.error("❌ AKTİVASYON HATASI:", err);
    }
  };

  const activeTariff = Array.isArray(tariffs) ? tariffs.find(t => t?.is_active === 1) : null;
  const pastTariffs = Array.isArray(tariffs) 
    ? tariffs
        .filter(t => t && !(t.is_active === 1))
        .sort((a, b) => {
          const dateA = a?.dayanak_tarihi || '';
          const dateB = b?.dayanak_tarihi || '';
          return String(dateB).localeCompare(String(dateA));
        })
    : [];

  return (
    <div className="p-8 h-full flex flex-col space-y-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      {!Array.isArray(tariffs) && (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
          <AlertIcon size={64} className="text-rose-500 mb-6 animate-pulse" />
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">SİSTEMSEL BAĞLANTI HATASI</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Veritabanı tarifeleri yükleyemedi. Lütfen sistemi yenileyiniz.</p>
        </div>
      )}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white flex items-center gap-4">
            <GavelIcon className="text-primary-500" size={40} />
            SU ÜCRET TARİFELERİ
          </h1>
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mt-2">
            MECLİS / ENCÜMEN KARARLARI, KANUN VE GENELGE DAYANAKLI BİRİM FİYAT YÖNETİMİ
          </p>
        </div>

        <button 
          onClick={() => openForm()}
          className="flex items-center gap-3 px-8 py-5 bg-primary-500 text-white rounded-[24px] font-black italic text-xs uppercase tracking-tighter shadow-2xl hover:scale-105 transition-all"
        >
          <PlusIcon size={20} /> YENİ DAYANAK / TARİFE EKLE
        </button>
      </header>

      <section className="space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <CheckIcon size={16} className="text-emerald-500" />
          YÜRÜRLÜĞE ALINMIŞ AKTİF BİRİM FİYATLAR
        </h2>
        
        {activeTariff ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[48px] p-12 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden cursor-pointer"
            onClick={() => openForm(activeTariff)}
            title="Düzenlemek için tıkla"
          >
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-10 transition-opacity">
               <GavelIcon size={180} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">GÜNDÜZ BİRİM FİYATI</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-6xl font-black italic text-slate-800 dark:text-white">{activeTariff.gunduz_fiyat || 0}</p>
                   <p className="text-2xl font-black text-emerald-500 italic">₺</p>
                 </div>
              </div>

              <div className="space-y-2 border-l border-slate-100 dark:border-white/5 pl-12">
                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">GECE BİRİM FİYATI</p>
                 <div className="flex items-baseline gap-2">
                   <p className="text-6xl font-black italic text-slate-800 dark:text-white">{activeTariff.gece_fiyat || 0}</p>
                   <p className="text-2xl font-black text-indigo-500 italic">₺</p>
                 </div>
              </div>

              <div className="space-y-6 lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <SunIcon className="text-blue-500" size={24} />
                       <div>
                          <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Gündüz Tarifesi Başlangıç</p>
                          <p className="text-xl font-black italic dark:text-white">{activeTariff.gunduz_baslangic}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <MoonIcon className="text-indigo-400" size={24} />
                       <div>
                          <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Gece Tarifesi Başlangıç</p>
                          <p className="text-xl font-black italic dark:text-white">{activeTariff.gece_baslangic}</p>
                       </div>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{getDayanakLabel(activeTariff.dayanak_tipi)}</p>
                      <p className="text-xs font-black italic text-emerald-600 dark:text-emerald-400 uppercase">{activeTariff.dayanak_no} — {activeTariff.dayanak_tarihi}</p>
                      {activeTariff.aciklama && (
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2 italic border-l-2 border-emerald-500/30 pl-3 leading-relaxed">
                          {activeTariff.aciklama}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 italic">Dayanak Tarihi: {activeTariff.dayanak_tarihi || '-'}</p>
                 </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-12 bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-500/20 rounded-[48px] text-center">
             <p className="text-blue-600 dark:text-blue-400 font-black italic uppercase tracking-widest">Henüz yürürlüğe alınmış aktif bir tarife kararı bulunmamaktadır.</p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <HistoryIcon size={16} />
            GEÇMİŞ RESMİ DAYANAKLAR VE KARARLAR
          </h2>
          
          <div className="space-y-4">
             {pastTariffs.map((past, idx) => (
               <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 flex items-center justify-between hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                        <CalendarIcon size={20} />
                     </div>
                     <div>
                        <p className="text-sm font-black italic dark:text-white uppercase leading-none">{past.dayanak_no}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mt-1">{getDayanakLabel(past.dayanak_tipi)} — {past.dayanak_tarihi}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Gündüz / Gece</p>
                        <p className="text-sm font-black italic text-slate-700 dark:text-white">{past.gunduz_fiyat} ₺ / {past.gece_fiyat} ₺</p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => openForm(past)}
                          className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500 transition-all"
                          title="Düzenle"
                        >
                           <SettingsIcon size={16} />
                        </button>
                        <button 
                          onClick={() => activateTariff(past.id)}
                          className="px-6 py-3 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                        >
                           YÜRÜRLÜĞE AL
                        </button>
                     </div>
                  </div>
               </div>
             ))}
             {pastTariffs.length === 0 && <p className="text-center py-8 text-slate-400 text-xs italic">Geçmiş kayıt bulunmamaktadır.</p>}
          </div>
        </section>

        <Dialog.Root open={showForm} onOpenChange={setShowForm}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            
            <Dialog.Content className="fixed left-[50%] top-[50%] z-[10001] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-300">
               <section className="relative w-full bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col no-drag">
                  {/* Modal Header */}
                  <div className="p-8 md:p-12 pb-0 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-primary-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-primary-500/20">
                         {editId ? <SettingsIcon size={28} /> : <PlusIcon size={28} />}
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-black italic text-slate-800 dark:text-white uppercase tracking-tighter">
                          {editId ? 'DAYANAK / TARİFE DÜZENLE' : 'YENİ DAYANAK / TARİFE GİRİŞİ'}
                        </Dialog.Title>
                        <Dialog.Description className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          RESMİ BİRİM FİYAT DAYANAK FORMU
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all hover:rotate-90">
                       <XIcon size={24} />
                    </Dialog.Close>
                  </div>

                  {/* Modal Body - Scrollable */}
                  <div className="p-8 md:p-12 pt-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    {editId && (
                      <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-[32px] flex items-center gap-4 animate-pulse">
                         <AlertIcon size={20} className="text-blue-600 shrink-0" />
                         <p className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase leading-tight">
                           DİKKAT: Düzenlediğiniz bu kayıt aktif ise tüm su tahakkuk hesaplamaları anında güncellenecektir.
                         </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label htmlFor="dayanak_tipi" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6">Resmi Dayanak Türü</label>
                      <select 
                        id="dayanak_tipi"
                        value={newTariff.dayanak_tipi} 
                        onChange={e => setNewTariff({...newTariff, dayanak_tipi: e.target.value})} 
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase focus:ring-2 ring-primary-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="MECLIS_KARARI">KURUM MECLİS KARARI</option>
                        <option value="ENCUMEN_KARARI">ENCÜMEN KARARI</option>
                        <option value="KANUN">KANUN / MEVZUAT</option>
                        <option value="GENELGE">BAKANLIK GENELGESİ</option>
                        <option value="UST_YAZI">ÜST YAZI / RESMİ YAZIŞMA</option>
                        <option value="DIGER">DİĞER</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label htmlFor="dayanak_no" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6">{getNumberLabel(newTariff.dayanak_tipi)}</label>
                          <input 
                            id="dayanak_no"
                            type="text" 
                            value={newTariff.dayanak_no || ""} 
                            onChange={e => setNewTariff({...newTariff, dayanak_no: e.target.value})} 
                            placeholder={getDayanakPlaceholder(newTariff.dayanak_tipi)} 
                            title="Dayanak Numarası"
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-bold text-slate-800 dark:text-white uppercase focus:ring-2 ring-primary-500/20 transition-all" 
                          />
                          <p className="text-[9px] font-bold text-slate-400 ml-6 uppercase italic">{getDayanakHint(newTariff.dayanak_tipi)}</p>
                       </div>
                       <div className="space-y-3">
                          <label htmlFor="dayanak_tarihi" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6">Dayanak Tarihi</label>
                          <input 
                            id="dayanak_tarihi"
                            type="date" 
                            value={newTariff.dayanak_tarihi || ""} 
                            onChange={e => setNewTariff({...newTariff, dayanak_tarihi: e.target.value})} 
                            title="Dayanak Tarihi"
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-bold text-slate-800 dark:text-white focus:ring-2 ring-primary-500/20 transition-all" 
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label htmlFor="aciklama" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6 italic flex items-center gap-2">
                         <ShieldIcon size={12} className="text-primary-500" /> Karar Detayı / Açıklama (Madde, Fıkra vb.)
                       </label>
                       <textarea 
                         id="aciklama"
                         value={newTariff.aciklama || ""} 
                         onChange={e => setNewTariff({...newTariff, aciklama: e.target.value})} 
                         placeholder="Örn: 2462 Sayılı Kanun'un 5. maddesinin (a) fıkrasına istinaden..." 
                         rows={2}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-medium text-slate-800 dark:text-slate-200 focus:ring-2 ring-primary-500/20 transition-all resize-none" 
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-white/5">
                       <div className="space-y-3">
                          <label htmlFor="gunduz_fiyat" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-6 flex items-center gap-2"><SunIcon size={12} /> Gündüz (₺ / Saat)</label>
                          <input 
                            id="gunduz_fiyat"
                            type="number" 
                            step="0.01" 
                            value={newTariff.gunduz_fiyat || ""} 
                            onChange={e => setNewTariff({...newTariff, gunduz_fiyat: e.target.value})} 
                            placeholder="0.00"
                            title="Gündüz Birim Fiyatı"
                            className="w-full px-8 py-4 bg-white dark:bg-slate-900 rounded-[20px] border-none outline-none font-black text-4xl text-emerald-600 dark:text-emerald-400 shadow-inner" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label htmlFor="gece_fiyat" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-6 flex items-center gap-2"><MoonIcon size={12} /> Gece (₺ / Saat)</label>
                          <input 
                            id="gece_fiyat"
                            type="number" 
                            step="0.01" 
                            value={newTariff.gece_fiyat || ""} 
                            onChange={e => setNewTariff({...newTariff, gece_fiyat: e.target.value})} 
                            placeholder="0.00"
                            title="Gece Birim Fiyatı"
                            className="w-full px-8 py-4 bg-white dark:bg-slate-900 rounded-[20px] border-none outline-none font-black text-4xl text-indigo-600 dark:text-indigo-400 shadow-inner" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label htmlFor="gunduz_baslangic" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6">Gündüz Başlangıç</label>
                          <input 
                            id="gunduz_baslangic"
                            type="time" 
                            value={newTariff.gunduz_baslangic || ""} 
                            onChange={e => setNewTariff({...newTariff, gunduz_baslangic: e.target.value})} 
                            title="Gündüz Başlangıç Saati"
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-bold text-slate-800 dark:text-white focus:ring-2 ring-primary-500/20 transition-all" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label htmlFor="gece_baslangic" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-6">Gece Başlangıç</label>
                          <input 
                            id="gece_baslangic"
                            type="time" 
                            value={newTariff.gece_baslangic || ""} 
                            onChange={e => setNewTariff({...newTariff, gece_baslangic: e.target.value})} 
                            title="Gece Başlangıç Saati"
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-none outline-none font-bold text-slate-800 dark:text-white focus:ring-2 ring-primary-500/20 transition-all" 
                          />
                       </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 md:p-12 pt-0 shrink-0">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-8 bg-slate-800 dark:bg-primary-600 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.2em] hover:bg-emerald-500 dark:hover:bg-primary-500 transition-all shadow-2xl shadow-primary-500/20 flex items-center justify-center gap-4 group"
                    >
                       {isSaving ? "SİSTEME İŞLENİYOR..." : (
                         <>
                           <SaveIcon size={20} className="group-hover:scale-125 transition-transform" /> 
                           {editId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'RESMİ DAYANAĞI SİSTEME İŞLE'}
                         </>
                       )}
                    </button>
                  </div>
               </section>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
};
