import React, { FC } from 'react'
import { X, LayoutDashboard, Database, MapIcon, Navigation, User, Plus, BookOpen, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Tab {
  id: string
  title: string
  type: string
  table?: string
  data?: any
  searchTerm?: string
  initialMevkiFilter?: string
}

export interface TabSystemProps {
  tabs: Tab[]
  activeTabId: string
  onTabSwitch: (id: string) => void
  onTabClose: (id: string) => void
  onReorder?: (tabs: Tab[]) => void
  onAddTabClick?: () => void
}

const getTabIcon = (type: string, table?: string) => {
  if (type === 'dashboard') return <LayoutDashboard size={14} className="text-primary-500" />
  if (type === 'tableView') return <Database size={14} className="text-emerald-500" />
  if (type === 'mevkiManagement') return <MapPin size={14} className="text-violet-500" />
  if (type === 'location' || type === 'lines') return <Navigation size={14} className="text-blue-500" />
  if (table === 'DATA_Vatandas') return <User size={14} className="text-secondary-500" />
  return <MapIcon size={14} className="text-primary-500" />
}

export const TabSystem: FC<TabSystemProps> = ({ tabs, activeTabId, onTabSwitch, onTabClose, onAddTabClick }) => {
  return (
    <div className="flex items-center gap-2 px-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-b border-slate-100 dark:border-white/5 no-scrollbar py-2 h-14 select-none overflow-x-auto min-w-0">
      <div className="flex items-center gap-2">
        <AnimatePresence initial={false}>
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id
            return (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0, transition: { duration: 0.15 } }}
                onClick={() => onTabSwitch(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 w-fit max-w-[200px] min-w-[120px] cursor-pointer rounded-xl transition-all group shrink-0 overflow-hidden
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/10 ring-1 ring-primary-500/5' 
                    : 'hover:bg-slate-200/50 dark:hover:bg-white/5 opacity-50 hover:opacity-100 border border-transparent'}
                `}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-50 dark:bg-slate-950' : ''}`}>
                  {getTabIcon(tab.type, tab.table)}
                </div>
                
                <div className="flex-1 truncate pointer-events-none">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                    {tab.title}
                  </p>
                </div>

                {tab.id !== 'dashboard' && (
                  <button
                    title="Sekmeyi Kapat"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    className={`
                      p-1 rounded-lg transition-all
                      ${isActive ? 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-500' : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400'}
                    `}
                  >
                    <X size={12} />
                  </button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      
      <button 
        onClick={() => onAddTabClick ? onAddTabClick() : onTabSwitch('dashboard')}
        className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 text-slate-400 hover:text-primary-500 hover:scale-110 active:scale-100 transition-all ml-4 shrink-0"
        title="Hızlı İşlem Menüsü"
      >
        <Plus size={20} />
      </button>
    </div>
  )
}

