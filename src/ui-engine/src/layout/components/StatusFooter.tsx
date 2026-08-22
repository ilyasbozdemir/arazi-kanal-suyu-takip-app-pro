import { FC } from 'react'
import { Database, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export const StatusFooter: FC = () => {
  const { dbPath, theme, setTheme } = useAppStore()

  return (
    <footer className="h-7 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 flex items-center justify-between px-3 shrink-0 z-[100] select-none text-slate-500">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-2 px-2 hover:bg-slate-200 dark:hover:bg-white/5 transition-all h-full cursor-help" title="Database Connected">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">SİSTEM BAĞLI</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4 h-3">
          <Database size={11} />
          <span className="text-[10px] font-bold uppercase truncate max-w-[200px] leading-none">{dbPath.split('\\').pop() || 'SQLITE'}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4 h-3">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">MALİ DÖNEM: 2026</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4 h-3">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none text-emerald-500">KASA NİZAMI: AKTİF</span>
        </div>
        <div 
          className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4 h-3 opacity-50 hover:opacity-100 hover:text-primary-500 transition-all cursor-pointer group"
          onClick={() => (window as any).api.openExternal('https://ilyasbozdemir.dev')}
          title="İlyas Bozdemir"
        >
          <span className="text-[10px] font-black uppercase tracking-widest leading-none group-hover:underline decoration-primary-500/30 underline-offset-4">DEVELOPMENT BY İLYAS BOZDEMİR</span>
        </div>
      </div>
      <div className="flex items-center gap-4 h-full">
        <div
          className="flex items-center gap-2 px-2 hover:bg-slate-200 dark:hover:bg-white/5 transition-all h-full cursor-pointer group"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Görünüm Modunu Değiştir"
        >
          {theme === 'dark' ? <Moon size={11} className="group-hover:text-primary-500 transition-colors" /> : <Sun size={11} className="group-hover:text-blue-500 transition-colors" />}
          <span className="text-[10px] font-bold uppercase leading-none">{theme === 'dark' ? 'KOYU GÖRÜNÜM' : 'AYDINLIK GÖRÜNÜM'}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4 h-3">

          <span className="text-[10px] font-black uppercase tracking-widest leading-none">ARAZİ & SU TAKİP SİSTEMİ V3.0.0-BETA.1</span>
        </div>
      </div>
    </footer>
  )
}

