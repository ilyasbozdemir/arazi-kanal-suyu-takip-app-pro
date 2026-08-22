import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

interface DistributionCardViewProps {
  data: any[];
  onEdit: (row: any) => void;
  onDetail: (row: any) => void;
  formatDate: (date: string) => string;
}

export const DistributionCardView: React.FC<DistributionCardViewProps> = ({
  data,
  onEdit,
  onDetail,
  formatDate
}) => {
  if (data.length === 0) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[40px] text-slate-400 space-y-4">
        <BookOpen size={48} className="opacity-10" />
        <p className="text-xs font-black uppercase tracking-widest italic opacity-40">Gösterilecek kayıt bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
      {data.map((row, idx) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          key={row.id}
          className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all group cursor-pointer ${row.deleted_at ? 'opacity-50 grayscale' : ''}`}
          onClick={() => onDetail(row)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center shrink-0">
                <User size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate">{row.Ad_Soyad || 'Bilinmeyen'}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.Ada_Parsel}</p>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${row.Odeme_Durumu === 'Ödendi' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
              {row.Odeme_Durumu === 'Ödendi' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">KULLANIM</p>
              <p className="text-xs font-black text-slate-800 dark:text-white">{row.Sure_Saat || 0} SAAT</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TARİFE</p>
              <p className={`text-xs font-black uppercase tracking-tighter ${row.Tarife_Modu === 'NIGHT' ? 'text-indigo-500' : 'text-blue-500'}`}>
                {row.Tarife_Modu === 'NIGHT' ? 'GECE' : 'GÜNDÜZ'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
              <MapPin size={12} />
              {row.Tarih ? formatDate(row.Tarih) : 'Tarih Yok'}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(row); }}
              className="text-[9px] font-black text-primary-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:underline"
            >
              DÜZENLE
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
