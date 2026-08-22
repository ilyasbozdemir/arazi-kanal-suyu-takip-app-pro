import React from 'react';
import { Droplets, RefreshCw, X, Clock, MapPin, User, FileText, Hash, Activity, Calendar, ShieldCheck } from 'lucide-react';

interface DistributionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEntry: any;
  setNewEntry: (entry: any) => void;
  citizens: any[];
  searchCitizens: (term: string) => void;
  setCitizens: (citizens: any[]) => void;
  selectedCitizenProperties: any[];
  loadProperties: (id: string) => void;
  receiptBooks: any[];
  selectedPropertySuHakki: number | null;
  setSelectedPropertySuHakki: (val: number | null) => void;
  usedMinutesForSelected: number;
  isOverLimit: boolean;
  handleCalculateTutar: (hours: number, tarife: string) => number;
  fetchUsedMinutes: (tasinmazId: string, excludeId?: string) => void;
  handleSaveEntry: () => void;
  formatCurrency: (amount: number) => string;
  pricing?: any;
}

export const DistributionFormModal: React.FC<DistributionFormModalProps> = ({
  isOpen,
  onClose,
  newEntry,
  setNewEntry,
  citizens,
  searchCitizens,
  setCitizens,
  selectedCitizenProperties,
  loadProperties,
  receiptBooks,
  selectedPropertySuHakki,
  setSelectedPropertySuHakki,
  usedMinutesForSelected,
  isOverLimit,
  handleCalculateTutar,
  fetchUsedMinutes,
  handleSaveEntry,
  formatCurrency,
  pricing
}) => {
  // 🛡️ OTOMATİK TAHAKKUK GEREKÇESİ (Sarsılmaz Memur Dostu)
  React.useEffect(() => {
    if (isOpen && !newEntry.id && (!newEntry.islem_notu || newEntry.islem_notu.trim() === "")) {
      setNewEntry({ ...newEntry, islem_notu: 'RUTİN SULAMA DAĞITIMI VE TAHAKKUKU' });
    }
  }, [isOpen, newEntry.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-950/60 backdrop-blur-xl transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20 relative">
        
        {/* Üst Kapatma Butonu */}
        <button 
           onClick={onClose}
           className="absolute right-8 top-8 w-12 h-12 bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all z-20 group"
           title="Kapat"
        >
           <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Antetli Başlık Kısmı */}
        <div className="p-6 md:p-8 border-b-4 border-double border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row justify-between items-start gap-6">
           <div className="flex gap-6 md:gap-8 items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 dark:bg-white rounded-[24px] md:rounded-[28px] flex items-center justify-center text-white dark:text-slate-900 shadow-2xl shrink-0">
                 <Droplets size={32} className="md:w-10 md:h-10" />
              </div>
              <div>
                 <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">GÜNEYURT KURUMSİ</h3>
                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
                   {newEntry.id ? 'SULAMA KAYDI DÜZENLEME FORMU' : 'YENİ SULAMA KAYDI GİRİŞ FORMU'}
                 </p>
              </div>
           </div>
           <div className="text-left md:text-right pr-16">
              <div className="px-6 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black tracking-widest mb-4 inline-block shadow-lg shadow-emerald-500/20 uppercase">
                 RESMİ VERİ GİRİŞİ
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-tighter italic">
                 İŞLEM TİPİ: <span className="text-emerald-600 dark:text-emerald-400">
                    RESMİ TAHAKKUK
                 </span>
              </p>
           </div>
        </div>

        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* Adım 1: Mükellef ve Taşınmaz (Selection Hub) */}
          <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-[32px] border-2 border-slate-100 dark:border-white/5 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary-500/10 rounded-lg flex items-center justify-center">
                      <User size={14} className="text-primary-500" />
                    </div>
                    MÜKELLEF SEÇİMİ
                  </label>
                  <button onClick={() => searchCitizens(newEntry.Ad_Soyad)} className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-2 transition-all group">
                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> YENİLE
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="AD VEYA TCKN İLE ARAYIN..."
                    value={newEntry.Ad_Soyad || ""}
                    onChange={(e) => {
                      setNewEntry({ ...newEntry, Ad_Soyad: e.target.value });
                      searchCitizens(e.target.value);
                    }}
                    className="w-full px-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-[28px] text-base font-black outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase italic"
                  />
                  {/* 🛡️ SEÇİLİ KİŞİ ÖZETİ */}
                  {newEntry.TCKN && (
                     <div className="mt-3 flex items-center justify-between px-6 py-3 bg-primary-500/5 border border-primary-500/10 rounded-2xl animate-in slide-in-from-top-2 duration-500">
                        <div className="flex gap-3">
                           <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-lg">TC: {newEntry.TCKN}</span>
                           {newEntry.Sicil_No && (
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">SİCİL: {newEntry.Sicil_No}</span>
                           )}
                        </div>
                        {selectedCitizenProperties.length > 0 && (
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <MapPin size={12} className="text-emerald-500" /> {selectedCitizenProperties.length} TAŞINMAZ
                           </div>
                        )}
                     </div>
                  )}
                  {citizens.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-800 border-2 border-primary-500/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[250] max-h-64 overflow-y-auto p-3 backdrop-blur-xl">
                      {citizens.map(c => (
                        <button key={c.id} onClick={() => {
                          setNewEntry({ 
                            ...newEntry, 
                            TCKN: c.TCKN,
                            Sicil_No: c.Sicil_No, 
                            Ad_Soyad: `${c.Ad} ${c.Soyad} ${c.Unvan ? `(${c.Unvan})` : ''}`.trim().toUpperCase(),
                            Tasinmaz_id: '', 
                            Ada_Parsel: '',
                            Mevki: '',
                            vatandas_id: c.id 
                          });
                          setCitizens([]);
                          loadProperties(c.id);
                        }} className="w-full text-left p-4 hover:bg-primary-500 hover:text-white rounded-2xl border-b border-slate-50 dark:border-white/5 last:border-0 transition-all group">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black block uppercase group-hover:text-white tracking-tight">{c.Ad} {c.Soyad} {c.Unvan && <span className="text-[10px] text-slate-400 group-hover:text-white/70">({c.Unvan})</span>}</span>
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black opacity-50 uppercase tracking-widest bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white">TC: {c.TCKN || '---'}</span>
                                <span className="text-[9px] font-black opacity-50 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white">SİCİL: {c.Sicil_No || '---'}</span>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white/70 uppercase">BABA: {c.Baba_Adi || '---'}</span>
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white/70 uppercase">MAH: {c.Mahalle_Koy || '---'}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <MapPin size={14} className="text-emerald-500" />
                    </div>
                    TAŞINMAZ SEÇİMİ
                  </label>
                  {newEntry.vatandas_id && (
                     <button onClick={() => loadProperties(newEntry.vatandas_id)} className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest flex items-center gap-2 transition-all group">
                       <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> LİSTELE
                     </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={newEntry.vatandas_id ? "LİSTEDEN BİR TAŞINMAZ SEÇİN..." : "ÖNCE MÜKELLEF SEÇMELİSİNİZ..."}
                    value={newEntry.Ada_Parsel || ""}
                    readOnly
                    onClick={() => { if (selectedCitizenProperties.length === 0 && newEntry.vatandas_id) loadProperties(newEntry.vatandas_id); }}
                    className={`w-full px-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-[28px] text-base font-black outline-none transition-all shadow-sm italic uppercase ${newEntry.vatandas_id ? 'cursor-pointer focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' : 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900/50'}`}
                  />
                  {/* 🛡️ SEÇİLİ TAŞINMAZ ÖZETİ */}
                  {newEntry.Tasinmaz_id && (
                     <div className="mt-3 flex items-center justify-between px-6 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-in slide-in-from-top-2 duration-500">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{newEntry.Ada_Parsel}</span>
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-0.5">{newEntry.Mevki || 'MEVKİ BİLGİSİ YOK'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AYLIK HAK:</span>
                           <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5">{selectedPropertySuHakki || 0} SAAT</span>
                        </div>
                     </div>
                  )}
                  {selectedCitizenProperties.length > 0 && !newEntry.Tasinmaz_id && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-800 border-2 border-emerald-500/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[250] max-h-64 overflow-y-auto p-3 backdrop-blur-xl">
                      {selectedCitizenProperties.map(p => (
                        <button key={p.id} onClick={async () => {
                          let autoMakbuz = newEntry.Makbuz_Defter_Adi;
                          let autoMakbuzNo = newEntry.Makbuz_No;
                          if (!autoMakbuz && receiptBooks.length === 1) {
                            const defterAdi = receiptBooks[0].defter_adi;
                            const nextNoRes = await (window as any).electron.ipcRenderer.invoke('get-next-receipt-number', defterAdi);
                            autoMakbuz = defterAdi;
                            autoMakbuzNo = nextNoRes.success ? String(nextNoRes.nextNo).padStart(4, '0') : '0001';
                          }
                          setNewEntry({ 
                            ...newEntry, 
                            Tasinmaz_id: p.id, 
                            Ada_Parsel: `${p.Ada}/${p.Parsel}`, 
                            Makbuz_Defter_Adi: autoMakbuz, 
                            Makbuz_No: autoMakbuzNo,
                            Mevki: p.Mevki
                          });
                          setSelectedPropertySuHakki(p.Aylik_Su_Hakki || 0);
                          fetchUsedMinutes(p.id, newEntry.id);
                        }} className="w-full text-left p-5 hover:bg-emerald-500 hover:text-white rounded-2xl border-b border-slate-50 dark:border-white/5 last:border-0 transition-all group">
                          <span className="text-sm font-black block uppercase group-hover:text-white tracking-tight">{p.Ada} / {p.Parsel}</span>
                          <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mt-1">{p.Mevki} · {p.Aylik_Su_Hakki ? `${p.Aylik_Su_Hakki} SAAT HAK` : 'HAK BELİRTİLMEMİŞ'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Adım 2: Dayanak ve Sayfa No (Official Record Section) */}
          <div className="p-8 bg-slate-800 dark:bg-indigo-950/40 rounded-[32px] shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden group border border-white/5">
             <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
             
             <div className="space-y-4 relative z-10">
                <label htmlFor="kocan_sec" className="text-[11px] font-black text-slate-300 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                   <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                    <FileText size={14} className="text-primary-400" />
                   </div>
                   DAYANAK KOÇAN
                </label>
                <select
                   id="kocan_sec"
                   value={newEntry.Makbuz_Defter_Adi || ""}
                   onChange={async (e) => {
                      const defterAdi = e.target.value;
                      const nextNoRes = await (window as any).electron.ipcRenderer.invoke('get-next-receipt-number', defterAdi);
                      setNewEntry({ 
                         ...newEntry, 
                         Makbuz_Defter_Adi: defterAdi, 
                         Makbuz_No: nextNoRes.success ? String(nextNoRes.nextNo).padStart(4, '0') : '0001' 
                      });
                   }}
                   className="w-full px-8 py-5 bg-white/5 dark:bg-black/20 border-2 border-white/10 dark:border-white/5 rounded-[28px] text-base font-black outline-none focus:border-primary-500 focus:bg-white/10 text-white transition-all uppercase italic appearance-none cursor-pointer"
                >
                   <option value="" className="text-slate-900">LÜTFEN KOÇAN SEÇİNİZ...</option>
                   {receiptBooks.map(b => (
                      <option key={b.id} value={b.defter_adi} className="text-slate-900">{b.defter_adi} (SERİ: {b.baslangic_no}-{b.son_no})</option>
                   ))}
                </select>
             </div>

             <div className="space-y-4 relative z-10">
                <label htmlFor="fis_no_input" className="text-[11px] font-black text-slate-300 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                   <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                    <Hash size={14} className="text-emerald-400" />
                   </div>
                   FİŞ / SAYFA NO
                </label>
                <input
                   id="fis_no_input"
                   type="text"
                   placeholder="0001"
                   value={newEntry.Makbuz_No || ""}
                   onChange={(e) => setNewEntry({ ...newEntry, Makbuz_No: e.target.value })}
                   className="w-full px-8 py-5 bg-white/5 dark:bg-black/20 border-2 border-white/10 dark:border-white/5 rounded-[28px] text-3xl font-black outline-none focus:border-emerald-500 focus:bg-white/10 text-white transition-all tabular-nums tracking-widest shadow-inner text-center md:text-left"
                />
             </div>
          </div>

          {/* Adım 3: Süre ve Tarife */}
          <div className="grid grid-cols-2 gap-8">
            <section className="space-y-3">
              <label htmlFor="sure_saat_input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Clock size={12} className="text-primary-500" /> SULAMA SÜRESİ (SAAT)
              </label>
              <input
                id="sure_saat_input"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                value={newEntry.Sure_Saat || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setNewEntry({ ...newEntry, Sure_Saat: val, Tutar: handleCalculateTutar(val, newEntry.Tarife_Modu) });
                }}
                className="w-full px-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-3xl text-3xl font-black outline-none focus:border-primary-500 transition-all shadow-sm tabular-nums"
              />
            </section>
            
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={12} className="text-primary-500" /> İŞLEM & VADE TARİHİ
              </label>
              <div className="flex gap-2">
                 <input 
                    type="date"
                    title="İşlem Tarihi"
                    placeholder="gg.aa.yyyy"
                    value={newEntry.Tarih || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                       const date = new Date(e.target.value);
                       const dueDate = new Date(date);
                       dueDate.setDate(dueDate.getDate() + 30);
                       setNewEntry({ 
                          ...newEntry, 
                          Tarih: e.target.value, 
                          Son_Odeme_Tarihi: dueDate.toISOString().split('T')[0] 
                       });
                    }}
                    className="flex-1 px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-xs font-black outline-none focus:border-primary-500 transition-all"
                 />
                 <input 
                    type="date"
                    title="Son Ödeme Tarihi"
                    placeholder="gg.aa.yyyy"
                    value={newEntry.Son_Odeme_Tarihi || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, Son_Odeme_Tarihi: e.target.value })}
                    className="flex-1 px-4 py-4 bg-rose-500/5 dark:bg-rose-500/10 border-2 border-rose-500/10 rounded-2xl text-xs font-black text-rose-600 outline-none focus:border-rose-500 transition-all"
                 />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                TARİFE TİPİ
              </label>
              <div className="grid grid-cols-2 gap-3 h-[76px]">
                <button onClick={() => setNewEntry({ ...newEntry, Tarife_Modu: 'SUN', Tutar: handleCalculateTutar(newEntry.Sure_Saat, 'SUN') })} className={`rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest ${newEntry.Tarife_Modu === 'SUN' ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5 hover:border-slate-200'}`}>GÜNDÜZ</button>
                <button onClick={() => setNewEntry({ ...newEntry, Tarife_Modu: 'NIGHT', Tutar: handleCalculateTutar(newEntry.Sure_Saat, 'NIGHT') })} className={`rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest ${newEntry.Tarife_Modu === 'NIGHT' ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5 hover:border-slate-200'}`}>GECE</button>
              </div>
            </section>
          </div>

          {/* Adım 4: Limit Kontrolü */}
          {selectedPropertySuHakki !== null && (
            <div className={`p-8 rounded-[32px] border-4 border-double flex items-center gap-6 transition-all ${isOverLimit ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'}`}>
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-lg ${isOverLimit ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                <Activity size={32} />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">AYLIK HAK</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{selectedPropertySuHakki} SAAT</p>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-white/10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOPLAM KULLANIM</p>
                  <p className={`text-xl font-black tabular-nums ${isOverLimit ? 'text-rose-600' : 'text-blue-600'}`}>
                    {((usedMinutesForSelected / 60) + (newEntry.Sure_Saat || 0)).toFixed(1)} SAAT
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">KALAN HAK</p>
                  <p className={`text-xl font-black tabular-nums ${isOverLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {Math.max(0, selectedPropertySuHakki - (usedMinutesForSelected / 60) - (newEntry.Sure_Saat || 0)).toFixed(1)} SAAT
                  </p>
                </div>
              </div>
              {isOverLimit && (
                 <div className="w-px h-12 bg-rose-200 dark:bg-rose-500/20" />
              )}
              {isOverLimit && <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse leading-tight">LİMİT<br/>AŞILDI!</span>}
            </div>
          )}

          {/* Adım 5: İşlem Notu */}
          <div className="p-6 rounded-[28px] border-2 space-y-4 bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20">
             <div className="flex items-center gap-3 ml-1">
                <ShieldCheck size={16} className="text-amber-600" />
                <label className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                   İŞLEM NOTU (ZORUNLU)
                </label>
             </div>
             <textarea 
                required
                value={newEntry.islem_notu || ""}
                onChange={(e) => setNewEntry({ ...newEntry, islem_notu: e.target.value })}
                placeholder="Örn: Rutin Sulama Dağıtımı vb."
                className="w-full p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary-500 transition-all min-h-[80px] resize-none"
             />
          </div>


          <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[48px] border-4 border-double border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between shadow-inner gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-1">TAHAKKUK TUTARI</span>
                   {newEntry.Tutar > 0 && (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${(pricing?.kdv_dahil !== 0) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                         {pricing?.vergi_adi || 'KDV'} {(pricing?.kdv_dahil !== 0) ? 'DAHİL' : 'HARİÇ'}
                      </span>
                   )}
                </div>
                <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{formatCurrency(newEntry.Tutar)}</span>
                
                {newEntry.Tutar > 0 && (
                   <div className="flex gap-4 mt-2 ml-1">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">NET TUTAR</span>
                         <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                            {formatCurrency((pricing?.kdv_dahil !== 0) ? (newEntry.Tutar / (1 + (pricing?.vergi_orani || 0))) : newEntry.Tutar)}
                         </span>
                      </div>
                      <div className="flex flex-col border-l border-slate-200 dark:border-white/10 pl-4">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{pricing?.vergi_adi || 'KDV'} (%{(pricing?.vergi_orani || 0) * 100})</span>
                         <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                            {formatCurrency(newEntry.Tutar - ((pricing?.kdv_dahil !== 0) ? (newEntry.Tutar / (1 + (pricing?.vergi_orani || 0))) : newEntry.Tutar))}
                         </span>
                      </div>
                   </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="w-16 h-16 border-4 border-double border-slate-300 dark:border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300 transform -rotate-12 uppercase select-none">
                    TASLAK
                 </div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic text-center max-w-[120px]">
                    * Vergi ayarlarını sisteme sarsılmaz bir titizlikle giriniz.
                 </p>
              </div>
            </div>
        </div>

        {/* Alt Aksiyonlar */}
        <div className="p-10 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-6">
          <button onClick={onClose} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95">İptal Et</button>
          <button 
            onClick={handleSaveEntry} 
            disabled={!newEntry.Tasinmaz_id || !newEntry.Sure_Saat || !newEntry.Makbuz_No || !newEntry.islem_notu?.trim()}
            className="flex-[2] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Droplets size={18} /> KAYDI SİSTEME İŞLE VE MÜHÜRLE
          </button>
        </div>
      </div>
    </div>
  );
};
