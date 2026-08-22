import React, { useState } from "react";
/* KURUM_GIS_ENGINE_V1 */
import { Globe, CheckCircle2, AlertCircle, MapPin, Settings, Map as MapIcon, Download } from "lucide-react";
import { FieldProps } from "./types";

export const GeoJSONField: React.FC<FieldProps> = ({ field: h, values, setValues, isEditing, translateHeader, draftGeometry, setDraftGeometry, isTouched, onBlur }) => {
  const geoValue = values[h] || "";
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"json" | "wizard">("wizard");
  const [showDevToggle, setShowDevToggle] = useState(false);
  const [wizardText, setWizardText] = useState("");

  const handleValidate = (val: string) => {
    if (!val) {
      setError(null);
      return;
    }
    try {
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      if (!parsed.type || !parsed.coordinates) {
        throw new Error("Geçersiz GeoJSON: 'type' ve 'coordinates' alanları zorunludur.");
      }
      setError(null);
      setValues({ ...values, [h]: JSON.stringify(parsed, null, 2) });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleWizardConvert = () => {
    try {
      const lines = wizardText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const coords = lines.map(l => {
        const parts = l.split(/[,;\s]+/).map(p => parseFloat(p));
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) throw new Error(`Hatalı satır: ${l}`);
        // [LNG, LAT] formatı
        return [parts[0], parts[1]];
      });

      if (coords.length === 0) throw new Error("Koordinat girilmedi!");

      let geo: any;
      if (coords.length === 1) geo = { type: "Point", coordinates: coords[0] };
      else if (coords.length > 2 && coords[0][0] === coords[coords.length-1][0] && coords[0][1] === coords[coords.length-1][1]) {
        geo = { type: "Polygon", coordinates: [coords] };
      } else {
        geo = { type: "LineString", coordinates: coords };
      }

      setValues({ ...values, [h]: JSON.stringify(geo, null, 2) });
      setError(null);
      setMode("json");
      (window as any).api.showAlert({ title: 'BAŞARILI', message: 'Koordinatlar GeoJSON formatına dönüştürüldü.', type: 'success' });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div key={h} className="col-span-full group relative p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[40px] transition-all hover:border-blue-500/20 shadow-sm overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Globe size={18} /></div>
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{translateHeader(h)}</h3>
               <p className="text-[10px] font-bold text-slate-500 italic uppercase">Geometri Yönetim Paneli</p>
            </div>
         </div>
         
         {isEditing && (
           <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                 <button 
                   type="button"
                   onClick={() => setMode("wizard")}
                   className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'wizard' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                 >
                    SİHİRBAZ
                 </button>
                 {showDevToggle && (
                    <button 
                      type="button"
                      onClick={() => setMode("json")}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'json' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                       JSON (DEV)
                    </button>
                 )}
              </div>
              <button 
                type="button"
                onClick={() => setShowDevToggle(!showDevToggle)}
                className={`p-3 rounded-xl transition-all ${showDevToggle ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                title="Gelişmiş Seçenekler"
              >
                 <Settings size={14} />
              </button>
           </div>
         )}
         {geoValue && !error && <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in"><CheckCircle2 size={12} /> AKTİF</div>}
      </div>

      {isEditing && draftGeometry && (
         <div className="p-6 bg-blue-500/10 border-2 border-dashed border-blue-500/30 rounded-[32px] flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-500 text-white rounded-2xl"><MapIcon size={18} /></div>
               <div>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">HARİTADAN TASLAK VERİ BULUNDU!</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Seçtiğiniz noktayı/çizgiyi buraya aktarabilirsiniz.</p>
               </div>
            </div>
            <button 
               type="button"
               onClick={() => {
                  setValues({ ...values, [h]: JSON.stringify(draftGeometry, null, 2) });
                  if (setDraftGeometry) setDraftGeometry(null);
                  setError(null);
                  (window as any).api.showAlert({ title: 'BAŞARILI', message: 'Haritadaki taslak veriler başarıyla aktarıldı!', type: 'success' });
               }}
               className="px-6 py-3 bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all"
            >
               <Download size={14} /> KAYIT ALTINA AL VE AKTAR
            </button>
         </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
            {mode === 'json' ? (
              <div className="relative">
                <textarea 
                  value={geoValue}
                  onChange={(e) => setValues({ ...values, [h]: e.target.value })}
                  onBlur={(e) => {
                    handleValidate(e.target.value);
                    if (onBlur) onBlur();
                  }}
                  placeholder='Örnek: { "type": "Point", "coordinates": [32.73, 37.13] }'
                  className={`w-full h-64 bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px] font-mono text-[11px] outline-none border-2 transition-all ${
                    error ? 'border-rose-500/30 focus:border-rose-500' : 'border-transparent focus:border-blue-500'
                  }`}
                />
                <button 
                  type="button"
                  onClick={() => handleValidate(geoValue)}
                  className="absolute top-4 right-4 p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all"
                >
                   <CheckCircle2 size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <textarea 
                  value={wizardText}
                  onChange={(e) => setWizardText(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Boylam, Enlem (32.730, 37.135)&#10;32.731, 37.136&#10;32.730, 37.135 (Kapatmak için aynı noktayı girin)"
                  className="w-full h-64 bg-emerald-50/30 dark:bg-emerald-500/5 p-6 rounded-[32px] font-mono text-[11px] outline-none border-2 border-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={handleWizardConvert}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase flex items-center gap-2"
                >
                   <CheckCircle2 size={14} /> DÖNÜŞTÜR VE EKLE
                </button>
              </div>
            )}
            
            {isTouched && error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in shake duration-500">
                 <AlertCircle size={16} className="text-rose-600" />
                 <span className="text-[10px] font-black uppercase text-rose-600 tracking-tight">{error}</span>
              </div>
            )}

           <div className="p-6 bg-blue-500/5 rounded-[32px] border border-blue-500/10">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">HIZLI YARDIM</h4>
              <ul className="text-[9px] font-bold text-slate-500 space-y-2 list-disc pl-4 uppercase leading-relaxed">
                 <li>Su Depoları için <span className="text-blue-500">"Point"</span> (Nokta) kullanın.</li>
                 <li>Kanallar için <span className="text-blue-500">"LineString"</span> (Çizgi) kullanın.</li>
                 <li>Bölgeler/Mevkiler için <span className="text-blue-500">"Polygon"</span> (Çokgen) kullanın.</li>
                 <li>Koordinatlar <span className="text-violet-500">[LNG, LAT]</span> (Boylam, Enlem) formatında olmalıdır.</li>
              </ul>
           </div>
        </div>
      ) : (
        <div className="relative">
           {geoValue ? (
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 font-mono text-[10px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                 {geoValue}
              </div>
           ) : (
              <div className="py-12 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
                 <div className="p-4 bg-slate-100 dark:bg-white/5 text-slate-300 rounded-3xl"><MapPin size={32} /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GEOMETRİK VERİ TANIMLANMAMIŞ</span>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

