import React, { useState } from 'react';
import { Menu, TrendingUp, Layers, MousePointer2, MapPin, RefreshCcw, Bookmark, Trash2, Ruler, Settings2, FileText, Globe, Droplets, Map as MapIcon, Square, Flag } from 'lucide-react';

interface MapOverlaysProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  isQueryMode: boolean;
  setIsQueryMode: (val: boolean) => void;
  isSabitlemeMode: boolean;
  setIsSabitlemeMode: (val: boolean) => void;
  isMeasuring: boolean;
  setIsMeasuring: (val: boolean) => void;
  sabitlemeTarget: any;
  setSabitlemeTarget: (val: any) => void;
  tapular: any[];
  exploredParsels: any[];
  setExploredParsels: (val: any[]) => void;
  onRefresh: () => void;
  onGoHome: () => void;
  hoverCoords: [number, number];
  reqLimitCount: number;
  isLoading: boolean;
  mapSettings: any;
  onUpdateSetting: (key: string, value: any) => void;
  importedLayers: any[];
  onImportFile: () => void;
}

export const MapOverlays: React.FC<MapOverlaysProps> = ({
  isSidebarOpen, setIsSidebarOpen, isQueryMode, setIsQueryMode,
  isSabitlemeMode, setIsSabitlemeMode, isMeasuring, setIsMeasuring,
  sabitlemeTarget, setSabitlemeTarget,
  tapular, exploredParsels, setExploredParsels, onRefresh, onGoHome,
  hoverCoords, reqLimitCount, isLoading, mapSettings, onUpdateSetting,
  importedLayers, onImportFile
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const togglePanel = (p: string) => setActivePanel(activePanel === p ? null : p);

  return (
    <>
      {/* 🚀 SOL ÜST: ÖZET PANELİ */}
      <div className="absolute top-8 left-8 z-[1000] pointer-events-none flex flex-col gap-4">
         <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                title="Menüyü Aç"
                className="pointer-events-auto p-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl text-primary-500 hover:scale-105 transition-all"
              >
                 <Menu size={24} />
              </button>
            )}
            
            <button 
              onClick={() => setShowStats(!showStats)}
              title="İstatistikleri Göster"
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl transition-all ${showStats ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/90 dark:bg-slate-900/80 text-emerald-500 border-white/20'}`}
            >
               <TrendingUp size={24} />
            </button>
         </div>
         
         {showStats && (
            <div className="flex items-center gap-6 px-8 py-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[32px] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
               <div className="flex items-center gap-4 pr-6 border-r border-slate-200 dark:border-white/10">
                  <div className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp className="text-emerald-500" size={20} /></div>
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOPLAM ALAN</span>
                     <span className="text-sm font-black text-slate-800 dark:text-white tracking-tighter">{tapular.reduce((sum, t) => sum + (Number(t.Alan_m2) || 0), 0).toLocaleString('tr-TR')} m²</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-500/10 rounded-xl"><Layers className="text-primary-500" size={20} /></div>
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PARSEL SAYISI</span>
                     <span className="text-sm font-black text-slate-800 dark:text-white tracking-tighter">{tapular.length} ADET</span>
                  </div>
               </div>
            </div>
         )}
         
         {(isQueryMode || isSabitlemeMode || isMeasuring) && (
           <div className={`px-6 py-3 ${isQueryMode ? 'bg-primary-500' : (isMeasuring ? 'bg-amber-500' : 'bg-emerald-500')} text-white rounded-2xl shadow-2xl animate-pulse flex items-center gap-3 border border-white/20 pointer-events-auto transition-all`}>
              {isQueryMode ? <MousePointer2 size={18} /> : (isMeasuring ? <Ruler size={18} /> : <MapPin size={18} />)}
              <span className="text-[10px] font-black uppercase tracking-widest">
                 {isQueryMode ? 'Sorgu Modu' : (isMeasuring ? 'Mesafe Ölçümü' : `Sabitleme: ${sabitlemeTarget?.Ada}/${sabitlemeTarget?.Parsel}`)}
              </span>
              <button onClick={() => { setIsQueryMode(false); setIsSabitlemeMode(false); setIsMeasuring(false); setSabitlemeTarget(null); }} className="ml-4 px-3 py-1 bg-white/20 rounded-lg text-[9px] font-bold hover:bg-white/30 transition-all">İPTAL</button>
           </div>
         )}
      </div>

      {/* 🚀 SAĞ TARAF: MODÜLER KONTROL KULESİ */}
      <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-3 items-end">
         
         {/* 1. GÖRÜNÜM PANELİ (HARİTA GALERİSİ) */}
         <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => togglePanel('view')}
              title="Görünüm Ayarları"
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-2xl transition-all border pointer-events-auto ${activePanel === 'view' ? 'bg-primary-500 text-white border-primary-400 scale-105' : 'bg-white/90 dark:bg-slate-900/80 text-slate-600 dark:text-white border-white/20'}`}
            >
               <Settings2 size={24} />
            </button>
            {activePanel === 'view' && (
               <div className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-6 rounded-[32px] border border-white/20 shadow-2xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
                  
                  <div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">HARİTA SAĞLAYICI</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'google_satellite', label: 'GOOGLE UYDU', provider: 'Google' },
                        { id: 'google_hybrid', label: 'GOOGLE HİBRİT', provider: 'Google' },
                        { id: 'yandex_satellite', label: 'YANDEX UYDU', provider: 'Yandex' },
                        { id: 'esri_world', label: 'ESRI DÜNYA', provider: 'Esri' },
                        { id: 'google_streets', label: 'GOOGLE SOKAK', provider: 'Google' },
                        { id: 'none', label: 'KURUM (YALIN)', provider: 'Local' },
                      ].map(m => (
                        <button 
                          key={m.id} 
                          onClick={() => onUpdateSetting('map_base_type', m.id)} 
                          className={`flex flex-col items-start p-3 rounded-2xl transition-all border-2 text-left ${mapSettings.baseMap === m.id ? 'bg-primary-500 border-primary-400 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:bg-slate-100'}`}
                        >
                          <span className="text-[7px] font-black opacity-60 uppercase mb-0.5">{m.provider}</span>
                          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">GÖSTERİM AYARLARI</h4>
                    {[
                      { key: 'map_show_labels', label: 'İsimleri Göster', icon: FileText, value: !!mapSettings.showLabels },
                      { key: 'map_clip_outside_boundary', label: 'Resmi Sınır Maskesi', icon: Globe, value: !!mapSettings.clipOutside },
                      { key: 'map_show_pointers', label: 'Tapu Pointerları', icon: MapPin, value: !!mapSettings.showPointers }
                    ].map(s => (
                      <button 
                        key={s.key}
                        onClick={() => onUpdateSetting(s.key, !s.value)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${s.value ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
                      >
                         <div className="flex items-center gap-3">
                            <s.icon size={15} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{s.label}</span>
                         </div>
                         <div className={`w-1.5 h-1.5 rounded-full ${s.value ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`} />
                      </button>
                    ))}
                  </div>
               </div>
            )}
         </div>

         {/* 2. RESMİ SINIRLAR PANELİ */}
         <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => togglePanel('layers')}
              title="Resmi Sınırlar"
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-2xl transition-all border pointer-events-auto ${activePanel === 'layers' ? 'bg-emerald-500 text-white border-emerald-400 scale-105' : 'bg-white/90 dark:bg-slate-900/80 text-slate-600 dark:text-white border-white/20'}`}
            >
               <MapIcon size={24} />
            </button>
            {activePanel === 'layers' && (
               <div className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-4 rounded-[28px] border border-white/20 shadow-2xl space-y-1 animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">RESMİ SINIRLAR</h4>
                  {['MAHALLE', 'BELDE', 'İLÇE', 'İL'].map(type => {
                     const isActive = (mapSettings.layerVisibility || {})[type] !== false;
                     return (
                        <button 
                          key={type}
                          onClick={() => onUpdateSetting('layerVisibility', { ...mapSettings.layerVisibility, [type]: !isActive })}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${type === 'İL' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                              <span className="text-[10px] font-black uppercase tracking-tight">{type} SINIRI</span>
                           </div>
                           <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500' : 'border-2 border-slate-200'}`}>
                              {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                           </div>
                        </button>
                     );
                  })}
               </div>
            )}
         </div>

         {/* 3. DİNAMİK KATMANLAR PANELİ */}
         <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => togglePanel('dynamic_layers')}
              title="Katman Yönetimi"
              className={`p-4 rounded-2xl shadow-2xl backdrop-blur-2xl transition-all border pointer-events-auto ${activePanel === 'dynamic_layers' ? 'bg-indigo-500 text-white border-indigo-400 scale-105' : 'bg-white/90 dark:bg-slate-900/80 text-slate-600 dark:text-white border-white/20'}`}
            >
               <Layers size={24} />
            </button>
            {activePanel === 'dynamic_layers' && (
               <div className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-4 rounded-[28px] border border-white/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ÖZEL KATMANLAR</h4>
                     <button onClick={() => onImportFile()} className="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all shadow-lg"><Layers size={12} /></button>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {importedLayers.length === 0 && (
                      <div className="p-4 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                        <button 
                          onClick={() => onImportFile()}
                          className="flex flex-col items-center gap-2 w-full group"
                        >
                          <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                            <Layers size={14} className="text-slate-400 group-hover:text-primary-500" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ÖZEL KATMAN EKLE</span>
                        </button>
                      </div>
                    )}

                    {importedLayers.map(layer => {
                      // 🛡️ AKILLI İKON EŞLEŞTİRME (DB'den gelen veya İsme göre)
                      const IconMap: any = { 
                        'Droplets': Droplets, 'MapPin': MapPin, 'FileText': FileText, 'Globe': Globe, 'Layers': Layers,
                        'Zap': MapPin, 'Settings2': Settings2, 'Activity': RefreshCcw
                      };
                      
                      const getIcon = (layerData: any) => {
                        if (layerData.icon && IconMap[layerData.icon]) return IconMap[layerData.icon];
                        const n = layerData.name.toLowerCase();
                        if (n.includes('su') || n.includes('altyapi')) return Droplets;
                        if (n.includes('elektrik') || n.includes('enerji')) return MapPin;
                        return FileText;
                      };
                      
                      const Icon = getIcon(layer);

                      return (
                        <button 
                          key={layer.id}
                          onClick={() => onUpdateSetting('importedVisibility', { ...mapSettings.importedVisibility, [layer.id]: !mapSettings.importedVisibility?.[layer.id] })}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${mapSettings.importedVisibility?.[layer.id] ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400'}`}
                        >
                           <div className="flex items-center gap-3">
                              <Icon size={15} />
                              <span className="text-[10px] font-black uppercase tracking-tight truncate w-32 text-left">{layer.name}</span>
                           </div>
                           <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center transition-all ${mapSettings.importedVisibility?.[layer.id] ? 'bg-indigo-500 shadow-lg' : 'border-2 border-slate-200'}`}>
                              {mapSettings.importedVisibility?.[layer.id] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                           </div>
                        </button>
                      );
                    })}
                  </div>
               </div>
            )}
         </div>

         {/* 4. LEJAND PANELİ */}
         <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-5 rounded-[32px] border border-white/20 shadow-2xl min-w-[200px] pointer-events-auto mt-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">ARAZİ NİZAMI</h4>
               <span className="text-[10px] font-black text-primary-500">{reqLimitCount}/10</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
               {[{ label: 'ARSA', color: 'bg-[#f59e0b]' }, { label: 'TARLA', color: 'bg-[#10b981]' }, { label: 'TİCARİ', color: 'bg-[#8b5cf6]' }, { label: 'DİĞER', color: 'bg-[#64748b]' }].map(l => (
                  <div key={l.label} className="flex items-center gap-3">
                     <div className={`w-2.5 h-2.5 rounded-full ${l.color} shadow-sm`} />
                     <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">{l.label}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 🚀 ALT ARAÇ ÇUBUĞU */}
      <div className="absolute bottom-8 left-8 right-8 z-[1000] pointer-events-none flex items-end justify-between">
          <div className="px-6 py-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[28px] text-[10px] font-black font-mono text-white/70 tracking-[0.2em] shadow-2xl flex items-center gap-3">
             <MapPin size={14} className="text-primary-500" />
             {hoverCoords[0].toFixed(7)}° N | {hoverCoords[1].toFixed(7)}° E
          </div>
          
          <div className="flex gap-3 pointer-events-auto items-center">
             <button 
               onClick={() => setIsMeasuring(!isMeasuring)} 
               className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all border ${isMeasuring ? 'bg-amber-500 text-white border-amber-400 scale-110' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-white border-white/10'}`}
               title="Mesafe Ölç"
             >
                <Ruler size={22} />
             </button>
             
             <div className="w-px h-8 bg-slate-300 dark:bg-white/10 mx-1" />

             <button 
               onClick={() => setIsQueryMode(!isQueryMode)} 
               className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all border ${isQueryMode ? 'bg-primary-500 text-white border-primary-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-white border-white/10'}`}
               title="Sorgu Modu"
             >
                <MousePointer2 size={22} />
             </button>
             
             <button onClick={onRefresh} className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Yenile">
                <RefreshCcw size={22} className={isLoading ? 'animate-spin text-primary-500' : ''}/>
             </button>
             
             {exploredParsels.length > 0 && (
               <button onClick={() => setExploredParsels([])} className="w-14 h-14 bg-rose-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-rose-600 transition-all" title="Keşifleri Temizle">
                  <Trash2 size={22} />
               </button>
             )}
             
             <button onClick={onGoHome} className="w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-105" title="Ana Konuma Git">
                <Bookmark size={22} />
             </button>
          </div>
      </div>
    </>
  );
};
