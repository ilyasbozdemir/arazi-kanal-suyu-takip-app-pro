import React from 'react';
import { X, Wallet } from 'lucide-react';

interface MovementModalProps {
  selectedKasa: any;
  onClose: () => void;
  movements: any[];
}

export const AccountingMovementModal: React.FC<MovementModalProps> = ({
  selectedKasa,
  onClose,
  movements
}) => {
  if (!selectedKasa) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-white/10">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Wallet size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                  {selectedKasa.Kasa_Adi} — Finansal Hareketler
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resmi finansal mutabakat süreci</p>
             </div>
          </div>
          <button title="Pencereyi Kapat" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-white/5">
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase">Tarih</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase">Açıklama</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase">Yöntem</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {new Date(m.Tarih).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-4 text-xs font-black uppercase text-slate-800 dark:text-white">{m.Aciklama}</td>
                  <td className="py-4 text-[10px] font-black text-slate-400 uppercase">
                    {m.Odeme_Yontemi || 'NAKİT'}
                  </td>
                  <td className={`py-4 text-right font-black text-xs ${m.Tur === 'GELİR' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.Tur === 'GELİR' ? '+' : '-'}
                    {Number(m.Tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
