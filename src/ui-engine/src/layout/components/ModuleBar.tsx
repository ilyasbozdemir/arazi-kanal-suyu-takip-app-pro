import { FC } from 'react'
import { Search, Settings } from 'lucide-react'

interface ModuleBarProps {
  onSearchClick: () => void
  onSettingsClick: () => void
}

export const ModuleBar: FC<ModuleBarProps> = ({ onSearchClick, onSettingsClick }) => {
  return (
    <div className="h-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] select-none">
      <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl border border-slate-300/50 dark:border-white/5">
        <div className="px-5 py-1 rounded-lg text-[9px] font-black tracking-widest bg-white dark:bg-slate-800 text-primary-500 shadow-sm">
          SULAMA BİRLİĞİ SİSTEMİ
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div 
          className="w-56 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg flex items-center px-2 gap-2 cursor-text hover:border-primary-500/50 transition-all shadow-sm" 
          onClick={onSearchClick}
        >
          <Search size={11} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden truncate">TCKN veya İsim Ara (Ctrl+K)</span>
        </div>

        <button
          onClick={onSettingsClick}
          className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg transition-all"
          title="Sistem Ayarları"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  )
}

