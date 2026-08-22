import React from "react";
import { FieldProps } from "../types";

export const SuHakkiField: React.FC<FieldProps & { type?: string }> = ({ field: h, values, setValues, isEditing, translateHeader, type, isMandatory, isTouched, onBlur }) => {
  const isCreateMode = type === "create";

  // 🛡️ Güvenli değer yakalama (Case-insensitive ve alternatif isimler)
  const getSafeVal = () => {
    if (values[h] !== undefined && values[h] !== null) return values[h];
    const altKeys = ['Aylik_Su_Hakki', 'Su_Hakki_Saatlik', 'Su_Hakkı_Saatlik', h];
    for (const key of altKeys) {
       if (values[key] !== undefined && values[key] !== null) return values[key];
    }
    return "";
  };

  const val = getSafeVal();
  // 0 ise ve oluşturma modundaysak boş göster (giriş kolaylığı için), değilse değeri olduğu gibi göster
  const displayValue = (val === "0" || val === 0) ? (isCreateMode ? "" : "0") : val;
  const safeNum = parseFloat(String(val).replace(/\./g, '').replace(/,/g, '.').trim()) || 0;

  // 🛡️ DÜZENLEME MODU (Inline olmayan, tam panel)
  if (isEditing && !isCreateMode) {
    return (
      <div className="flex flex-col gap-2 w-full group">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 transition-colors group-focus-within:text-sky-500">SU HAKKI (SAAT / AY)</label>
        <div className="relative">
          <input 
            type="number"
            step="0.5"
            value={displayValue}
            onChange={(e) => setValues({...values, [h]: e.target.value})}
            onBlur={onBlur}
            className={`w-full text-2xl font-black bg-white dark:bg-white/5 border-2 ${
              isMandatory ? "border-rose-500/20 focus:border-rose-500 bg-rose-500/[0.03]" : "border-blue-500/20 focus:border-blue-500 bg-blue-500/[0.03]"
            } rounded-[24px] p-6 pr-24 outline-none text-slate-800 dark:text-white shadow-sm transition-all focus:shadow-xl tabular-nums`}
            placeholder="0"
            title="Aylık su hakkı saati"
          />
          <div className="absolute right-3 top-3 bottom-3 px-4 bg-sky-500/10 text-sky-600 rounded-xl border border-sky-500/10 flex flex-col items-center justify-center min-w-[80px] pointer-events-none">
             <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">PERİYOT</span>
             <span className="text-[11px] font-black italic leading-none">30 GÜN</span>
          </div>
        </div>
      </div>
    );
  }

  // 🛡️ OLUŞTURMA VEYA ÖZEL PANEL MODU
  return (
    <div className={`group relative flex flex-col p-4 border-2 rounded-[24px] shadow-sm transition-all duration-500 overflow-hidden min-h-[100px] justify-center ${
      isEditing 
        ? (isMandatory ? 'border-rose-500/20 bg-rose-500/[0.03] ring-4 ring-rose-500/5' : 'border-blue-500/20 bg-blue-500/[0.03] ring-4 ring-blue-500/5') 
        : 'border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900'
    }`}>
       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{translateHeader(h)}</h4>
       
       {isEditing ? (
         <div className="mt-4 relative z-10 space-y-3">
            <input 
              type="number"
              step="0.5"
              value={displayValue}
              onChange={(e) => setValues({ ...values, [h]: e.target.value })}
              onBlur={onBlur}
              placeholder="0.0"
              title="Aylık su hakkı düzenle"
              className="w-full text-4xl font-black bg-transparent border-none rounded-2xl p-2 outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10"
            />
            <div className="text-[10px] font-black text-sky-600 bg-sky-100 dark:bg-sky-500/10 self-start px-3 py-1 rounded-full border border-sky-200 dark:border-sky-500/20 italic tracking-widest uppercase">
               PERİYOT: 30 GÜN
            </div>
         </div>
       ) : (
         <div className="text-4xl font-black text-slate-800 dark:text-white mt-1 flex items-baseline gap-2 tabular-nums relative z-10">
           {safeNum.toLocaleString("tr-TR")}
           <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">SAAT / AY</span>
         </div>
       )}
    </div>
  );
};
