import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, Save } from 'lucide-react';
import { ElectronService } from '@renderer/services/ElectronService';

interface ManuelBorcFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  citizen: {
    id: string;
    TCKN: string;
    Ad: string;
    Soyad?: string;
  };
  tasinmazId?: string;
}

export const ManuelBorcFormModal: React.FC<ManuelBorcFormModalProps> = ({ isOpen, onClose, onSuccess, citizen, tasinmazId }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('MANUEL BORÇ (ESKİ DÖNEM)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [donem, setDonem] = useState(new Date().getFullYear().toString());
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      ElectronService.showAlert({ message: 'Lütfen geçerli bir tutar giriniz.', type: 'warning' });
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        id: window.crypto.randomUUID(),
        Fis_id: window.crypto.randomUUID(), // SQL NOT NULL Constraint Fix
        Vatandas_Id: citizen?.id || null,
        Tasinmaz_id: tasinmazId || null,
        Miktar: numAmount,
        Tarih: date,
        Donem_Yili: donem,
        Durum: 'Bekliyor',
        Aciklama: description
      };
      
      const res = await ElectronService.saveRecord('MUHASEBE_Tahakkuk', payload);
      if (res.success) {
        setAmount('');
        setDescription('MANUEL BORÇ (ESKİ DÖNEM)');
        setDate(new Date().toISOString().split('T')[0]);
        setDonem(new Date().getFullYear().toString());
        onSuccess();
        onClose();
        ElectronService.showAlert({ message: 'Manuel borç/tahakkuk başarıyla oluşturuldu.', type: 'success' });
      } else {
        ElectronService.showAlert({ message: 'Hata: ' + res.error, type: 'error' });
      }
    } catch (err: any) {
      ElectronService.showAlert({ message: 'Sistemsel Hata: ' + err.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 pb-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">MANUEL BORÇ EKLE</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {citizen?.id ? `${citizen.Ad} ${citizen.Soyad} (${citizen.TCKN || 'TCKN YOK'})` : (tasinmazId ? 'TAŞINMAZ BORCU' : 'BİLİNMEYEN')}
                    </p>
                  </div>
               </div>
               <button onClick={onClose} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
                 <X size={20} />
               </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BORÇ TUTARI (₺)</label>
                 <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-xl font-black tabular-nums border-none outline-none focus:ring-4 ring-indigo-500/10"
                    placeholder="0,00"
                 />
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TARİH</label>
                   <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-black tabular-nums border-none outline-none focus:ring-4 ring-indigo-500/10"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DÖNEM YILI</label>
                   <input 
                      type="number"
                      value={donem}
                      onChange={e => setDonem(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-black tabular-nums border-none outline-none focus:ring-4 ring-indigo-500/10"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AÇIKLAMA</label>
                 <textarea 
                   rows={3}
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 resize-none"
                 />
               </div>

               <button 
                 disabled={isProcessing}
                 onClick={handleSave}
                 className="w-full py-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
               >
                 {isProcessing ? (
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                     <Save size={20} className="group-hover:scale-125 transition-transform" />
                     BORCU TAHAKKUK ETTİR
                   </>
                 )}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
