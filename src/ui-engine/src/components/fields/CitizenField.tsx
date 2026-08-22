import React, { useState, useEffect } from "react";
import { Fingerprint, User, Search, CheckCircle2, UserPlus, HelpCircle, PlusCircle } from "lucide-react";
import { FieldProps } from "./types";
import { FastCitizenModal } from "@renderer/screens/vatandas/components/modals/FastCitizenModal";
import { useAppStore } from "@renderer/store/useAppStore";

export const CitizenField: React.FC<FieldProps & { 
  citizens: any[],
  tcknStatus?: any,
  debounceTimer?: any,
  checkTCKNExistence?: (v: string) => void,
  isTouched?: boolean,
  onBlur?: () => void
}> = (props) => {
  const { 
    field: h, values, setValues, isEditing, citizens, translateHeader, 
    tcknStatus, debounceTimer, checkTCKNExistence, error, renderTooltip,
    isTouched, onBlur
  } = props;
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isFastModalOpen, setIsFastModalOpen] = useState(false);
  
  // 🛡️ Sarsılmaz Senkronizasyon: Global store'dan güncel vatandaş listesini al
  const globalCitizens = useAppStore(state => state.cachedData?.DATA_Vatandas || []);
  const citizensList = (citizens && citizens.length > 0) ? citizens : globalCitizens;

  const currentVal = values[h] || "";
  const match = (citizensList || []).find((c: any) => 
    c.id === currentVal ||
    c.TCKN === currentVal || 
    c.Sicil_No === currentVal
  );

  useEffect(() => {
    if (match) {
        setSearchTerm(`${match.Ad} ${match.Soyad}`);
    } else {
        setSearchTerm(currentVal);
    }
  }, [currentVal, match]);

  const filteredCitizens = React.useMemo(() => {
    if (!searchTerm) return [];
    const search = (searchTerm || "").toLocaleUpperCase('tr-TR');
    return (citizensList || []).filter((c: any) => {
      const tcknStr = String(c.TCKN || "");
      const sicilStr = String(c.Sicil_No || "");
      const adStr = (c.Ad || "").toLocaleUpperCase('tr-TR');
      const soyadStr = (c.Soyad || "").toLocaleUpperCase('tr-TR');
      const tamAd = `${adStr} ${soyadStr}`;

      return (
        tcknStr.includes(searchTerm) || 
        adStr.includes(search) ||
        soyadStr.includes(search) ||
        tamAd.includes(search) ||
        sicilStr.includes(searchTerm)
      );
    }); // 🛡️ Sarsılmaz Karar: .slice(0, 5) kaldırıldı, tüm sonuçlar dökülsün!
  }, [citizensList, searchTerm]);

  const handleSelect = (c: any) => {
    const updates: any = {};
    if (h === "Vatandas_Id") {
        updates[h] = c.id; // 🛡️ DB İlişkisi: TCKN yerine UUID veriyoruz (FK Hatası Çözümü)
        updates.Ad_Soyad = `${c.Ad} ${c.Soyad}`;
        // 🛡️ OTOMATİK DOLDURMA: Profil/Personel verilerini kütükten çek
        if (c.Telefon) updates.Telefon = c.Telefon;
        if (c.Eposta) updates.Eposta = c.Eposta;
    } else if (h === "Ad_Soyad") {
        updates[h] = `${c.Ad} ${c.Soyad}`;
        updates.Vatandas_Id = c.id;
        if (c.Telefon) updates.Telefon = c.Telefon;
        if (c.Eposta) updates.Eposta = c.Eposta;
    } else {
        updates[h] = c.id; // 🛡️ DB İlişkisi: UUID (id) kullanılmalı
        if (h === "Tapu_Sahibi_TCKN") {
            updates.Tapu_Sahibi_Adi_Soyadi = `${c.Ad} ${c.Soyad}`;
            updates.Sahip_id = c.id; 
        }
        if (h === "Zilyet_TCKN") {
            updates.Zilyet_id = c.id;
        }
    }
    setValues({ ...values, ...updates });
    setSearchTerm(`${c.Ad} ${c.Soyad}`); // Seçilen ismi inputta göster
    setShowResults(false);
    if (checkTCKNExistence) checkTCKNExistence(c.TCKN);
  };

  const isError = isTouched && (!!error || tcknStatus?.status === "error");
  const isSuccess = tcknStatus?.status === "success" || (match && !error);

  return (
    <div className={`group relative w-full p-6 bg-white dark:bg-slate-900 border-2 rounded-[32px] transition-all flex flex-col min-h-[120px] ${
        isError ? "border-rose-500 bg-rose-500/5 shadow-rose-500/10 shadow-lg" : 
        isSuccess ? "border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10 shadow-lg" : 
        "border-slate-100 dark:border-white/5 hover:border-primary-500/20 hover:shadow-2xl"
    }`}>
      <div className="flex justify-between items-start mb-4">
         <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
               <Fingerprint size={14} className={isError ? "text-rose-500" : (isSuccess ? "text-emerald-500" : "text-primary-500")} />
               <label className={`text-[9px] font-black uppercase tracking-[0.2em] ${isError ? "text-rose-500" : (isSuccess ? "text-emerald-500" : "text-slate-400 dark:text-slate-500")}`}>{translateHeader(h)}</label>
               {renderTooltip?.(h) || <HelpCircle size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />}
            </div>
            <div className={`h-0.5 w-6 rounded-full ${isError ? "bg-rose-500/50" : (isSuccess ? "bg-emerald-500/50" : "bg-primary-500/20")}`} />
         </div>
         {isSuccess && <CheckCircle2 size={16} className="text-emerald-500 animate-in zoom-in" />}
         {isError && <div className="p-1 bg-rose-500 text-white rounded-full animate-pulse"><Search size={10} /></div>}
      </div>

      <div className="relative mt-auto">
        {isEditing ? (
          <>
            <div className="relative">
              <input 
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                    // 🛡️ OTOMATİK EŞLEŞTİRME: 11 haneli TCKN girildiyse kütükten bul ve mühürle
                    if (e.target.value.length === 11 && /^\d+$/.test(e.target.value)) {
                        const autoMatch = (citizensList || []).find((c: any) => c.TCKN === e.target.value || c.Sicil_No === e.target.value);
                        if (autoMatch) {
                            handleSelect(autoMatch);
                        } else {
                            setValues({ ...values, [h]: e.target.value });
                            if (checkTCKNExistence) checkTCKNExistence(e.target.value);
                        }
                    }
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => {
                    if (onBlur) onBlur();
                    setTimeout(() => setShowResults(false), 200);
                }}
                placeholder="TCKN VEYA İSİM İLE ARAYIN..."
                className={`w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-base font-black outline-none border-2 transition-all ${
                    isError ? "border-rose-500/20 text-rose-500 focus:border-rose-500" :
                    isSuccess ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 focus:border-emerald-500" :
                    "border-transparent focus:border-primary-500 text-slate-800 dark:text-white"
                } ${match ? 'pr-32' : 'pr-12'}`}
              />
              {match ? (
                 <button 
                   type="button" 
                   onClick={() => {
                      const updates: any = { [h]: "" };
                      if (h === "Vatandas_Id") updates.Ad_Soyad = "";
                      if (h === "Tapu_Sahibi_TCKN") updates.Tapu_Sahibi_Adi_Soyadi = "";
                      setValues({ ...values, ...updates });
                      setSearchTerm("");
                   }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-[9px] font-black uppercase rounded-lg transition-all"
                 >
                    DEĞİŞTİR
                 </button>
              ) : (
                 <Search size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isError ? "text-rose-400" : (isSuccess ? "text-emerald-400" : "text-slate-300")}`} />
              )}
            </div>

              <div className="flex items-center justify-between mt-2 px-1">
                 {error && (
                   <div className="text-[9px] font-black text-rose-500 uppercase italic animate-bounce">{error}</div>
                 )}
                 <button 
                   type="button"
                   onClick={() => setIsFastModalOpen(true)}
                   className="ml-auto flex items-center gap-1.5 text-primary-600 hover:text-primary-500 text-[9px] font-black uppercase transition-all"
                 >
                    <PlusCircle size={10} /> YENİ VATANDAŞ EKLE
                 </button>
              </div>

            {showResults && searchTerm.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[999] mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[28px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                 <div className="max-h-[30vh] md:max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredCitizens.length > 0 ? (
                       filteredCitizens.map((c: any, cIdx: number) => (
                         <button
                           key={c.id || cIdx}
                           type="button"
                           onClick={() => handleSelect(c)}
                           className="w-full p-4 flex items-center gap-4 hover:bg-emerald-500/5 transition-colors border-b last:border-0 border-slate-50 dark:border-white/5 text-left group/item"
                         >
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                               <User size={18} />
                            </div>
                            <div className="flex-1">
                               <div className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{c.Ad} {c.Soyad}</div>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">TC: {c.TCKN}</span>
                                  {c.Sicil_No && <span className="text-[10px] font-bold text-indigo-400">({c.Sicil_No})</span>}
                                  {(c.Ana_Adi || c.Baba_Adi) && (
                                    <span className="text-[9px] font-black text-primary-500/60 uppercase tracking-widest">
                                      (A: {c.Ana_Adi || '-'} B: {c.Baba_Adi || '-'})
                                    </span>
                                  )}
                               </div>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                               <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                         </button>
                       ))
                    ) : (
                        <div className="p-4 text-center space-y-3">
                           <p className="text-[10px] font-bold text-slate-400 uppercase italic">Kayıt Bulunamadı</p>
                           <button 
                             type="button"
                             onClick={() => setIsFastModalOpen(true)}
                             className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-primary-500 transition-all active:scale-95"
                           >
                              <UserPlus size={12} /> YENİ KİŞİ EKLE
                           </button>
                        </div>
                    )}
                 </div>
              </div>
            )}
            
            <FastCitizenModal 
                isOpen={isFastModalOpen} 
                onClose={() => setIsFastModalOpen(false)} 
                initialTCKN={/^\d+$/.test(searchTerm) ? searchTerm : ''}
                onSuccess={async (c) => {
                    handleSelect(c);
                    setIsFastModalOpen(false);
                    // 🛡️  ANINDA GÜNCELLEME: Yeni vatandaş eklendiğinde cache'i tazele
                    await useAppStore.getState().refreshAll();
                }}
            />
          </>
        ) : (
          <div className="flex flex-col">
             <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{match ? `${match.Ad} ${match.Soyad}` : (values[h] || '---')}</span>
             <div className="flex items-center gap-3">
                {match && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TCKN: {match.TCKN}</span>}
                {match && (match.Ana_Adi || match.Baba_Adi) && (
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                    A: {match.Ana_Adi || '-'} B: {match.Baba_Adi || '-'}
                  </span>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

