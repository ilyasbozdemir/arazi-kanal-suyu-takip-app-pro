import React from "react";
/* Kurum_SYNC_FORCE_V4 */
import { Layers, HelpCircle } from "lucide-react";
import { FieldProps } from "./types";

export const AdaParselField: React.FC<FieldProps> = ({ field: h, values, setValues, isEditing, translateHeader, isMandatory, isTouched, onBlur }) => {
  const ada = values.Ada || "";
  const parsel = values.Parsel || "";
  const [localVal, setLocalVal] = React.useState(ada && parsel ? `${ada}/${parsel}` : (ada || parsel));
  
  const isEmpty = !ada && !parsel;

  const handleChange = (val: string) => {
    let formatted = val;
    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      if (trimmed && !trimmed.includes('/')) {
        formatted = trimmed + '/';
      }
    }
    
    setLocalVal(formatted);

    const updates: any = {};
    if (formatted.includes("/")) {
      const [a, p] = formatted.split("/");
      updates.Ada = a.trim();
      updates.Parsel = p.trim();
    } else {
      updates.Ada = formatted.trim();
      updates.Parsel = "";
    }
    
    const finalValues = { ...values, ...updates };
    delete finalValues.Ada_Parsel_Combined;
    setValues(finalValues);
  };

  React.useEffect(() => {
    if (values.Ada_Parsel_Combined) {
       const { Ada_Parsel_Combined, ...rest } = values;
       setValues(rest);
    }
  }, []);

  return (
    <div className={`flex flex-col gap-2 group/field w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${isMandatory && isEditing && isTouched && isEmpty ? 'ring-1 ring-rose-500/10 rounded-[32px] p-2 -m-2' : ''}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <label htmlFor={h} className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-violet-500 transition-colors">
            <Layers size={12} className="opacity-50" />
            {translateHeader("Ada_Parsel")}
          </label>
          {isEditing && (
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-5 mt-0.5 italic">
               İPUCU: ADA'DAN SONRA BOŞLUK BIRAKIRSANIZ OTOMATİK "/" EKLENİR
            </p>
          )}
        </div>
      </div>

      <div className={`relative flex items-center border-2 rounded-[28px] transition-all duration-300 h-20 ${
        isEditing 
          ? (isEmpty 
              ? (isMandatory ? (isTouched ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/[0.05]" : "border-rose-500/20 bg-rose-500/[0.03] text-rose-600 dark:text-rose-400 focus-within:border-rose-500") : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus-within:border-indigo-500")
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus-within:border-indigo-500"
            )
          : "border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5"
      } shadow-sm hover:shadow-md group-focus-within/field:scale-[1.01]`}>
        {isEditing ? (
          <div className="w-full h-full relative flex items-center">
            <input 
              id={h}
              value={localVal} 
              onBlur={onBlur}
              onChange={(e) => handleChange(e.target.value)} 
              placeholder="ADA / PARSEL (Örn: 305/428)" 
              className="w-full h-full bg-transparent px-6 pr-12 text-lg font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none tabular-nums z-10" 
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-violet-500/30">
               <HelpCircle size={20} />
            </div>
          </div>
        ) : (
          <div className="w-full px-6 text-xl font-black text-slate-800 dark:text-white uppercase italic truncate tracking-tight">
             {isEmpty ? '---' : `${ada} / ${parsel}`}
          </div>
        )}
      </div>
    </div>
  );
};
