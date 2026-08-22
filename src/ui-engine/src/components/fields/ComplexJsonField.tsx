import { FC, useState, useCallback, useEffect } from 'react';
import { 
  Database, Plus, Trash2, User, Users, UserPlus,
  ShieldCheck, ShieldAlert, Info, Search, Lock, Unlock, Save 
} from 'lucide-react';
import { FieldProps } from './types';
import { FastCitizenModal } from '@renderer/screens/vatandas/components/modals/FastCitizenModal';

// 🛡️ KURUM KESİR MOTORU
const toFraction = (decimal: number) => {
  const tolerance = 1e-6;
  for (let payda = 1; payda <= 100; payda++) {
    const pay = Math.round(decimal * payda);
    if (Math.abs(pay/payda - decimal) < tolerance) 
      return { pay, payda };
  }
  return { pay: Math.round(decimal * 100), payda: 100 };
}

export const ComplexJsonField: FC<FieldProps> = ({ 
  field: h, values, setValues, isEditing, translateHeader 
}) => {
  const isShareholder = h === "Hissedarlar_JSON";
  const alanM2 = Number(values.Alan_m2 || 0);

  // 🛡️ KURUM YEREL TASLAK STATE
  const [localItems, setLocalItems] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<{idx: number, data: any[]}>({ idx: -1, data: [] });
  const [isFastModalOpen, setIsFastModalOpen] = useState(false);
  const [fastModalIdx, setFastModalIdx] = useState<number>(-1);

  // 🛡️ SENKRONİZASYON: Formdan veri geldikçe taslağı hiyerarşik düzen içerisinde güncelle
  useEffect(() => {
    try {
      const dataArr = typeof values[h] === 'string' ? JSON.parse(values[h]) : (values[h] || []);
      if (Array.isArray(dataArr)) {
        const normalized = dataArr.map((item: any) => {
          const ad = item.Ad || item.ad || '';
          const soyad = item.Soyad || item.soyad || '';
          const adSoyad = item.Ad_Soyad || `${ad} ${soyad}`.trim();
          
          return {
            ...item,
            id: item.id || window.crypto.randomUUID(),
            Vatandas_Id: item.Vatandas_Id || item.TCKN || item.tckn,
            TCKN: item.TCKN || item.tckn || item.Vatandas_Id,
            Ad_Soyad: adSoyad.toLocaleUpperCase('tr-TR'),
            Ana_Adi: item.Ana_Adi || '',
            Baba_Adi: item.Baba_Adi || '',
            Hisse_Pay: Number(item.Hisse_Pay) || 0,
            Hisse_Payda: Number(item.Hisse_Payda) || 1,
            locked: item.locked !== undefined ? !!item.locked : true,
            Rol: item.Rol || '',
            Aciklama: item.Aciklama || ''
          };
        });
        // Gereksiz render'ı önlemek için basit bir kontrol
        if (JSON.stringify(normalized) !== JSON.stringify(localItems)) {
           setLocalItems(normalized);
        }
      }
    } catch (e) { console.error("JSON Parse Error:", e); }
  }, [values[h], h]);

  // 🛡️ RESMİ HİSSE HESAPLAMA ALGORİTMASI
  const recalculateShares = useCallback((items: any[]) => {
    if (!isShareholder) return items;
    const manualItems = items.filter(i => !i.locked); 
    const autoItems = items.filter(i => i.locked);   
    if (autoItems.length === 0) return items;
    
    const totalManualPay = manualItems.reduce((acc, i) => acc + (i.Hisse_Pay / (i.Hisse_Payda || 1)), 0);
    const remainingPay = Math.max(0, 1 - totalManualPay);
    const sharePerAuto = remainingPay / autoItems.length;
    const { pay, payda } = toFraction(sharePerAuto);
    
    return items.map(item => {
      if (!item.locked) return item;
      return { ...item, Hisse_Pay: pay, Hisse_Payda: payda };
    });
  }, [isShareholder]);

  const updateLocalItem = (idx: number, key: string, val: any) => {
    const next = [...localItems];
    next[idx] = { ...next[idx], [key]: val };
    
    if (isShareholder && ['locked', 'Hisse_Pay', 'Hisse_Payda'].includes(key)) {
       setLocalItems(recalculateShares(next));
    } else {
       setLocalItems(next);
    }
  };

  const commitToForm = () => {
    const cleanData = localItems.map(({ ...rest }) => rest);
    setValues({ ...values, [h]: JSON.stringify(cleanData) });
    if ((window as any).api?.showAlert) {
       (window as any).api.showAlert({ message: `${translateHeader(h)} FORMA UYGULANDI ✓`, type: 'success' });
    }
  };

  const addItem = () => {
    const newItem = isShareholder 
      ? { id: window.crypto.randomUUID(), TCKN: '', Ad_Soyad: '', Hisse_Pay: 0, Hisse_Payda: 1, locked: true }
      : { id: window.crypto.randomUUID(), TCKN: '', Ad_Soyad: '', Rol: 'ZİLYET / BAKICI', Aciklama: '' };
    
    const next = [...localItems, newItem];
    setLocalItems(isShareholder ? recalculateShares(next) : next);
  };

  const removeItem = (idx: number) => {
    const next = localItems.filter((_, i) => i !== idx);
    setLocalItems(isShareholder ? recalculateShares(next) : next);
  };

  const selectCitizen = (idx: number, citizen: any) => {
     const ad = citizen.Ad || citizen.ad || '';
     const soyad = citizen.Soyad || citizen.soyad || '';
     const next = [...localItems];
     next[idx] = { 
        ...next[idx], 
        Vatandas_Id: citizen.id, 
        Ad_Soyad: `${ad} ${soyad}`.toLocaleUpperCase('tr-TR'),
        TCKN: citizen.TCKN || citizen.tckn,
        Ana_Adi: citizen.Ana_Adi,
        Baba_Adi: citizen.Baba_Adi
     };
     setLocalItems(next);
     setSearchResults({ idx: -1, data: [] });
  };

  const handleCitizenSearch = async (idx: number, query: string) => {
    if (query.length < 2) { setSearchResults({ idx: -1, data: [] }); return; }
    const res = await (window as any).api.executeRaw(
       "SELECT id, Ad, Soyad, TCKN, Sicil_No, Ana_Adi, Baba_Adi FROM DATA_Vatandas WHERE (COALESCE(TR_UPPER(Ad), '') || ' ' || COALESCE(TR_UPPER(Soyad), '')) LIKE ? OR TCKN LIKE ? OR Sicil_No LIKE ? LIMIT 50",
       [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    if (res.success) setSearchResults({ idx, data: res.data });
  };

  const totalSharePercent = isShareholder ? (localItems.reduce((acc, i) => acc + (i.Hisse_Pay / (i.Hisse_Payda || 1)), 0) * 100) : 0;
  const isTotalValid = !isShareholder || (Math.abs(totalSharePercent - 100) < 0.1);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* 🛡️ ÜST BAR */}
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
               {isShareholder ? <Users size={20} /> : <Database size={20} />}
            </div>
            <div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1">
                  {isShareholder ? "MÜLKİYET YAPISI" : "İLİŞKİLİ KİŞİLER"}
               </h4>
               <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  {isShareholder ? "HİSSEDAR VE PAYDAŞ LİSTESİ" : `${translateHeader(h)} KAYITLARI`}
               </h3>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={addItem} title="Yeni Kayıt Ekle" className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
               <Plus size={12} /> YENİ EKLE
            </button>
         </div>
      </div>

      <div className="space-y-4">
        {localItems.map((item: any, idx: number) => (
          <div key={item.id || idx} className={`bg-white dark:bg-slate-900/40 rounded-[28px] border border-slate-100 dark:border-white/5 relative shadow-sm group/card ${searchResults.idx === idx ? 'z-[1000] ring-2 ring-indigo-500/20' : 'z-10'}`}>
             
             {/* 🛡️ VATANDAŞ BÖLÜMÜ */}
             <div className="p-5 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                {!item.Vatandas_Id ? (
                   <div className="relative group/search">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-300">
                            <Search size={20} />
                         </div>
                         <div className="flex-1 space-y-1">
                            <input 
                              type="text" 
                              placeholder="AD SOYAD VEYA TCKN İLE ARA..." 
                              value={item.Ad_Soyad || ''}
                              title="Arama"
                              autoFocus
                              onChange={(e) => {
                                 const val = e.target.value.toLocaleUpperCase('tr-TR');
                                 updateLocalItem(idx, 'Ad_Soyad', val);
                                 handleCitizenSearch(idx, val);
                              }}
                              className="bg-transparent border-none p-0 text-base font-black text-slate-800 dark:text-white uppercase tracking-tighter outline-none placeholder:text-slate-200 w-full"
                            />
                            <div className="h-0.5 w-full bg-slate-100 dark:bg-white/5">
                               <div className="h-full w-0 group-focus-within/search:w-full bg-primary-500 transition-all duration-500"></div>
                            </div>
                         </div>
                         <button onClick={() => removeItem(idx)} title="Kaldır" className="w-10 h-10 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center">
                            <Trash2 size={16} />
                         </button>
                      </div>
                      {searchResults.idx === idx && (
                        <div className="absolute left-16 top-full mt-3 w-full md:w-[450px] bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-white/10 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
                           <div className="px-6 py-3 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                              <span>SİSTEMDE BULUNAN KİŞİLER</span>
                              <button 
                                onClick={() => {
                                  setFastModalIdx(idx);
                                  setIsFastModalOpen(true);
                                }}
                                className="text-primary-500 hover:text-primary-600 font-black text-[8px] uppercase tracking-tighter"
                              >
                                + YENİ VATANDAŞ EKLE
                              </button>
                           </div>
                           <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                              {searchResults.data.length > 0 ? searchResults.data.map((c: any, cIdx: number) => (
                               <button 
                                 key={c.id || cIdx} 
                                 onClick={() => selectCitizen(idx, c)} 
                                 className="w-full px-6 py-5 text-left hover:bg-primary-500 group/item transition-all rounded-[24px] mb-1 last:mb-0 flex items-center justify-between border border-transparent hover:border-white/20"
                               >
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover/item:bg-white/20 group-hover/item:text-white transition-all">
                                         <User size={20} />
                                      </div>
                                      <div>
                                         <div className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover/item:text-white transition-colors">{c.Ad} {c.Soyad}</div>
                                         <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-white/70 transition-colors">TCKN: {c.TCKN}</span>
                                            {c.Sicil_No && <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest group-hover/item:text-white/70 transition-colors"> | SİCİL: {c.Sicil_No}</span>}
                                            {(c.Ana_Adi || c.Baba_Adi) && (
                                              <span className="text-[8px] font-black text-primary-500/60 dark:text-white/40 uppercase tracking-widest group-hover/item:text-white/50">
                                                (A: {c.Ana_Adi || '-'} B: {c.Baba_Adi || '-'})
                                              </span>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                   <div className="w-8 h-8 rounded-full bg-primary-500/10 dark:bg-white/5 flex items-center justify-center text-primary-500 group-hover/item:bg-white group-hover/item:text-primary-600 transition-all shadow-sm">
                                      <Plus size={16} />
                                   </div>
                               </button>
                             )) : (
                               <div className="p-8 text-center space-y-4">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase italic">Kayıt Bulunamadı</p>
                                 <button 
                                   onClick={() => {
                                     setFastModalIdx(idx);
                                     setIsFastModalOpen(true);
                                   }}
                                   className="mx-auto flex items-center gap-2 px-6 py-3 bg-primary-600 text-white text-[9px] font-black uppercase rounded-2xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
                                 >
                                    <UserPlus size={14} /> YENİ KİŞİ EKLE
                                 </button>
                               </div>
                             )}
                           </div>
                        </div>
                      )}
                   </div>
                ) : (
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                            <User size={24} />
                         </div>
                         <div className="space-y-0.5">
                            <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight">{item.Ad_Soyad}</h4>
                            <div className="flex items-center gap-2">
                               <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                  <ShieldCheck size={12} className="text-emerald-500" /> {item.TCKN || item.Vatandas_Id}
                               </span>
                               {(item.Ana_Adi || item.Baba_Adi) && (
                                  <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest px-2 py-0.5 bg-primary-500/5 rounded-md">
                                     A: {item.Ana_Adi || '-'} B: {item.Baba_Adi || '-'}
                                  </span>
                               )}
                               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/5 rounded-md">KAYITLI ✓</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => updateLocalItem(idx, 'Vatandas_Id', null)} title="Değiştir" className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">DEĞİŞTİR</button>
                         <button onClick={commitToForm} title="Kartı Kaydet" className="w-10 h-10 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center"><Save size={16} /></button>
                         <button onClick={() => removeItem(idx)} title="Sil" className="w-10 h-10 bg-rose-500/5 text-rose-400 hover:bg-rose-500 rounded-xl transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                      </div>
                   </div>
                )}
             </div>

             {/* 🛡️ DETAY BÖLÜMÜ (Hissedar vs Diğer) */}
             <div className="px-6 py-4">
                {isShareholder ? (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-8 flex items-center gap-4">
                         <button 
                           onClick={() => updateLocalItem(idx, 'locked', !item.locked)}
                           title={item.locked ? "Otomatik" : "Manuel"}
                           className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.locked ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-lg'}`}
                         >
                            {item.locked ? <Lock size={16} /> : <Unlock size={16} />}
                         </button>
                         <div className="flex-1 grid grid-cols-2 gap-4 p-3 bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-50 dark:border-white/5">
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-slate-400 uppercase px-1">PAY</label>
                               <input 
                                 type="number" value={item.Hisse_Pay} readOnly={item.locked} title="Pay"
                                 onChange={e => updateLocalItem(idx, 'Hisse_Pay', Number(e.target.value))}
                                 className={`w-full bg-transparent text-xl font-black outline-none px-1 ${item.locked ? 'text-primary-500 opacity-50' : 'text-emerald-600'}`}
                               />
                            </div>
                            <div className="space-y-1 border-l border-slate-100 dark:border-white/5">
                               <label className="text-[8px] font-black text-slate-400 uppercase px-3">PAYDA</label>
                               <input 
                                 type="number" value={item.Hisse_Payda} readOnly={item.locked} title="Payda"
                                 onChange={e => updateLocalItem(idx, 'Hisse_Payda', Number(e.target.value))}
                                 className={`w-full bg-transparent text-xl font-black outline-none px-3 ${item.locked ? 'text-primary-500 opacity-50' : 'text-emerald-600'}`}
                               />
                            </div>
                         </div>
                      </div>
                      <div className="lg:col-span-4 flex items-center justify-end gap-6 text-right pr-2">
                         <div className="space-y-0.5">
                            <div className="text-2xl font-black text-primary-500 tracking-tighter">%{((item.Hisse_Pay / (item.Hisse_Payda || 1)) * 100).toFixed(1)}</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">ORAN</div>
                         </div>
                         <div className="h-8 w-px bg-slate-100 dark:bg-white/10"></div>
                         <div className="space-y-0.5">
                            <div className="text-base font-black text-slate-800 dark:text-white leading-none">{(alanM2 * (item.Hisse_Pay / (item.Hisse_Payda || 1))).toFixed(1)} m²</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">ALAN</div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-50 dark:border-white/5 group-focus-within/card:border-indigo-500/30 transition-all">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ROL / ÜNVAN</label>
                         <input 
                           type="text" value={item.Rol || ''} title="Rol" placeholder="Örn: Zilyet, Bakıcı, Kiracı..."
                           onChange={e => updateLocalItem(idx, 'Rol', e.target.value.toLocaleUpperCase('tr-TR'))}
                           className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none"
                         />
                      </div>
                      <div className="space-y-1 p-3 bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-50 dark:border-white/5 group-focus-within/card:border-indigo-500/30 transition-all">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AÇIKLAMA / NOT (MAX 350)</label>
                         <input 
                           type="text" value={item.Aciklama || ''} title="Açıklama" placeholder="Ek bilgi giriniz..."
                           maxLength={350}
                           onChange={e => updateLocalItem(idx, 'Aciklama', e.target.value)}
                           className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none"
                         />
                      </div>
                   </div>
                )}
             </div>
          </div>
        ))}

        {localItems.length > 0 && (
           <div className="space-y-4 pt-2">
              <button onClick={addItem} title="Yeni Ekle" className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/5 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                 <Plus size={16} /> BAŞKA BİR KAYIT DAHA EKLE
              </button>
              
              <div className={`p-4 pr-6 rounded-[24px] border flex items-center justify-between gap-4 transition-all ${isTotalValid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isTotalValid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                       {isTotalValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </div>
                    <div className="space-y-0.5">
                       <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTotalValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isShareholder ? (isTotalValid ? 'HİSSE DAĞILIMI TAMAM ✓' : `HİSSE EKSİĞİ: %${(100 - totalSharePercent).toFixed(1)}`) : 'LİSTE ONAYA HAZIR'}
                       </div>
                       <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {localItems.length} KAYIT MEVCUT {isShareholder && ` • TOPLAM: %${totalSharePercent.toFixed(1)}`}
                       </div>
                    </div>
                 </div>
                 <button 
                    onClick={commitToForm} 
                    disabled={localItems.length === 0}
                    title={localItems.length === 0 ? "Önce Kayıt Eklemelisiniz" : "Tüm Listeyi Sisteme Mühürle"} 
                    className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 ${localItems.length === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-900/20'}`}
                 >
                    <Save size={16} /> LİSTEYİ KAYDET
                 </button>
              </div>
           </div>
        )}

        {localItems.length === 0 && (
          <div className="relative">
             <button 
               onClick={addItem} 
               className="w-full py-20 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[48px] flex flex-col items-center justify-center gap-6 text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all group overflow-hidden"
             >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 rounded-[28px] bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-inner text-slate-400 group-hover:text-indigo-500">
                   <Plus size={40} />
                </div>
                <div className="text-center space-y-2 relative z-10">
                   <span className="text-xs font-black uppercase tracking-[0.4em] block">HİÇ KAYIT BULUNAMADI</span>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yeni bir {isShareholder ? 'hissedar' : 'kişi'} eklemek için buraya tıklayın</p>
                </div>
             </button>
          </div>
        )}
      </div>
      <FastCitizenModal 
          isOpen={isFastModalOpen} 
          onClose={() => {
            setIsFastModalOpen(false);
            setFastModalIdx(-1);
          }} 
          initialTCKN={fastModalIdx !== -1 && /^\d+$/.test(localItems[fastModalIdx]?.Ad_Soyad || '') ? localItems[fastModalIdx].Ad_Soyad : ''}
          onSuccess={(c) => {
              if (fastModalIdx !== -1) {
                selectCitizen(fastModalIdx, c);
              }
              setIsFastModalOpen(false);
              setFastModalIdx(-1);
          }}
      />
    </div>
  );
};
