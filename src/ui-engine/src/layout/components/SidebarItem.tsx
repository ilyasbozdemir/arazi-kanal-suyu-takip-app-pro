import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number | string | null;
  isCollapsed?: boolean;
}

export function SidebarItem({ icon: Icon, label, active, onClick, count = null, isCollapsed = false }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : ''}
      className={`
        flex items-center rounded-3xl transition-all duration-500 group relative overflow-hidden
        ${isCollapsed ? 'w-14 h-14 justify-center p-0 mx-auto' : 'w-full justify-between px-6 py-4'}
        ${active
          ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/30'
          : 'bg-transparent text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-white/5'}
      `}
    >
      <div className={`flex items-center gap-4 relative z-10 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={`
          p-2.5 rounded-2xl transition-all duration-500
          ${active ? 'bg-white/10' : 'bg-slate-200/50 dark:bg-white/5 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white'}
        `}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <span className={`text-xs font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
            {label}
          </span>
        )}
      </div>

      {!isCollapsed && count !== null && (
        <span className={`
          text-[9px] font-black px-2 py-1 rounded-lg relative z-10
          ${active ? 'bg-white/20 text-white' : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 group-hover:text-primary-500'}
        `}>
          {count}
        </span>
      )}

      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className={`absolute left-0 bg-white rounded-r-full ${isCollapsed ? 'w-1 h-6' : 'w-1.5 h-6'}`}
        />
      )}
    </button>
  )
}

