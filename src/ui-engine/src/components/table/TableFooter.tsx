import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TableFooterProps {
  table: any;
  dataCount: number;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  table,
  dataCount,
}) => {
  return (
    <div className="px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-50/10 dark:bg-slate-900/50 gap-4">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="text-[9px] font-black text-slate-400 uppercase pl-1.5">GÖRÜNÜM:</span>
          <select
            title="Sayfa Başına Kayıt Sayısı"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-700 border-none rounded-md px-2 py-1 text-[9px] font-black text-primary-600 outline-none cursor-pointer hover:bg-slate-100 transition-all shadow-sm"
          >
            {[10, 50, 100, 250, 500, 1000].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} Kayıt
              </option>
            ))}
          </select>
        </div>
        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          LİSTE: {table.getFilteredRowModel().rows.length} / {dataCount}
        </div>
        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          SAYFA: {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          title="Önceki Sayfa"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 disabled:opacity-20 transition-all shadow-sm active:scale-95"
        >
          <ChevronRight size={16} className="rotate-180" />
        </button>
        <button
          title="Sonraki Sayfa"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 disabled:opacity-20 transition-all shadow-sm active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

