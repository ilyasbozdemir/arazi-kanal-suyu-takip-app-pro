import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  title?: string;
  message?: string;
  isProcessing?: boolean;
  alertMode?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title = "KAYIT SİLME İŞLEMİ", 
  message = "Bu işlem geri alınamaz. Seçili kayıt ve bağlı tüm veriler sistemden kalıcı olarak silinecektir.",
  isProcessing,
  alertMode = false
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const pattern = "SİL"; // Onay deseni

  // Modal her açıldığında inputu sıfırla
  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setAuditNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmText === pattern;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/90"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5"
        >
           {/* Warning Header */}
           <div className={`p-8 flex flex-col items-center text-center gap-4 ${alertMode ? 'bg-blue-500/10' : 'bg-rose-500/10'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white ${alertMode ? 'bg-blue-500' : 'bg-rose-500'}`}>
                 <AlertTriangle size={32} />
              </div>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h3>
                 <p className={`text-[10px] font-bold uppercase tracking-widest italic ${alertMode ? 'text-blue-500' : 'text-rose-500'}`}>
                    {alertMode ? 'Veri Bütünlüğü Kısıtlaması' : 'Kritik Veri Güvenliği Uyarısı'}
                 </p>
              </div>
           </div>

            {/* Body */}
            <div className="p-8 space-y-6">
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed text-center px-4">
                  {message}
               </p>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} className="text-primary-500" /> İŞLEM NEDENİ (ZORUNLU)
                     </label>
                     <textarea 
                        required
                        value={auditNote}
                        onChange={(e) => setAuditNote(e.target.value)}
                        placeholder="Resmi mevzuat gereği bu işlemin nedenini açıklayınız..."
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-primary-500 transition-all min-h-[100px] resize-none"
                     />
                  </div>

                  {!alertMode && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">
                          İŞLEMİ ONAYLAMAK İÇİN AŞAĞIYA <span className="text-rose-500">"{pattern}"</span> YAZIN
                       </label>
                       <input 
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value.toLocaleUpperCase('tr-TR'))}
                          placeholder="Onay kelimesini girin..."
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-center text-xl font-black text-slate-800 dark:text-white outline-none focus:border-rose-500 transition-all uppercase"
                       />
                    </div>
                  )}
               </div>

               <div className="flex flex-col gap-3">
                  {!alertMode && (
                     <button 
                        disabled={!isConfirmed || !auditNote.trim() || isProcessing}
                        onClick={() => onConfirm(auditNote)}
                        className={`w-full py-5 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs ${
                           isConfirmed && auditNote.trim() && !isProcessing
                           ? 'bg-rose-500 text-white shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98]' 
                           : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 grayscale cursor-not-allowed'
                        }`}
                     >
                        {isProcessing ? (
                           <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                           <>KAYDI KALICI OLARAK SİL <Trash2 size={16} /></>
                        )}
                     </button>
                  )}

                  <button 
                     disabled={isProcessing}
                     onClick={onClose}
                     className="w-full py-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-[10px] uppercase tracking-widest transition-colors"
                  >
                     {alertMode ? 'TAMAM, ANLADIM' : 'İŞLEMİ İPTAL ET'}
                  </button>
               </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

