import React from 'react';
import { Droplets, Clock, X } from 'lucide-react';

interface SimplifiedDistributionDetailModalProps {
  record: any;
  onClose: () => void;
  onEdit: (record: any) => void;
  formatDate: (date: string) => string;
}

export const SimplifiedDistributionDetailModal: React.FC<SimplifiedDistributionDetailModalProps> = ({ 
  record, 
  onClose, 
  onEdit, 
  formatDate
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-slate-950/60 backdrop-blur-xl transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20 relative">
         
         {/* Üst Kapatma Butonu */}
         <button 
            onClick={onClose}
            className="absolute right-8 top-8 w-12 h-12 bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl flex items-center justify-center transition-all z-20 group"
            title="Kapat"
         >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
         </button>

         {/* Antetli Başlık Kısmı */}
         <div className="p-6 md:p-12 border-b-4 border-double border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex gap-6 md:gap-8 items-center">
               <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-900 dark:bg-white rounded-[24px] md:rounded-[32px] flex items-center justify-center text-white dark:text-slate-900 shadow-2xl shrink-0">
                  <Droplets size={32} className="md:w-12 md:h-12" />
               </div>
               <div>
                  <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">GÜNEYURT KURUMSİ</h3>
                  <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">SULAMA DAĞITIM TAKİP EVRAKI</p>
               </div>
            </div>
            <div className="text-left md:text-right pr-0 md:pr-16">
               <div className="px-6 py-2 bg-indigo-600 text-white rounded-full text-[9px] md:text-[10px] font-black tracking-widest mb-4 inline-block shadow-lg shadow-indigo-500/20">SAHA OPERASYON VERİSİ</div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-tighter">FİŞ NO: <span className="text-slate-900 dark:text-white font-mono">{record.Makbuz_No || '---'}</span></p>
            </div>
         </div>

         {/* Gövde */}
         <div className="flex-1 p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="space-y-10">
               <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">MÜKELLEF BİLGİLERİ</label>
                  <div className="p-8 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-[32px] backdrop-blur-md shadow-sm">
                     <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-2 tracking-tighter">{record.Ad_Soyad}</h4>
                     <p className="text-xs font-bold text-slate-500 font-mono tracking-wider">TC: {record.TCKN}</p>
                  </div>
               </section>

               <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">TAŞINMAZ BİLGİSİ</label>
                  <div className="p-8 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-[32px] backdrop-blur-md shadow-sm">
                     <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2 tracking-tighter">{record.Ada_Parsel}</h4>
                     <p className="text-xs font-bold text-emerald-600 italic uppercase tracking-wider">{record.Mevki || 'GENEL MEVKİ'}</p>
                  </div>
               </section>
            </div>

            <div className="space-y-10">
               <div className="bg-slate-900 dark:bg-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                  <label className="text-[10px] font-black text-white/50 dark:text-slate-400 uppercase tracking-widest block mb-4">SULAMA DETAYLARI</label>
                  <p className="text-5xl font-black italic text-white dark:text-slate-900 tracking-tighter tabular-nums">{record.Sure_Saat} SAAT</p>
                  <div className="mt-8 pt-8 border-t border-white/10 dark:border-slate-100 flex justify-between items-center text-white/60 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                     <span>TARİH: {formatDate(record.Tarih)}</span>
                     <span className="px-3 py-1 bg-white/10 dark:bg-black/5 rounded-full border border-white/10 dark:border-slate-200">TARİFE: {record.Tarife_Modu || 'STANDART'}</span>
                  </div>
               </div>

               <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">ÖDEME DURUMU (SAHA)</label>
                  <div className={`flex items-center justify-center p-8 border-2 border-dashed rounded-[32px] ${record.Odeme_Durumu === 'Ödendi' ? 'bg-emerald-50/30 border-emerald-200 text-emerald-700' : 'bg-rose-50/30 border-rose-200 text-rose-700'}`}>
                     <span className="text-2xl font-black uppercase tracking-widest italic">{record.Odeme_Durumu || 'BEKLEMEDE'}</span>
                  </div>
               </section>
            </div>
         </div>

         {/* Alt Aksiyonlar */}
         <div className="p-10 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-6">
            <button 
              onClick={() => onEdit(record)}
              className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              Kayıtta Değişiklik Yap
            </button>
            <button 
               onClick={() => window.print()}
               className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
               EVRAKI YAZDIR
            </button>
         </div>
      </div>
    </div>
  );
};
