import React from 'react';
import { Droplets, RefreshCw, X, Clock, MapPin, User, FileText, Hash, Calendar, ShieldCheck, Banknote } from 'lucide-react';

interface SimplifiedDistributionFormModalProps {
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
}

export const SimplifiedDistributionFormModal: React.FC<SimplifiedDistributionFormModalProps> = ({
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
  handleSaveEntry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/10 relative">
        
        {/* Üst Kapatma Butonu */}
        <button 
           onClick={onClose}
           className="absolute right-8 top-8 w-12 h-12 bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all z-20 group"
           title="Kapat"
        >
           <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Antetli Başlık Kısmı */}
        <div className="p-6 md:p-7 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex gap-5 items-center">
              <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                 <Droplets size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">GÜNEYURT KURUMSİ</h3>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2.5">
                   {newEntry.id ? 'KAYIT DÜZENLEME' : 'YENİ KAYIT GİRİŞİ'}
                 </p>
              </div>
           </div>
            <div className="text-right flex flex-col items-end">
               <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full text-[8px] font-black tracking-widest mb-2 inline-block uppercase">HIZLI VERİ GİRİŞİ</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">MOD: <span className="text-indigo-500">SAHA OPERASYON</span></p>
            </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#ffffff05_0.5px,transparent_0.5px)] [background-size:20px:20px]">
          
          <div className="p-5 bg-slate-50/50 dark:bg-white/[0.02] rounded-[28px] border border-slate-100 dark:border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={14} className="text-primary-500" /> MÜKELLEF SEÇİMİ
                  </label>
                  <button onClick={() => searchCitizens(newEntry.Ad_Soyad)} className="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-2 transition-all group">
                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> YENİLE
                  </button>
                </div>
                <div className="relative">
                    <input
                      type="text"
                      title="Mükellef Ara"
                      placeholder="ARA..."
                      value={newEntry.Ad_Soyad || ""}
                      onChange={(e) => {
                        setNewEntry({ ...newEntry, Ad_Soyad: e.target.value });
                        searchCitizens(e.target.value);
                      }}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[22px] text-sm font-black outline-none focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase italic"
                    />
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
                              <span className="text-sm font-black block uppercase tracking-tight">{c.Ad} {c.Soyad} {c.Unvan && <span className="text-[10px] text-slate-400">({c.Unvan})</span>}</span>
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
                    <MapPin size={14} className="text-emerald-500" /> TAŞINMAZ SEÇİMİ
                  </label>
                </div>
                <div className="relative">
                    <input
                      type="text"
                      title="Taşınmaz Seçin"
                      placeholder={newEntry.vatandas_id ? "LİSTEDEN SEÇİN..." : "ÖNCE MÜKELLEF..."}
                      value={newEntry.Ada_Parsel || ""}
                      readOnly
                      onClick={() => { if (selectedCitizenProperties.length === 0 && newEntry.vatandas_id) loadProperties(newEntry.vatandas_id); }}
                      className={`w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[22px] text-sm font-black outline-none transition-all shadow-sm italic uppercase ${newEntry.vatandas_id ? 'cursor-pointer focus:border-emerald-500' : 'opacity-40 cursor-not-allowed'}`}
                    />
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
                        }} className="w-full text-left p-5 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all group">
                          <span className="text-sm font-black block uppercase tracking-tight">{p.Ada} / {p.Parsel}</span>
                          <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mt-1 block">{p.Mevki}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Adım 2: Dayanak ve Sayfa No */}
          <div className="p-6 bg-slate-100/50 dark:bg-white/[0.03] rounded-[28px] grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-200/50 dark:border-white/5">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                   <FileText size={13} className="text-indigo-500" /> DAYANAK KOÇAN
                </label>
                <select
                   title="Dayanak Koçan Seçin"
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
                   className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[22px] text-sm font-black outline-none text-slate-800 dark:text-white transition-all uppercase italic appearance-none cursor-pointer"
                >
                   <option value="" className="text-slate-900">KOÇAN SEÇİNİZ...</option>
                   {receiptBooks.map(b => (
                      <option key={b.id} value={b.defter_adi} className="text-slate-900">{b.defter_adi}</option>
                   ))}
                </select>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                   <Hash size={13} className="text-emerald-500" /> FİŞ / SAYFA NO
                </label>
                <input
                   type="text"
                   title="Fiş / Sayfa No"
                   placeholder="0001"
                   value={newEntry.Makbuz_No || ""}
                   onChange={(e) => setNewEntry({ ...newEntry, Makbuz_No: e.target.value })}
                   className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[22px] text-xl font-black outline-none text-slate-800 dark:text-white transition-all tabular-nums text-center md:text-left"
                />
             </div>
          </div>

          {/* Adım 3: Süre ve Tarife */}
          <div className="grid grid-cols-2 gap-8">
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Clock size={12} className="text-primary-500" /> SULAMA SÜRESİ (SAAT)
              </label>
              <input
                type="number"
                title="Sulama Süresi (Saat)"
                step="1"
                min="1"
                placeholder="0"
                value={newEntry.Sure_Saat || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setNewEntry({ ...newEntry, Sure_Saat: val, Tutar: handleCalculateTutar(val, newEntry.Tarife_Modu) });
                }}
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-xl font-black outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
            </section>
            
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={12} className="text-primary-500" /> İŞLEM TARİHİ
              </label>
              <input 
                type="date"
                title="İşlem Tarihi"
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
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-black outline-none transition-all"
              />
            </section>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Banknote size={12} className="text-emerald-500" /> TAHSİL EDİLECEK TUTAR (₺)
              </label>
              <input
                type="number"
                title="Tahsil Edilecek Tutar"
                step="0.01"
                placeholder="0.00"
                value={newEntry.Tutar || ""}
                onChange={(e) => setNewEntry({ ...newEntry, Tutar: parseFloat(e.target.value) || 0 })}
                className="w-full px-6 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-2xl font-black text-emerald-600 outline-none focus:border-emerald-500 transition-all shadow-inner"
              />
            </section>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <section className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                TARİFE TİPİ
              </label>
              <div className="grid grid-cols-2 gap-3 h-[76px]">
                <button onClick={() => setNewEntry({ ...newEntry, Tarife_Modu: 'SUN', Tutar: handleCalculateTutar(newEntry.Sure_Saat, 'SUN') })} className={`rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest ${newEntry.Tarife_Modu === 'SUN' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/5'}`}>GÜNDÜZ</button>
                <button onClick={() => setNewEntry({ ...newEntry, Tarife_Modu: 'NIGHT', Tutar: handleCalculateTutar(newEntry.Sure_Saat, 'NIGHT') })} className={`rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest ${newEntry.Tarife_Modu === 'NIGHT' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/5'}`}>GECE</button>
              </div>
            </section>
          </div>

          {/* Adım 5: İşlem Notu (Opsiyonel) */}
          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[28px] border-2 border-slate-200 dark:border-white/5 space-y-4">
             <div className="flex items-center gap-3 ml-1">
                <ShieldCheck size={16} className="text-slate-400" />
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">İŞLEM NOTU (OPSİYONEL)</label>
             </div>
             <textarea 
                value={newEntry.islem_notu || ""}
                onChange={(e) => setNewEntry({ ...newEntry, islem_notu: e.target.value })}
                placeholder="Örn: Rutin Sulama Dağıtımı vb."
                className="w-full p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary-500 transition-all min-h-[80px] resize-none"
             />
          </div>

          <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[32px] space-y-4">
             <label className="text-[11px] font-black text-emerald-600 uppercase tracking-widest ml-1">ÖDEME DURUMU (LİTE TAKİP)</label>
             <div className="grid grid-cols-2 gap-4 h-[60px]">
                <button 
                   onClick={() => setNewEntry({ ...newEntry, Odeme_Durumu: 'Beklemede' })}
                   className={`rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest ${newEntry.Odeme_Durumu !== 'Ödendi' ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5'}`}
                >
                   ÖDENMEDİ
                </button>
                <button 
                   onClick={() => setNewEntry({ ...newEntry, Odeme_Durumu: 'Ödendi' })}
                   className={`rounded-2xl text-[10px] font-black border-2 transition-all uppercase tracking-widest ${newEntry.Odeme_Durumu === 'Ödendi' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5'}`}
                >
                   ÖDENDİ
                </button>
             </div>
          </div>
        </div>

        {/* Alt Aksiyonlar */}
        <div className="p-8 bg-white dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95">İptal Et</button>
          <button 
            onClick={handleSaveEntry} 
            disabled={!newEntry.Tasinmaz_id || !newEntry.Sure_Saat || !newEntry.Makbuz_No}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Droplets size={16} /> KAYDI SİSTEME İŞLE
          </button>
        </div>
      </div>
    </div>
  );
};
