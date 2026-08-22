import { FC } from 'react'
import { motion } from 'framer-motion'
import { Plus, Map, RefreshCw, ArrowUpRight } from 'lucide-react'
import { APP_LOGO_BASE64 } from '../../assets/logo-base64'

interface DashboardHeaderProps {
  onNewPerson: () => void
  onNewTapu: () => void
  onNewLedger: () => void
  onViewAll: () => void
}

export const DashboardHeader: FC<DashboardHeaderProps> = ({ onNewPerson, onNewTapu, onNewLedger, onViewAll }) => {
  return (
    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-white/5"
          >
            <img src={APP_LOGO_BASE64} className="w-12 h-12 object-contain" alt="Logo" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none italic">
            ARAZİ SUYU TAKİBİ
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Kanal ve Arazi Sulama Modülü</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onNewPerson}
          className="group flex items-center gap-3 px-6 py-3 bg-primary-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-500"><Plus size={14} /></div>
          YENİ KİŞİ
        </button>

        <button
          onClick={onNewTapu}
          className="group flex items-center gap-3 px-6 py-3 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
        >
          <div className="p-1 bg-white/10 dark:bg-slate-900/10 rounded-lg group-hover:rotate-12 transition-transform duration-500"><Map size={14} /></div>
          YENİ TAPU / ARAZİ
        </button>

        <button
          onClick={onNewLedger}
          className="group flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/10"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-500"><ArrowUpRight size={14} /></div>
          DAĞITIM DEFTERLERİNİ AÇ
        </button>

        <button
          onClick={() => window.location.reload()}
          className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all hover:shadow-lg group"
          title="Verileri Yenile"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>
    </header>
  )
}

