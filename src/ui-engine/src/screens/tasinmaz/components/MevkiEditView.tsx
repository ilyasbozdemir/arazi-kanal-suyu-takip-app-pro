import React, { FC } from 'react';
import { 
  Bookmark, Navigation, Home, Search, 
  Layers, ChevronDown, CheckCircle2, AlertCircle, Activity, Info
} from 'lucide-react';

interface MevkiEditViewProps {
  values: any;
  setValues: (v: any) => void;
  availableCities: any[];
  availableDistricts: any[];
  availableTowns: any[];
  availableNeighborhoods: any[];
  availableLocations: any[];
  handleCityChange: (v: string) => void;
  handleDistrictChange: (v: string) => void;
  handleTownChange: (v: string) => void;
  handleNeighborhoodChange: (v: string) => void;
  displayNames: any;
  translateHeader: (h: string) => string;
}

export const MevkiEditView: FC<MevkiEditViewProps> = ({ 
  values, setValues, availableCities, availableDistricts, availableTowns, 
  availableNeighborhoods, availableLocations, handleCityChange, 
  handleDistrictChange, handleTownChange, handleNeighborhoodChange,
  displayNames, translateHeader
}) => {
  
  const isNewLocation = values.Mevki_Adi && !availableLocations.some(m => m.Mevki_Adi === values.Mevki_Adi);

  const renderFormField = (field: string, Icon: any) => {
    const isLocationSelect = ['Il', 'Ilce', 'Belde', 'Mahalle_Koy'].includes(field);
    // 🛡️ GÜVENLİK ZIRHI: Konum alanları için doğrudan hesaplanmış hiyerarşiyi (displayNames) kullan.
    const value = isLocationSelect ? (displayNames as any)[field] || '' : (values[field] || '');
    const label = translateHeader(field);
    const isMevkiNameField = field === 'Mevki_Adi';

    return (
      <div key={field} className="group flex flex-col space-y-2 relative">
          <div className="flex items-center gap-2 px-1">
             <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500"><Icon size={14} /></div>
             <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
          </div>

          <div className="relative">
             {isLocationSelect ? (
                <div className="relative">
                   {['Il', 'Ilce', 'Belde'].includes(field) ? (
                      <div className="w-full h-14 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-5 flex items-center text-sm font-black text-slate-400 uppercase tracking-tight">
                         {(displayNames as any)[field] || "BELİRTİLMEMİŞ"}
                      </div>
                   ) : (
                      <>
                         <select value={value} title={label}
                            onChange={(e) => {
                               const newVal = e.target.value;
                               if (field === 'Il') handleCityChange(newVal);
                               else if (field === 'Ilce') handleDistrictChange(newVal);
                               else if (field === 'Belde') handleTownChange(newVal);
                               else if (field === 'Mahalle_Koy') handleNeighborhoodChange(newVal);
                            }}
                            className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer"
                         >
                            <option value="">{label} Seçiniz...</option>
                            {(field === 'Il' ? availableCities : field === 'Ilce' ? availableDistricts : field === 'Belde' ? availableTowns : availableNeighborhoods).map(opt => (
                               <option key={opt.id} value={opt.Ad}>{opt.Ad}</option>
                            ))}
                         </select>
                         <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </>
                   )}
                </div>
             ) : isMevkiNameField ? (
                <>
                   <div className="relative">
                      <input list="location-options" value={value} title={label}
                         placeholder="MEVKİ ADINI GİRİN..."
                         onChange={(e) => {
                            setValues({ ...values, Mevki_Adi: e.target.value.toLocaleUpperCase('tr-TR') });
                         }}
                         className={`w-full h-14 bg-white dark:bg-slate-900 border-2 rounded-2xl px-5 text-sm font-bold outline-none transition-all ${!isNewLocation && value ? 'border-emerald-500' : 'border-slate-200 dark:border-white/10 focus:border-primary-500'}`}
                      />
                      <datalist id="location-options">
                         {availableLocations.map(opt => <option key={opt.id} value={opt.Mevki_Adi} />)}
                      </datalist>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         {value && !isNewLocation && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black"><CheckCircle2 size={12} /> KAYITLI</div>}
                         {isNewLocation && <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black"><AlertCircle size={14} className="animate-pulse" /> YENİ!</div>}
                         <Search className="text-slate-300" size={18} />
                      </div>
                   </div>
                   {isMevkiNameField && (
                      <p className="mt-3 px-1 text-[9px] font-black text-primary-500/80 uppercase tracking-widest flex items-center gap-2">
                         <Info size={12} /> Lütfen tapudaki asıl ismiyle yazınız.
                      </p>
                   )}
                </>
             ) : (
                <div className="space-y-3">
                  <textarea value={value} title={label} 
                    placeholder={field === 'Altyapi_Durumu' ? "SULAMA VE ALTYAPI BİLGİSİ..." : field === 'Bolge_Tipi' ? "BİTKİ ÖRTÜSÜ VE ARAZİ YAPISI..." : "AÇIKLAMA..."}
                    onChange={(e) => setValues({ ...values, [field]: e.target.value })}
                    className="w-full min-h-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-primary-500 transition-all"
                  />
                  
                  {/* 🛡️ AKILLI ÖNERİLER (KURUM ÖZEL) */}
                  {field === 'Altyapi_Durumu' && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {[
                        "Sulama kanalı ile yapılmaktadır. Haftanın belirli günlerinde (ayda 4-8 gün) su dağıtımı gerçekleşir.",
                        "Kapalı devre sulama sistemi mevcuttur.",
                        "Kuyulardan beslenen lokal şebeke."
                      ].map(suggestion => (
                        <button key={suggestion} type="button"
                          onClick={() => setValues({...values, [field]: suggestion})}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-primary-500/10 text-[9px] font-black text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                        >
                          + {suggestion.substring(0, 35)}...
                        </button>
                      ))}
                    </div>
                  )}

                  {field === 'Bolge_Tipi' && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {[
                        "Maki ve bodur ağaçlık (Akdeniz Bitki Örtüsü).",
                        "Tarımsal amaçlı sulu arazi.",
                        "Kıraç ve kayalık yamaç yapısı."
                      ].map(suggestion => (
                        <button key={suggestion} type="button"
                          onClick={() => setValues({...values, [field]: suggestion})}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 text-[9px] font-black text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
             )}
          </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 font-sans">
      <div className="bg-slate-50/50 dark:bg-slate-900/40 p-10 rounded-[40px] border border-slate-100 dark:border-white/5 space-y-10">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-6">
          <Layers className="text-primary-500" size={24} />
          <h3 className="text-xl font-black uppercase italic">Mevki Düzenleme</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderFormField("Mevki_Adi", Bookmark)}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/30 dark:bg-white/5 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5">
            {renderFormField("Bolge_Tipi", Layers)}
            {renderFormField("Altyapi_Durumu", Activity)}
          </div>
          {renderFormField("Il", Navigation)}
          {renderFormField("Ilce", Navigation)}
          {renderFormField("Belde", Home)}
          <div className="md:col-span-2">{renderFormField("Mahalle_Koy", Home)}</div>
          <div className="md:col-span-2">{renderFormField("Aciklama", Info)}</div>
        </div>
      </div>
    </div>
  );
};
