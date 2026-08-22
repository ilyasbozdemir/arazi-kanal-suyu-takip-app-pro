import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronRight } from 'lucide-react';

interface MeravDevirModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMeravlar: any[];
  selectedSourceMerav: string;
  setSelectedSourceMerav: (id: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const MeravDevirModal: React.FC<MeravDevirModalProps> = ({
  isOpen,
  onClose,
  allMeravlar,
  selectedSourceMerav,
  setSelectedSourceMerav,
  onConfirm,
  isProcessing
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-slate-950/40"
        >
           <div className="absolute inset-0" onClick={onClose} />
           <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[56px] p-12 space-y-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white dark:border-white/5"
           >
              <div className="flex items-center gap-6 border-b border-slate-50 dark:border-white/5 pb-8">
                 <div className="p-4 bg-emerald-500 text-white rounded-[24px] shadow-lg shadow-emerald-500/20">
                    <ShieldAlert size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Saha Görev Protokolü</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">TAHSİLAT YETKİ VE SORUMLULUK DEVRİ</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">YETKİSİ DEVRALINACAK PERSONEL</label>
                 <div className="relative group">
                    <select 
                      title="Merav Seç" 
                      value={selectedSourceMerav} 
                      onChange={(e) => setSelectedSourceMerav(e.target.value)} 
                      className="w-full h-20 pl-8 pr-12 bg-slate-50 dark:bg-white/5 rounded-[28px] text-base font-black uppercase outline-none border-2 border-transparent focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                       <option value="">SEÇİNİZ...</option>
                       {allMeravlar.map((p) => <option key={p.id} value={p.id}>{p.Ad_Soyad}</option>)}
                    </select>
                    <ChevronRight size={24} className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <p className="text-[9px] font-bold text-rose-500 uppercase px-4 flex items-center gap-2">
                    <ShieldAlert size={12} /> DİKKAT: Bu işlem geri alınamaz ve tüm mali sorumluluk devredilir.
                 </p>
              </div>

              <div className="flex gap-6 pt-6">
                 <button 
                   onClick={onClose} 
                   className="flex-1 h-18 bg-slate-100 dark:bg-white/5 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    İPTAL ET
                 </button>
                 <button 
                   disabled={!selectedSourceMerav || isProcessing} 
                   onClick={onConfirm} 
                   className="flex-1 h-18 bg-emerald-500 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all"
                 >
                    {isProcessing ? 'İŞLENİYOR...' : 'DEVRİ ONAYLA'}
                 </button>
              </div>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
