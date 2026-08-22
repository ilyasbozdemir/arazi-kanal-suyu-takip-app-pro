import React, { useState } from "react";
import { Info, HelpCircle, LucideIcon, ShieldAlert, ChevronRight, Wand2, X } from "lucide-react";

interface DetailFieldProps {
  label: string;
  value: any;
  isEditing?: boolean;
  onChange: (v: any) => void;
  type?: string;
  placeholder?: string;
  isWarning?: boolean;
  icon?: LucideIcon;
  color?: string;
  helpText?: string;
  maxLength?: number;
  onlyNumeric?: boolean;
  onlyAlpha?: boolean;
  options?: (string | { label: string; value: any })[]; 
  listId?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isMandatory?: boolean;
  onBlur?: () => void;
  isTouched?: boolean;
}

export const DetailField: React.FC<DetailFieldProps> = ({ 
  label, value, isEditing, onChange, type = "text", placeholder, isWarning, icon: Icon, color = "primary", helpText, maxLength, onlyNumeric, onlyAlpha,
  listId, options, error, leftElement, rightElement, isMandatory, onBlur, isTouched
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const isEmpty = !value || (typeof value === "string" && value.trim() === "");
  
  const showMandatoryWarning = isMandatory && isEmpty && isEditing && isTouched;
  const showError = isTouched && error;

  const colorStyles: any = {
    primary: "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus-within:border-indigo-500",
    emerald: "border-emerald-500/40 focus-within:border-emerald-500 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]",
    blue: "border-blue-500/40 focus-within:border-blue-500 bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]",
    rose: "border-rose-500/20 focus-within:border-rose-500 bg-rose-500/[0.03] text-rose-600 dark:text-rose-400 shadow-[inset_0_0_20px_rgba(244,63,94,0.02)]",
    indigo: "border-indigo-500/20 focus-within:border-indigo-500 bg-indigo-500/5 text-indigo-500",
    slate: "border-slate-200 dark:border-white/10 focus-within:border-primary-500 bg-slate-50 dark:bg-white/5 text-slate-400",
  };

  // 🛡️ Zorunlu ve dokunulmuş alanlar için sert kırmızı çerçeve stili
  const warningStyle = "border-rose-500 ring-4 ring-rose-500/10 shadow-lg bg-rose-500/[0.05]";
  const currentStyle = (showMandatoryWarning || (isWarning && isTouched)) ? warningStyle : (colorStyles[color] || colorStyles.primary);

  return (
    <div className="flex flex-col gap-2 group/field w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 group-focus-within/field:text-primary-500 transition-colors">
          {Icon && <Icon size={12} className="opacity-50" />}
          {label}
          {helpText && <HelpCircle size={12} className="text-slate-300 opacity-0 group-hover/field:opacity-100 transition-opacity cursor-help" />}
        </label>
        <div className="relative flex items-center gap-2">
          {isWarning && isEditing && isTouched && <div className="p-1 bg-rose-500 text-white rounded-full animate-pulse shadow-lg shadow-rose-500/20"><Info size={10} /></div>}
          {type === "textarea" && options && options.length > 0 && isEditing && (
            <>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowTemplates(!showTemplates); }}
                className={`p-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${showTemplates ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'}`}
                title="Hazır Şablonlar"
              >
                <Wand2 size={13} />
                <span className="hidden sm:inline">ŞABLON</span>
              </button>
              {showTemplates && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95 origin-top-right">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Wand2 size={12} /> ÖNERİLEN ŞABLONLAR
                    </span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setShowTemplates(false); }} className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
                    {options.map((opt, i) => {
                      const labelStr = typeof opt === 'string' ? opt : opt.label;
                      const valStr = typeof opt === 'string' ? opt : opt.value;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onChange(value ? value + '\n' + valStr : valStr);
                            setShowTemplates(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors group/opt"
                        >
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover/opt:text-indigo-600 dark:group-hover/opt:text-indigo-400 leading-relaxed">
                            {labelStr}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {showTemplates && (
                <div className="fixed inset-0 z-[99]" onClick={(e) => { e.preventDefault(); setShowTemplates(false); }} />
              )}
            </>
          )}
        </div>
      </div>


      <div className={`relative flex items-center border-2 rounded-[20px] transition-all duration-300 min-h-[56px] ${currentStyle} shadow-sm hover:shadow-md focus-within:shadow-xl focus-within:shadow-primary-500/5 group-focus-within/field:scale-[1.01]`}>
        {isEditing && leftElement && (
           <div className="absolute left-3 z-20 flex items-center justify-center">
              {leftElement}
           </div>
        )}

        {isEditing ? (
          type === "select" ? (
            <div className="relative w-full h-full flex items-center px-2">
              {(() => {
                if (type === "select") {
                  console.log(`[DetailField:${label}] Select Render - Value:`, value, "Options:", options);
                }
                return null;
              })()}
              <select
                value={value || ""}
                title={label}
                onBlur={onBlur}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full h-full bg-transparent p-3 ${leftElement ? 'pl-14' : ''} ${rightElement ? 'pr-20' : 'pr-10'} text-lg font-black text-slate-800 dark:text-white appearance-none cursor-pointer z-10 outline-none`}
              >
                 <option value="" className="bg-slate-900 border-none italic">SEÇİNİZ...</option>
                 {options?.map(opt => {
                   const label = typeof opt === 'string' ? opt : opt.label;
                   const val = typeof opt === 'string' ? opt : opt.value;
                   return <option key={val} value={val} className="bg-slate-800 text-white font-bold">{label}</option>;
                 })}
              </select>
              <div className="absolute right-4 pointer-events-none opacity-40 z-20">
                 <HelpCircle size={16} className="translate-y-[1px]" />
              </div>
            </div>
          ) : type === "textarea" ? (
            <div className="w-full h-full flex flex-col overflow-visible">
              <textarea
                id={`textarea-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`}
                value={value || ""}
                onBlur={onBlur}
                title={label}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Buraya notlarınızı yazabilirsiniz..."}
                maxLength={maxLength}
                className={`w-full bg-transparent p-3 text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none resize-y min-h-[100px] ${leftElement ? 'pl-14' : ''}`}
              />
            </div>
          ) : (
            <>
              <input 
                id={`input-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`}
                type={type}
                value={value || ""}
                onBlur={onBlur}
                list={listId}
                title={label}
                onChange={(e) => {
                  let val = e.target.value;
                  if (onlyNumeric) {
                    val = val.replace(/\D/g, '');
                  } else if (onlyAlpha) {
                    val = val.replace(/[^a-zA-ZğüşiöçĞÜŞİÖÇ0-9\.\s]/g, '');
                    val = val.split(' ').map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')).join(' ');
                  }
                  onChange(val);
                }}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full h-full bg-transparent p-3 ${leftElement ? 'pl-12' : ''} ${rightElement || listId ? 'pr-32' : ''} text-xl font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none tabular-nums z-10`}
              />
              {listId && (
                <div className="absolute right-6 pointer-events-none opacity-40 z-20">
                   <ChevronRight size={18} className="rotate-90" />
                </div>
              )}
              {listId && options && (
                <datalist id={listId}>
                  {options.map((opt, i) => {
                    const val = typeof opt === 'string' ? opt : opt.value;
                    return <option key={i} value={val} />;
                  })}
                </datalist>
              )}
            </>
          )
        ) : (
          type === "textarea" ? (
            <div className="w-full p-3">
              {value ? (
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {value}
                </p>
              ) : (
                <p className="text-sm font-bold text-slate-300 dark:text-white/20 italic">---</p>
              )}
            </div>
          ) : (
            <div className="w-full p-3 text-xl font-black text-slate-800 dark:text-white italic truncate tracking-tight uppercase">
              {(() => {
                if (type === "select" && options) {
                  const selected = options.find(opt => {
                    const val = typeof opt === 'string' ? opt : opt.value;
                    return String(val) === String(value);
                  });
                  if (selected) return typeof selected === 'string' ? selected : selected.label;
                }
                return value === 1 ? "AKTİF" : value === 0 ? "PASİF" : (value || "---");
              })()}
            </div>
          )
        )}

        {isEditing && rightElement && (
           <div className="absolute right-3 z-20 flex items-center justify-center">
              {rightElement}
           </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/field:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>
      
      {showError && (
        <span className="px-1 text-[11px] font-black text-rose-500 uppercase tracking-tighter animate-bounce flex items-center gap-1 mt-1">
          <ShieldAlert size={12} /> {showError}
        </span>
      )}

      {showMandatoryWarning && (
        <span className="px-1 text-[11px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1 mt-1">
          <ShieldAlert size={12} /> BU ALAN DOLDURULMALIDIR
        </span>
      )}

      {helpText && !error && !showMandatoryWarning && (
        <span className="px-1 text-[9px] font-bold text-slate-400 italic uppercase leading-tight tracking-tighter">{helpText}</span>
      )}
    </div>
  );
};
