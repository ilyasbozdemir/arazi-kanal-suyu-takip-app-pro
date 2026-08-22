import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MoreVertical, FileText, Download, Navigation, 
  Map as MapIcon, Layers, FileDown, ExternalLink, Info,
  Bookmark, MapPin
} from 'lucide-react';

interface MapFloatingPanelProps {
  selectedTapu: any;
  onClose: () => void;
  onDownload: (format: string) => void;
}

export const MapFloatingPanel: React.FC<MapFloatingPanelProps> = ({ 
  selectedTapu, onClose, onDownload 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!selectedTapu) return null;

  // 🛡️ TKGM Keşif Verisi mi yoksa DB Verisi mi?
  const metadata = selectedTapu.mapMetadata?.properties || {};
  const isDiscovered = selectedTapu.id?.toString().startsWith('discovered_');
  
  const dataRows = [
    { label: 'İL', value: metadata.ilAd || selectedTapu.Il || 'MERKEZ İL' },
    { label: 'İLÇE', value: metadata.ilceAd || selectedTapu.Ilce || 'MERKEZ İLÇE' },
    { label: 'MAHALLE', value: metadata.mahalleAd || selectedTapu.Mahalle_Koy || '-' },
    { label: 'ADA / PARSEL', value: `${metadata.adaNo || selectedTapu.Ada || '-'} / ${metadata.parselNo || selectedTapu.Parsel || '-'}` },
    { label: 'ALAN', value: `${metadata.alan || selectedTapu.Alan_m2 || '-'} M²` },
    { label: 'NİTELİK', value: metadata.nitelik || selectedTapu.Nitelik || '-' },
    { label: 'MEVKİİ', value: metadata.mevkii || selectedTapu.Mevki || '-' },
    { label: 'PAFTA', value: metadata.pafta || selectedTapu.Pafta || '-' },
    { label: 'DURUM', value: isDiscovered ? 'TKGM KEŞİF (KAYITSIZ)' : 'VERİTABANINDA KAYITLI' },
  ];

  const handleAction = (id: string) => {
    const mahalleId = metadata.mahalleId || selectedTapu.Mahalle_Id;
    const ada = metadata.adaNo || selectedTapu.Ada;
    const parsel = metadata.parselNo || selectedTapu.Parsel;

    if (['pdf', 'kml', 'geojson', 'dxf'].includes(id)) {
      (async () => {
        const res = await (window as any).api.tkgmOpenDownload({ 
          mahalleId, 
          ada, 
          parsel, 
          tapuId: selectedTapu.id, 
          format: id 
        });
        
        if (!res.success) {
          (window as any).api.showAlert({ 
            title: 'HATA', 
            message: res.error || 'İndirme hazırlığı sırasında bir pürüz çıktı.', 
            type: 'error' 
          });
        }
      })();
      return;
    }
    
    if (id === 'route') {
       const [lat, lng] = selectedTapu.Lat ? [selectedTapu.Lat, selectedTapu.Lng] : [0, 0];
       if (lat) {
         (window as any).api.openExternal(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
       }
       return;
    }

    onDownload(id);
  };

  const menuActions = [
    { id: 'pdf', label: 'PDF OLARAK İNDİR', icon: FileDown },
    { id: 'kml', label: 'KML OLARAK DIŞA AKTAR', icon: Download },
    { id: 'geojson', label: 'GEOJSON OLARAK AKTAR', icon: Layers },
    { id: 'dxf', label: 'DXF (CAD) OLARAK AKTAR', icon: FileText },
    { id: 'route', label: 'BURAYA ROTA OLUŞTUR', icon: Navigation },
    { id: 'ortho', label: 'ORTOFOT BİLGİSİ', icon: Info },
  ];

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 1000, top: 0, bottom: 800 }}
      dragMomentum={false}
      initial={{ x: 600, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 600, opacity: 0 }}
      className="absolute right-8 top-24 z-[2000] w-[380px] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 overflow-hidden font-sans"
    >
      {/* HEADER */}
      <div className="bg-slate-900 dark:bg-black p-5 flex items-center justify-between cursor-move">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">PARSEL DETAYI</h3>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Ada: {metadata.adaNo || selectedTapu.Ada} | Parsel: {metadata.parselNo || selectedTapu.Parsel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 rounded-xl text-white/70 transition-all">
              <MoreVertical size={20} />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 z-[2001]">
                  {menuActions.map((action) => (
                    <button 
                      key={action.id} 
                      onClick={() => { handleAction(action.id); setIsMenuOpen(false); }} 
                      title={action.label}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <action.icon size={16} className="text-primary-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500 rounded-xl text-white/70 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">
        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5">
          <table className="w-full text-left border-collapse">
            <tbody>
              {dataRows.map((row, idx) => (
                <tr key={idx} className={`${idx !== dataRows.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}>
                  <td className="py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-1/3">
                    {row.label}
                  </td>
                  <td className="py-3.5 px-5 text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase truncate">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction('pdf')}
            title="PDF OLARAK İNDİR"
            className="flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95"
          >
            <FileDown size={16} />
            PDF İNDİR
          </button>
          
          <button 
            onClick={() => (window as any).api.showAlert({ title: 'KAYDET', message: 'Parsel sistem kaydına hazır.', type: 'info' })}
            title="SİSTEME İŞLE"
            className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Bookmark size={16} />
            SİSTEME İŞLE
          </button>
        </div>

        {isDiscovered && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[9px] font-bold text-amber-600 uppercase leading-relaxed">
              BU VERİ TKGM ÜZERİNDEN CANLI SORGULANMIŞTIR. HENÜZ YEREL VERİTABANINIZDA KAYDI BULUNMAMAKTADIR.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
