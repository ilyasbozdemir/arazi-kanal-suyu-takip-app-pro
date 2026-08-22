import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';

interface QuickCitizenAddModalProps {
  isOpen: boolean;
  onClose: (name?: string) => void;
  initialData?: { tckn?: string };
}

export const QuickCitizenAddModal: React.FC<QuickCitizenAddModalProps> = ({ isOpen, onClose, initialData }) => {
  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.split(' ').map(word => {
      if (!word) return '';
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    }).join(' ');
  };

  const [formData, setFormData] = useState({
    Ad: '',
    Soyad: '',
    TCKN: initialData?.tckn || '',
    Sicil_No: '',
    Durum: 'SAĞ' // Varsayılan olarak sağ
  });

  const handleInputChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'Ad' || field === 'Soyad') {
      finalValue = toTitleCase(value);
    }
    if (field === 'TCKN') {
      finalValue = value.replace(/\D/g, '').substring(0, 11);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.Ad || !formData.Soyad || !formData.TCKN) {
      alert("Lütfen isim, soyisim ve TCKN alanlarını doldurun.");
      return;
    }

    setLoading(true);
    const res = await (window as any).api.insertDbRow('DATA_Vatandas', formData);
    setLoading(false);

    if (res.success) {
      onClose(`${formData.Ad} ${formData.Soyad}`);
    } else {
      alert("Kayıt sırasında hata oluştu: " + res.error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
          onClick={() => onClose()} 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20"><UserPlus size={20} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">HIZLI Kişi EKLE</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yeni Kimlik Tanımla</p>
              </div>
            </div>
            <button onClick={() => onClose()} title="Kapat" className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex gap-3 text-rose-500">
                 <AlertCircle size={20} className="shrink-0" />
                 <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase leading-tight tracking-wider">DİKKAT: E-KURUM KAYDI ŞARTTIR!</p>
                   <p className="text-[9px] font-bold uppercase leading-relaxed opacity-80">Lütfen önce Mali Hizmetler veya Tahsilat biriminden Kişiın kaydını e-kurum sisteminde tamamladığından emin olun. Girişi buradan TCKN ile yapsanız dahi e-kurum kaydı olmayan kişilere su hakkı tanımlanamaz.</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">T.C. KİMLİK NO <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.TCKN} 
                  onChange={e => handleInputChange('TCKN', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all"
                  placeholder="11 Haneli TCKN"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AD <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.Ad} 
                    onChange={e => handleInputChange('Ad', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all"
                    placeholder="Adı"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SOYAD <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.Soyad} 
                    onChange={e => handleInputChange('Soyad', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all"
                    placeholder="Soyadı"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SİCİL NUMARASI</label>
                <input 
                  type="text" 
                  value={formData.Sicil_No} 
                  onChange={e => handleInputChange('Sicil_No', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-sm outline-none focus:border-primary-500 transition-all"
                  placeholder="Opsiyonel"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-3xl transition-all shadow-xl shadow-primary-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95"
            >
              <ShieldCheck size={18} /> {loading ? 'KAYDEDİLİYOR...' : 'KAYDI TAMAMLA & SEÇ'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default QuickCitizenAddModal;

