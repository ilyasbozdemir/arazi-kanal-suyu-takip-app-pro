import React from 'react';
import { motion } from 'framer-motion';

interface TransferFormProps {
  transfer: any;
  setTransfer: (t: any) => void;
  kasalar: any[];
  handleTransfer: () => void;
}

export const AccountingTransferForm: React.FC<TransferFormProps> = ({
  transfer,
  setTransfer,
  kasalar,
  handleTransfer
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="max-w-md bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm space-y-6"
    >
      <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic">Virman & POS İşlemi</h3>
      <div className="space-y-4">
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setTransfer({...transfer, method: 'NAKİT'})} 
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${transfer.method === 'NAKİT' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
          >
            Nakit
          </button>
          <button 
            onClick={() => setTransfer({...transfer, method: 'KREDİ KARTI'})} 
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${transfer.method === 'KREDİ KARTI' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
          >
            Kredi Kartı
          </button>
        </div>
        <select 
          title="Kaynak Kasa Seçimi"
          value={transfer.sourceId} 
          onChange={e => setTransfer({...transfer, sourceId: e.target.value})} 
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none"
        >
          <option value="">Kaynak Kasa</option>
          {kasalar.map(k => <option key={k.id} value={k.id}>{k.Kasa_Adi} ({k.Bakiye} TL)</option>)}
        </select>
        <select 
          title="Hedef Kasa Seçimi"
          value={transfer.targetId} 
          onChange={e => setTransfer({...transfer, targetId: e.target.value})} 
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none"
        >
          <option value="">Hedef Kasa</option>
          {kasalar.map(k => <option key={k.id} value={k.id}>{k.Kasa_Adi}</option>)}
        </select>
        <div className="flex gap-2">
          <input 
            title="Transfer Miktarı"
            type="number" 
            value={transfer.amount} 
            onChange={e => setTransfer({...transfer, amount: parseFloat(e.target.value) || 0})} 
            placeholder="Miktar" 
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none" 
          />
          <button 
            type="button"
            onClick={() => {
              const sourceKasa = kasalar.find(k => k.id === transfer.sourceId);
              if (sourceKasa) {
                setTransfer({...transfer, amount: Number(sourceKasa.Bakiye || 0)});
              }
            }}
            className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[9px] rounded-2xl hover:bg-primary-500 hover:text-white transition-all uppercase"
          >
            TAMAMI
          </button>
        </div>
        <button 
          onClick={handleTransfer} 
          className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20"
        >
          İŞLEMİ MÜHÜRLE
        </button>
      </div>
    </motion.div>
  );
};
