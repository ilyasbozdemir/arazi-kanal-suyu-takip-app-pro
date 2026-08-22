import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MigrationRecordCardProps {
  row: any;
  isSelected: boolean;
  isMigrated: boolean;
  toggleSelect: (id: string) => void;
}

export const MigrationRecordCard: React.FC<MigrationRecordCardProps> = ({
  row,
  isSelected,
  isMigrated,
  toggleSelect,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => !isMigrated && toggleSelect(row.id)}
      className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isMigrated
          ? 'bg-slate-900/40 border-slate-800/30 opacity-60'
          : isSelected
            ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
            : 'bg-[#161a23] border-slate-800 hover:border-slate-700 hover:bg-[#1a1f29]'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-bold text-lg mb-0.5 group-hover:text-blue-400 transition-colors">
            {row.Ad || row.Adi || 'İsimsiz'} {row.Soyad || row.Soyadi || ''}
          </h4>
          <div className="text-slate-400 text-xs font-mono bg-slate-800/50 px-2 py-0.5 rounded-md inline-block">
            {row.TCKN || row.Sahip_TCKN || row.id.substring(0, 8)}
          </div>
        </div>

        {isMigrated ? (
          <div className="bg-blue-500/20 text-blue-500 p-1.5 rounded-full">
            <CheckCircle2 size={18} />
          </div>
        ) : isSelected ? (
          <div className="bg-blue-500 text-white p-1 rounded-full">
            <CheckCircle2 size={18} />
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-slate-700 rounded-full group-hover:border-blue-500/50 transition-colors" />
        )}
      </div>

      <div className="space-y-1.5 mt-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-medium">Baba Adı:</span>
          <span className="text-slate-300">{row.Baba_Adi || row.BabaAdı || '-'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-medium">Sicil No:</span>
          <span className="text-slate-300 font-bold">{row.Sicil_No || row['Sicil No'] || '-'}</span>
        </div>
        <div className="flex justify-between text-xs pt-2 border-t border-slate-800/50 mt-2">
          <span className="text-slate-500 font-medium">Lokasyon:</span>
          <span className="text-slate-300 truncate max-w-[120px]">{row.Mahalle_Koy || row.Mahalle || '-'}</span>
        </div>
      </div>

      {!isMigrated && (
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </motion.div>
  );
};

