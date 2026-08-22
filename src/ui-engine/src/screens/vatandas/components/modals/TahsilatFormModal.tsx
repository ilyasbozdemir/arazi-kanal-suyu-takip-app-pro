import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wallet, CreditCard, Building2, Landmark, History, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { ElectronService } from '../../../../services/ElectronService';

interface TahsilatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  citizen: { id: string; TCKN: string; Ad: string; Soyad: string };
  totalDebt?: number;
  tahakkukId?: string;
  initialAmount?: number;
}

export const TahsilatFormModal: React.FC<TahsilatFormModalProps> = ({ isOpen, onClose, onSuccess, citizen, totalDebt = 0, tahakkukId, initialAmount }) => {
  const [kasalar, setKasalar] = useState<any[]>([]);
  const [selectedKasa, setSelectedKasa] = useState<string>('');
  const [kasaBalance, setKasaBalance] = useState<{ in: number; out: number; total: number } | null>(null);
  const [amount, setAmount] = useState<string>(totalDebt.toString());
  const [method, setMethod] = useState<'NAKİT' | 'KREDİ KARTI'>('NAKİT');
  const [makbuzNo, setMakbuzNo] = useState<string>('');
  const [onayKodu, setOnayKodu] = useState<string>('');
  const [description, setDescription] = useState<string>('SULAMA BEDELİ TAHSİLAT');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      ElectronService.getRecords('TANIM_Kasalar', { Durum: 'AKTİF' }).then((res: any) => {
        if (res.success) setKasalar(res.data);
      });
      const startAmount = initialAmount !== undefined ? initialAmount : (totalDebt > 0 ? totalDebt : 0);
      setAmount(startAmount.toString());
      setMakbuzNo('');
      setOnayKodu('');
    }
  }, [isOpen, totalDebt, initialAmount]);

  useEffect(() => {
    if (selectedKasa) {
      ElectronService.executeRaw(`
        SELECT 
          SUM(CASE WHEN Miktar > 0 THEN Miktar ELSE 0 END) as total_in,
          SUM(CASE WHEN Miktar < 0 THEN ABS(Miktar) ELSE 0 END) as total_out
        FROM MUHASEBE_Kasa_Hareketleri 
        WHERE Kasa_id = ?
      `, [selectedKasa]).then((res: any) => {
        if (res.success && res.data?.length > 0) {
          const row = res.data[0];
          setKasaBalance({
            in: row.total_in || 0,
            out: row.total_out || 0,
            total: (row.total_in || 0) - (row.total_out || 0)
          });
        } else {
          setKasaBalance({ in: 0, out: 0, total: 0 });
        }
      });
    } else {
      setKasaBalance(null);
    }
  }, [selectedKasa]);

  const handleSave = async () => {
    if (!selectedKasa || !amount || Number(amount) <= 0) {
      ElectronService.showAlert({ message: 'Lütfen kasa ve geçerli bir miktar giriniz.', type: 'error' });
      return;
    }

    if (method === 'KREDİ KARTI' && !onayKodu.trim()) {
      ElectronService.showAlert({ message: 'Kredi kartı tahsilatları için Onay Kodu girilmesi zorunludur!', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await ElectronService.accounting.saveCollection({
        Vatandas_Id: citizen.id,
        Miktar: Number(amount),
        Tarih: new Date().toISOString(),
        Kasa_id: selectedKasa,
        Odeme_Yontemi: method,
        Makbuz_No: makbuzNo,
        Onay_Kodu: onayKodu,
        Tahakkuk_id: tahakkukId,
        Aciklama: description || `${citizen.Ad} ${citizen.Soyad} Sulama Tahsilatı`
      }) as any;

      if (res.success) {
        ElectronService.showAlert({ message: 'Tahsilat başarıyla mühürlendi.', type: 'success' });
        onSuccess();
        onClose();
      } else {
        ElectronService.showAlert({ message: 'Tahsilat sırasında bir hata oluştu: ' + res.error, type: 'error' });
      }
    } catch (e: any) {
      ElectronService.showAlert({ message: 'Sistem hatası: ' + e.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const isOverpaying = Number(amount) > totalDebt && totalDebt > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* HEADER */}
          <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Wallet size={28} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none">TAHSİLAT TESCİLİ</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{citizen.Ad} {citizen.Soyad} / {citizen.TCKN}</span>
              </div>
            </div>
            <button title="Kapat" onClick={onClose} className="p-4 hover:bg-rose-500 hover:text-white rounded-full transition-all text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* KASA SEÇİMİ VE BAKİYE ANALİZİ */}
            <div className="space-y-4">
               <div className="space-y-2">
                 <label htmlFor="kasa-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TAHSİLAT YAPILACAK KASA</label>
                 <div className="relative">
                   <Landmark className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" size={18} />
                   <select 
                     id="kasa-select"
                     title="Kasa Seçimi"
                     value={selectedKasa}
                     onChange={e => setSelectedKasa(e.target.value)}
                     className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm font-black uppercase border-none outline-none focus:ring-4 ring-primary-500/10 transition-all appearance-none"
                   >
                     <option value="">LÜTFEN KASA SEÇİNİZ...</option>
                     {kasalar.map(k => (
                       <option key={k.id} value={k.id}>{k.Kasa_Adi} ({k.Kod || 'KODSUZ'})</option>
                     ))}
                   </select>
                 </div>
               </div>

               {/* 📊 SARSILMAZ BAKİYE KARTI */}
               {kasaBalance && (
                 <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-500">
                   <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOPLAM GİRİŞ</span>
                      </div>
                      <p className="text-xs font-black text-emerald-600">{kasaBalance.in.toLocaleString('tr-TR')} ₺</p>
                   </div>
                   <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown size={12} className="text-rose-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOPLAM ÇIKIŞ</span>
                      </div>
                      <p className="text-xs font-black text-rose-600">{kasaBalance.out.toLocaleString('tr-TR')} ₺</p>
                   </div>
                   <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl ring-2 ring-primary-500/10">
                      <div className="flex items-center gap-2 mb-1">
                        <History size={12} className="text-primary-500" />
                        <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">NET BAKİYE</span>
                      </div>
                      <p className="text-sm font-black text-primary-600 italic">{kasaBalance.total.toLocaleString('tr-TR')} ₺</p>
                   </div>
                 </div>
               )}
            </div>

            {/* TUTAR VE YÖNTEM */}
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label htmlFor="amount-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÖDENECEK TUTAR (₺)</label>
                 <input 
                    id="amount-input"
                    title="Ödeme Tutarı"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-xl font-black tabular-nums border-none outline-none focus:ring-4 ring-emerald-500/10"
                    placeholder="0,00"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ÖDEME YÖNTEMİ</label>
                 <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-[24px] h-[64px]">
                    <button 
                      title="Nakit Ödeme"
                      onClick={() => setMethod('NAKİT')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase transition-all ${method === 'NAKİT' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Check size={14} className={method === 'NAKİT' ? 'opacity-100' : 'opacity-0'} /> NAKİT
                    </button>
                    <button 
                      title="Kredi Kartı Ödeme"
                      onClick={() => setMethod('KREDİ KARTI')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase transition-all ${method === 'KREDİ KARTI' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-lg ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Check size={14} className={method === 'KREDİ KARTI' ? 'opacity-100' : 'opacity-0'} /> KART
                    </button>
                 </div>
               </div>
            </div>

            {/* EK BİLGİLER (MAKBUZ VE ONAY KODU) */}
            <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
               <div className="space-y-2">
                  <label htmlFor="makbuz-no" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MAKBUZ NO (OPSİYONEL)</label>
                  <input 
                    id="makbuz-no"
                    title="Makbuz Numarası"
                    type="text"
                    value={makbuzNo}
                    onChange={e => setMakbuzNo(e.target.value)}
                    placeholder="M-0001"
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm font-black border-none outline-none focus:ring-4 ring-primary-500/10"
                  />
               </div>
               <div className="space-y-2">
                  <label htmlFor="onay-kodu" className={`text-[10px] font-black uppercase tracking-widest ml-1 ${method === 'KREDİ KARTI' ? 'text-indigo-500' : 'text-slate-400'}`}>
                    ONAY KODU {method === 'KREDİ KARTI' && '(ZORUNLU)'}
                  </label>
                  <div className="relative">
                    <CreditCard className={`absolute left-5 top-1/2 -translate-y-1/2 ${method === 'KREDİ KARTI' ? 'text-indigo-500' : 'text-slate-400 opacity-20'}`} size={18} />
                    <input 
                      id="onay-kodu"
                      title="Banka Onay Kodu"
                      type="text"
                      disabled={method !== 'KREDİ KARTI'}
                      value={onayKodu}
                      onChange={e => setOnayKodu(e.target.value)}
                      placeholder={method === 'KREDİ KARTI' ? "B-123456" : "---"}
                      className={`w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm font-black border-none outline-none focus:ring-4 ring-indigo-500/10 ${method !== 'KREDİ KARTI' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
               </div>
            </div>

            {/* AÇIKLAMA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İŞLEM AÇIKLAMASI</label>
              <textarea 
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="İşlem ile ilgili notlar..."
                className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm font-bold border-none outline-none focus:ring-4 ring-primary-500/10 resize-none"
              />
            </div>

            {/* OVERPAYMENT WARNING */}
            {isOverpaying && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4"
              >
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight leading-relaxed">
                  DİKKAT: GİRİLEN TUTAR KALAN BORÇTAN ({totalDebt.toLocaleString('tr-TR')} ₺) FAZLADIR.<br/>
                  BU İŞLEM VATANDAŞI ALACAKLI KONUMA GETİRECEKTİR.
                </p>
              </motion.div>
            )}

            {/* SUBMIT */}
            <button 
              disabled={isProcessing}
              onClick={handleSave}
              className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 group ${
                isOverpaying 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/40'
              } hover:scale-[1.02] active:scale-[0.98]`}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={20} className="group-hover:scale-125 transition-transform" />
                  TAHSİLATİ MÜHÜRLE VE MAKBUZ KES
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
