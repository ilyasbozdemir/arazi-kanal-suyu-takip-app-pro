import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Home,
  MapPin,
  Navigation,
  Plus,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
import { useAppStore } from "@renderer/store/useAppStore";
/* 🛡️ KURUM_SYNC_V5 */

const EMPTY_ARRAY: any[] = [];

interface MevkiFieldProps {
  field: string;
  values: any;
  setValues: (v: any) => void;
  mevkiler: any[];
  isRequiredFieldEmpty: (f: string) => boolean;
  isTouched?: boolean;
  onBlur?: () => void;
  onOpenCreate?: (table: string, data?: any) => void;
}

export const MevkiField: React.FC<MevkiFieldProps> = ({
  field,
  values,
  setValues,
  mevkiler,
  isRequiredFieldEmpty,
  isTouched,
  onBlur,
  onOpenCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const allLocations = useAppStore((state) =>
    state.cachedData.TANIM_Konumlar || EMPTY_ARRAY
  );
  const locationsFromStore = useAppStore((state) =>
    state.cachedData.DATA_Tasinmaz_Mevkileri || EMPTY_ARRAY
  );

  const locationsToUse = useMemo(() => {
    // 🛡️ Sarsılmaz Veri Önceliği: Store'daki veri JOIN'li ve zengindir. 
    // Mevki alanı sadece DATA_Tasinmaz_Mevkileri tablosunu kullanmalıdır.
    // Mahallelerin (TANIM_Konumlar) buraya karışması veritabanı ilişkilerini bozar.
    return locationsFromStore || EMPTY_ARRAY;
  }, [locationsFromStore]);

  // 🛡️ Senkronizasyon: Sadece ID veya Temp Name değiştiğinde çalış
  React.useEffect(() => {
    const currentMevki = locationsToUse?.find((m: any) =>
      m.id === values[field]
    );
    if (currentMevki) {
      setSearchTerm(currentMevki.Ad || currentMevki.Mevki_Adi || "");
    } else if (values._Mevki_Temp_Name) {
      setSearchTerm(values._Mevki_Temp_Name);
    } else {
      setSearchTerm("");
    }
  }, [values[field], values._Mevki_Temp_Name, field]);

  const filtered = useMemo(() => {
    const list = (locationsToUse || []) as any[];
    if (!searchTerm) return list.slice(0, 50);
    const s = searchTerm.toLocaleUpperCase("tr-TR");
    return list.filter((m: any) =>
      (m.Ad || m.Mevki_Adi || "").toLocaleUpperCase("tr-TR").includes(s)
    ).slice(0, 50);
  }, [locationsToUse, searchTerm]);

  const isExactMatch = useMemo(() => {
    return locationsToUse?.some(
      (m: any) => (m.Ad || m.Mevki_Adi)?.toLocaleUpperCase("tr-TR") === searchTerm.toLocaleUpperCase("tr-TR")
    );
  }, [searchTerm, locationsToUse]);

  // 🛡️ Otomatik Seçim: Tam eşleşme varsa ID'yi otomatik bağla
  React.useEffect(() => {
    if (!values[field] && searchTerm && isExactMatch) {
      const match = locationsToUse?.find(
        (m: any) => (m.Ad || m.Mevki_Adi)?.toLocaleUpperCase("tr-TR") === searchTerm.toLocaleUpperCase("tr-TR")
      );
      if (match) {
        setValues({ ...values, [field]: match.id, _Mevki_Temp_Name: undefined });
      }
    }
  }, [searchTerm, locationsToUse, isExactMatch]);


/*
  React.useEffect(() => {

    console.log(filtered)

  }, [filtered]);
*/

  return (
    <div
      className={`relative group flex flex-col gap-2.5 ${isOpen ? "z-[110]" : "z-auto"
        }`}
    >
      <div className="flex items-center justify-between px-6">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <MapPin size={10} className="text-primary-500" /> MEVKİ / BÖLGE SEÇİMİ
        </label>
        {values[field] && (
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
            <Check size={10} /> SEÇİLDİ
          </span>
        )}
      </div>

      <div
        className={`relative h-20 rounded-[32px] border-2 transition-all duration-500 flex items-center px-8 cursor-text overflow-hidden ${isRequiredFieldEmpty(field) && isTouched
            ? "bg-rose-50/50 border-rose-500 shadow-[0_0_40px_-10px_rgba(244,63,94,0.2)]"
            : isOpen
              ? "bg-white dark:bg-slate-900 border-primary-500 shadow-[0_20px_50px_-20px_rgba(59,130,246,0.3)] scale-[1.02]"
              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-300 dark:hover:border-white/20"
          }`}
        onClick={() => setIsOpen(true)}
      >
        <div
          className={`p-3 rounded-2xl transition-all duration-500 ${values[field]
              ? "bg-emerald-500/10 text-emerald-500 rotate-[360deg]"
              : "bg-slate-50 dark:bg-white/5 text-slate-400"
            }`}
        >
          <MapPin size={22} strokeWidth={values[field] ? 2.5 : 2} />
        </div>

        <input
          type="text"
          value={searchTerm}
          placeholder="Mevki ara veya yeni yaz..."
          onChange={(e) => {
            const val = e.target.value.toLocaleUpperCase("tr-TR");
            setSearchTerm(val);
            setIsOpen(true);
            const found = mevkiler?.find((m) =>
              (m.Ad || m.Mevki_Adi)?.toLocaleUpperCase("tr-TR") === val
            );
            if (found) {
              setValues({
                ...values,
                [field]: found.id,
                _Mevki_Temp_Name: undefined,
              });
            } else {
              setValues({
                ...values,
                _Mevki_Temp_Name: val,
                [field]: undefined,
              });
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent border-none outline-none pl-6 pr-10 text-xl font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 tracking-tight"
        />

        <div
          className={`transition-all duration-500 ${isOpen ? "rotate-180 text-primary-500" : "text-slate-300"
            }`}
        >
          <ChevronDown size={24} strokeWidth={3} />
        </div>

        {/* 🛡️ Subtle Glow Effect */}
        {isOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
        )}
      </div>

      <p className="mt-3 px-6 text-[9px] font-black text-primary-500/80 uppercase tracking-widest flex items-center gap-2">
         <Info size={12} /> Lütfen tapudaki asıl ismiyle yazınız.
      </p>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 origin-top ${filtered.length === 0 && !searchTerm ? 'hidden' : ''}`}>
          {(filtered.length > 0 || searchTerm) && (
            <div className="p-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">
                {filtered.length > 0 ? 'MEVCUT MEVKİLER' : 'SONUÇ BULUNAMADI'}
              </span>
              {filtered.length > 0 && (
                <span className="text-[9px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full uppercase">
                  {filtered.length} SONUÇ
                </span>
              )}
            </div>
          )}

          <div className={`${filtered.length === 0 ? 'max-h-fit' : 'max-h-[30vh] md:max-h-[350px]'} overflow-y-auto custom-scrollbar p-2 space-y-1`}>
            {filtered.length > 0
              ? (
                filtered.map((m, idx) => (
                 <button
                  key={m.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setValues({
                      ...values,
                      [field]: m.id,
                      _Mevki_Temp_Name: undefined,
                    });
                    setSearchTerm(m.Ad || m.Mevki_Adi);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-[28px] transition-all duration-500 flex items-center justify-between group/item relative overflow-hidden ${
                    values[field] === m.id
                      ? "bg-primary-500 text-white shadow-2xl shadow-primary-500/40 scale-[0.98]"
                      : "hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >


                  {/* 🛡️ Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                  
                  {/* 🛡️ Left Indicator Line */}
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full transition-all duration-500 ${
                    values[field] === m.id ? "bg-white scale-y-100" : "bg-primary-500 scale-y-0 group-hover/item:scale-y-100"
                  }`} />

                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-3 rounded-2xl transition-all duration-500 ${
                      values[field] === m.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/item:text-primary-500 group-hover/item:bg-primary-500/10"
                    }`}>
                       <MapPin size={20} strokeWidth={2.5} />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className={`text-base font-black tracking-tight transition-colors duration-300 ${
                        values[field] === m.id ? "text-white" : "text-slate-800 dark:text-slate-100 group-hover/item:text-primary-500"
                      }`}>
                        {m.Ad || m.Mevki_Adi}
                      </span>
                      
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                        values[field] === m.id ? "text-white/70" : "text-slate-400"
                      }`}>
                        <Navigation size={10} className="shrink-0 -rotate-45" />
                        <span className="whitespace-nowrap flex items-center gap-2">
                           {m.Mahalle_Koy_Adi || m.Mahalle_Koy || "KONUM BELİRTİLMEMİŞ"}
                           {m.TGKM_Mahalle_Ad && (
                              <span className="px-2 py-0.5 bg-primary-500/10 text-primary-600 rounded text-[8px] font-black tracking-tighter">
                                 TGKM: {m.TGKM_Mahalle_Ad}
                              </span>
                           )}
                        </span>
                        <div className="flex items-center gap-1 opacity-60 text-[9px]">
                           {m.Belde && <><span className="mx-0.5 opacity-40">•</span><span className="whitespace-nowrap">{m.Belde}</span></>}
                           {m.Ilce && <><span className="mx-0.5 opacity-40">•</span><span className="whitespace-nowrap">{m.Ilce}</span></>}
                        </div>
                      </div>
                    </div>
                  </div>


                  {values[field] === m.id ? (
                    <div className="p-2.5 bg-white/20 rounded-full relative z-10">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-4 group-hover/item:translate-x-0 relative z-10">
                      <div className="p-2 bg-primary-500/10 rounded-full">
                         <ChevronDown className="-rotate-90 text-primary-500" size={20} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
                ))
              )
              : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Search
                      size={20}
                      className="text-slate-200 dark:text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      EŞLEŞEN KAYIT YOK
                    </p>
                  </div>
                </div>
              )}
          </div>

          {searchTerm && !isExactMatch && (
            <div className="p-2 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-white/5 border-t border-slate-100 dark:border-white/5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenCreate) {
                    onOpenCreate("DATA_Tasinmaz_Mevkileri", {
                      Mevki_Adi: searchTerm,
                    });
                    // 🛡️ Sarsılmaz Bildirim: Kayıt sonrası listenin yenilenmesi için tetikle
                    useAppStore.getState().notifyChange(
                      "DATA_Tasinmaz_Mevkileri",
                    );
                  } else {
                    setValues({
                      ...values,
                      _Mevki_Temp_Name: searchTerm,
                      [field]: undefined,
                    });
                  }
                  setIsOpen(false);
                }}
                className="w-full relative group/new h-16 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-[24px] shadow-[0_15px_30px_-10px_rgba(59,130,246,0.5)] transition-all duration-500 flex items-center px-8 gap-4 overflow-hidden active:scale-[0.97]"
              >
                {/* 🛡️ Animated Background Sparkles */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="p-2 bg-white/20 rounded-xl group-hover/new:rotate-[360deg] transition-all duration-700">
                  <Plus size={16} strokeWidth={3} />
                </div>

                <div className="flex flex-col text-left relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-80 leading-none mb-1">
                    YENİ MEVKİ OLARAK KAYDET
                  </span>
                  <span className="text-sm font-black tracking-tight flex items-center gap-2 leading-none">
                    {searchTerm}{" "}
                    <Sparkles
                      size={12}
                      className="text-amber-300 animate-pulse"
                    />
                  </span>
                </div>

                <div className="ml-auto opacity-0 group-hover/new:opacity-100 group-hover/new:translate-x-0 translate-x-4 transition-all duration-500">
                  <ChevronDown
                    className="-rotate-90"
                    size={20}
                    strokeWidth={3}
                  />
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🛡️ Click outside backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/5 dark:bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
