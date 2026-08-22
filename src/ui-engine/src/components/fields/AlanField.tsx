import React from "react";
import { FieldProps } from "../types";

export const AlanField: React.FC<FieldProps & { type?: string }> = ({ field: h, values, setValues, isEditing, translateHeader, type, isMandatory, isTouched, onBlur }) => {
  const dekarValue = (val: any) => {
    const cleanVal = String(val || "0").replace(/\./g, '').replace(/,/g, '.').trim();
    const safeNum = parseFloat(cleanVal) || 0;
    return (safeNum / 1000).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const m2Value = (val: any) => {
    const cleanVal = String(val || "0").replace(/\./g, '').replace(/,/g, '.').trim();
    const safeNum = parseFloat(cleanVal) || 0;
    return safeNum.toLocaleString("tr-TR");
  };

  const isCreateMode = type === "create";
  
  // 🛡️ Değer yakalama mantığı (Case-insensitive ve alternatif isimler)
  const getSafeVal = () => {
    if (values[h] !== undefined && values[h] !== null) return values[h];
    const altKeys = ['Alan_m2', 'alan_m2', 'ALAN_M2', 'ALAN'];
    for (const key of altKeys) {
      if (values[key] !== undefined && values[key] !== null) return values[key];
    }
    return "";
  };

  const val = getSafeVal();
  const displayValue = (val === "0" || val === 0) ? (isCreateMode ? "" : "0") : val;

  // 🛡️ DÜZENLEME MODU (Inline olmayan, tam panel)
  if (isEditing && !isCreateMode) {
    return (
      <div className="flex flex-col gap-2 w-full group">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 transition-colors group-focus-within:text-primary-500">TOPLAM ALAN (M²)</label>
        <div className="relative">
          <input 
            type="number"
            step="0.01"
            value={displayValue}
            onChange={(e) => setValues({...values, [h]: e.target.value})}
            onBlur={onBlur}
            className={`w-full text-2xl font-black bg-white dark:bg-white/5 border-2 ${
              isMandatory ? "border-rose-500/20 focus:border-rose-500 bg-rose-500/[0.03]" : "border-blue-500/20 focus:border-blue-500 bg-blue-500/[0.03]"
            } rounded-[24px] p-6 pr-28 outline-none text-slate-800 dark:text-white shadow-sm transition-all focus:shadow-xl tabular-nums`}
            placeholder="0"
            title="Alan m2 değeri"
          />
          <div className="absolute right-3 top-3 bottom-3 px-4 bg-primary-500/10 text-primary-600 rounded-xl border border-primary-500/10 flex flex-col items-center justify-center min-w-[90px] pointer-events-none">
             <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">DÖNÜM</span>
             <span className="text-[11px] font-black italic leading-none">{dekarValue(val)} DN.</span>
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
              value={displayValue}
              onChange={(e) => setValues({ ...values, [h]: e.target.value })}
              onBlur={onBlur}
              placeholder="0.00"
              className="w-full text-4xl font-black bg-transparent border-none rounded-2xl p-2 outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10"
            />
            <div className="text-[10px] font-black text-primary-600 bg-primary-100 dark:bg-primary-500/10 self-start px-3 py-1 rounded-full border border-primary-200 dark:border-primary-500/20 italic tracking-widest uppercase">
               ≈ {dekarValue(val)} DÖNÜM (DN.)
            </div>
         </div>
       ) : (
         <div className="text-4xl font-black text-slate-800 dark:text-white mt-1 flex flex-col tabular-nums relative z-10 leading-tight">
          <div className="flex items-baseline gap-2">
              {m2Value(val)} <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">M²</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1 opacity-80">
              <span className="text-slate-400">≈</span> {dekarValue(val)} <span className="text-[9px]">DÖNÜM (DN.)</span>
          </div>
         </div>
       )}
    </div>
  );
};
