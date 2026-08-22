import React from 'react';
import { motion } from 'framer-motion';
import { X, MoreVertical, List, Navigation, FileDown, Image, Star, Info } from 'lucide-react';

interface AttributePanelProps {
  data: any;
  onClose: () => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ data, onClose }) => {
  if (!data) return null;

  // 🛡️ TKGM veya Yerel Veriden gelen alanları normalize et
  const fields = [
    { label: 'MAHALLE', value: data.Mahalle || data.mahalleAd || '-' },
    { label: 'ADA/PARSEL', value: `${data.Ada || data.ada || '-'}/${data.Parsel || data.parsel || '-'}` },
    { label: 'TAPU ALANI', value: `${data.Alan_m2 || data.alan || '-'} M²` },
    { label: 'NİTELİK', value: data.Nitelik || data.nitelik || '-' },
    { label: 'MEVKİİ', value: data.Mevkii || data.mevki || '-' },
    { label: 'ZEMİN TİPİ', value: data.Zemin_Tipi || 'ANA TAŞINMAZ' },
    { label: 'PAFTA', value: data.Pafta || '-' },
  ];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute top-24 left-1/3 z-[2000] w-[380px] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 pointer-events-auto"
    >
      {/* 🚀 BAŞLIK ÇUBUĞU (Sürükleme Alanı) */}
      <div className="bg-primary-500 p-5 flex items-center justify-between cursor-move">
        <div className="flex items-center gap-3">
          <MoreVertical size={20} className="text-white/60" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">ÖZNİTELİK BİLGİSİ</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-2">
        {/* 🚀 HIZLI AKSİYON MENÜSÜ */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-2 mb-2 border border-slate-100 dark:border-white/5">
          {[
            { label: 'KOORDİNAT LİSTESİ', icon: List },
            { label: 'ROTA OLUŞTUR', icon: Navigation },
            { label: 'İNDİR (PDF/KML/GEOJSON)', icon: FileDown },
            { label: 'ORTOFOT BİLGİSİ', icon: Image },
          ].map((item, idx) => (
            <button 
              key={idx}
              className="w-full flex items-center gap-4 p-3 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 rounded-xl transition-all group text-left"
            >
              <div className="p-2 bg-primary-500/10 rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-all text-primary-500">
                <item.icon size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 🚀 VERİ TABLOSU */}
        <div className="space-y-0.5 px-2 pb-4">
          {fields.map((f, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-3 rounded-xl ${idx % 2 === 0 ? 'bg-slate-50/80 dark:bg-white/5' : ''}`}
            >
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{f.label}</span>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{f.value}</span>
            </div>
          ))}
        </div>

        {/* 🚀 ALT AKSİYON */}
        <div className="p-2 pt-0">
          <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
            <Star size={18} fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-widest">FAVORİLERE EKLE</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
