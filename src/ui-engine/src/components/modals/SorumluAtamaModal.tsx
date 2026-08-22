import React, { FC } from 'react';
import { User, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface SorumluAtamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: any;
  meravs: any[];
  onSelect: (meravId: string) => void;
  isProcessing: boolean;
}

export const SorumluAtamaModal: FC<SorumluAtamaModalProps> = ({ 
  isOpen, onClose, targetItem, meravs, onSelect, isProcessing 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>SORUMLU PERSONEL ATAMASI</DialogTitle>
          <DialogDescription>{targetItem?.Mahalle_Adi || targetItem?.Mevki_Adi} Bölgesi Yetkilisi</DialogDescription>
        </DialogHeader>
        
        <div className="py-8 space-y-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">MERAV GÖREVLİSİ SEÇİN</div>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            <button 
              disabled={isProcessing}
              onClick={() => onSelect('')}
              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-left hover:border-rose-500 transition-all group disabled:opacity-50"
            >
              <div className="text-xs font-black text-slate-400 group-hover:text-rose-500 uppercase tracking-widest italic">SORUMLU ATAMASINI KALDIR</div>
            </button>
            
            {meravs.map(m => {
              const isAssigned = (targetItem?.Merav_Ids || "").split(',').includes(m.id);
              return (
                <button 
                  key={m.id}
                  disabled={isProcessing}
                  onClick={() => onSelect(m.id)}
                  className={`w-full p-5 rounded-[24px] border transition-all text-left flex items-center justify-between group ${
                    isAssigned 
                      ? 'bg-primary-500 border-primary-600 text-white shadow-lg shadow-primary-500/20' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-primary-500'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAssigned ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-primary-500'}`}>
                      <User size={20} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight">{m.Ad_Soyad}</span>
                  </div>
                  {isAssigned && <ShieldCheck size={20} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <button 
            disabled={isProcessing}
            onClick={onClose} 
            className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            İPTAL
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
