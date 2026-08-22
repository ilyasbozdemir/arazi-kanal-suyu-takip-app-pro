import React from 'react';
import { Search, MapPin, Layers, FileText, Globe, Trash2, MousePointer2, Info, RefreshCcw, Map as MapIcon } from 'lucide-react';

interface MapSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  activeTab: 'tapu' | 'import' | 'official';
  setActiveTab: (val: 'tapu' | 'import' | 'official') => void;
  filteredTapular: any[];
  selectedTapu: any;
  handleSelectTapu: (t: any) => void;
  setSabitlemeTarget: (t: any) => void;
  setIsSabitlemeMode: (val: boolean) => void;
  handleLinkGeometry: (t: any) => void;
  importedLayers: any[];
  handleDeleteLayer: (id: string) => void;
  onRefresh: () => void;
  onImportFile: () => void;
  parselData: any[];
  tapular: any[];
  mapSettings: any;
  onUpdateSetting: (key: string, value: any) => void;
  locations?: any[];
  onSelectLocation: (loc: any) => void;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  isOpen, setIsOpen, searchTerm, setSearchTerm, activeTab, setActiveTab,
  filteredTapular, selectedTapu, handleSelectTapu, setSabitlemeTarget,
  setIsSabitlemeMode, handleLinkGeometry, importedLayers, handleDeleteLayer,
  onRefresh, onImportFile, parselData, tapular,
  mapSettings, onUpdateSetting, locations = [], onSelectLocation
}) => {

  const il = locations.find(l => l.Tip === 'İL');
  const ilce = locations.find(l => l.Tip === 'İLÇE');
  const belde = locations.find(l => l.Tip === 'BELDE');
  const mahalles = locations.filter(l => l.Tip === 'MAHALLE');

  return (
    <div 
      className={`h-full bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-white/5 flex flex-col z-[1001] shadow-2xl transition-all duration-500 ease-in-out relative ${isOpen ? 'w-[400px]' : 'w-0'}`}
    >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Paneli Kapat" : "Paneli Aç"}
          aria-label={isOpen ? "Paneli Kapat" : "Paneli Aç"}
          className="absolute top-1/2 -right-6 -translate-y-1/2 w-6 h-24 bg-white dark:bg-[#0f172a] border border-l-0 border-slate-100 dark:border-white/5 rounded-r-xl flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all z-[1002] shadow-md"
        >
          <MousePointer2 size={14} className={isOpen ? 'rotate-180' : ''} />
        </button>

        <div className={`flex flex-col h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-white uppercase flex items-center gap-3"><MapIcon className="text-primary-500" /> HARİTA GEZGİNİ</h2>
                <button 
                  onClick={() => (window as any).api.showAlert({ title: 'YARDIM', message: 'TKGM Parsel Sorgu üzerinden KML/GeoJSON indirip sisteme ekleyebilirsiniz.', type: 'info' })}
                  className="p-2 text-slate-300 hover:text-primary-500 transition-colors"
                  title="Yardım Al"
                >
                  <Info size={20} />
                </button>
              </div>

              <button 
                  onClick={onRefresh}
                  className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                <RefreshCcw size={14} /> VERİLERİ YENİLE
              </button>

            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Ada, Parsel, Malik Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 pl-12 pr-4 py-3 rounded-2xl text-[11px] font-black uppercase outline-none border-2 border-transparent focus:border-primary-500 transition-all" />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
               {['tapu', 'import', 'official'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === t ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-xl' : 'text-slate-400'}`}>
                    {t === 'tapu' ? 'PARSEL' : t === 'import' ? 'KATMAN' : 'RESMİ'}
                  </button>
               ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-6">
            {activeTab === 'tapu' ? filteredTapular.map(t => {
              const pData = parselData.find(p => p.Tasinmaz_id === t.id);
              const hasPosition = !!(pData && pData.Lat);
              const hasLayer = !!(pData && pData.geojson);
              return (
               <div key={t.id} onClick={() => handleSelectTapu(t)} className={`p-4 rounded-2xl transition-all cursor-pointer border-2 group ${selectedTapu?.id === t.id ? 'bg-primary-500 border-primary-400 text-white shadow-xl translate-x-1' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-xl relative ${selectedTapu?.id === t.id ? 'bg-white/20' : 'bg-white dark:bg-slate-800'}`}>
                        {hasLayer ? <FileText size={18} /> : <MapPin size={18} />}
                        {hasPosition && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />}
                        {hasLayer && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-800 rounded-full" />}
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-black uppercase tracking-tighter truncate">{t.Ada} / {t.Parsel}</span>
                        <span className={`text-[9px] font-bold uppercase truncate ${selectedTapu?.id === t.id ? 'text-white/70' : 'text-slate-400'}`}>{t.Mevki || 'BÖLGE BELİRSİZ'}</span>
                     </div>
                      {selectedTapu?.id === t.id && (
                        <div className="flex flex-col gap-1 ml-auto">
                           {!hasPosition && (
                             <button onClick={(e) => { e.stopPropagation(); setSabitlemeTarget(t); setIsSabitlemeMode(true); }} className="px-3 py-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-[9px] font-black uppercase tracking-tighter">Sabitle</button>
                           )}
                           <button onClick={(e) => { e.stopPropagation(); handleLinkGeometry(t); }} className="px-3 py-1.5 bg-white/10 hover:bg-white/30 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center gap-1"><Layers size={10} /> Veri Bağla</button>
                        </div>
                      )}
                   </div>
               </div>
            )}) : activeTab === 'official' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="p-5 bg-primary-500 rounded-[32px] text-white shadow-xl shadow-primary-500/20">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-xl"><Globe size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Resmi Coğrafi Kayıt</span>
                   </div>
                   <h3 className="text-lg font-black italic uppercase leading-none">{il?.Ad || 'MERKEZ İL'} / {ilce?.Ad || 'MERKEZ İLÇE'}</h3>
                   <p className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-tighter">{belde?.Ad || 'KURUM BAŞKANLIĞI'}</p>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">SORUMLULUK ALANI MAHALLELER</h4>
                   {mahalles.map(m => (
                     <div 
                       key={m.id} 
                       onClick={() => onSelectLocation(m)}
                       className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-primary-500/20 transition-all flex items-center justify-between group cursor-pointer active:scale-95"
                     >
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-primary-500 group-hover:scale-110 transition-transform"><MapPin size={16} /></div>
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase dark:text-white">{m.Ad}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{m.Kod || '70450'} / MAHALLE</span>
                           </div>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                     </div>
                   ))}
                </div>
              </div>
            ) : (
                 <div className="space-y-6 p-2 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ÖZEL VERİ KATMANLARI</h3>
                         <button title="Yeni Katman Ekle" onClick={onImportFile} className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-sm"><Globe size={14} /></button>
                      </div>
                      
                      {importedLayers.length === 0 && (
                        <div className="p-12 text-center bg-slate-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center gap-4">
                           <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl"><Layers className="text-slate-300" size={32} /></div>
                           <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed tracking-widest">Henüz özel bir katman (KML/GeoJSON) yüklenmedi</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {importedLayers.map(layer => (
                          <div key={layer.id} className="p-5 rounded-[28px] flex items-center justify-between group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary-500/30 transition-all shadow-sm hover:shadow-xl">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-primary-500/10 rounded-xl text-primary-500"><Layers size={18} /></div>
                                <div className="flex flex-col min-w-0">
                                   <span className="text-[11px] font-black uppercase truncate w-32 dark:text-white">{layer.name}</span>
                                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Dış Veri Kaynağı</span>
                                </div>
                             </div>
                             <button 
                               title="Katmanı Sil"
                               onClick={() => handleDeleteLayer(layer.id)} 
                               className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
            )}
         </div>
      </div>
    </div>
  );
};
