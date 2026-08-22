import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface TableSelectionBarProps {
  rowSelection: any;
  handleBulkDelete: () => void;
  setRowSelection: (val: any) => void;
}

export const TableSelectionBar: React.FC<TableSelectionBarProps> = ({
  rowSelection,
  handleBulkDelete,
  setRowSelection,
}) => {
  const selectionCount = Object.keys(rowSelection).length;

  return (
    <AnimatePresence>
      {selectionCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 lg:bottom-10 left-4 right-4 lg:left-72 lg:right-10 z-[80] flex justify-center pointer-events-none"
        >
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-full sm:w-auto px-4 sm:px-8 py-4 sm:py-5 rounded-3xl sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 border border-white/10 pointer-events-auto">
            <div className="flex items-center gap-4 sm:border-r border-white/10 dark:border-slate-300 sm:pr-8 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-primary-500/30 shrink-0">
                {selectionCount}
              </div>
              <div className="flex-shrink-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-50 italic">Seçilen Kayıt</p>
                <p className="text-xs sm:text-sm font-black uppercase tracking-tighter">İşlem Bekliyor</p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-rose-500 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95 shadow-rose-500/20 whitespace-nowrap"
              >
                <Trash2 size={14} /> <span className="hidden sm:inline">Seçilenleri Sil</span><span className="sm:hidden">Sil</span>
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-white/20 dark:hover:bg-slate-300 transition-all active:scale-95 whitespace-nowrap"
              >
                İptal Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

