import { FC } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, HelpCircle } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: 'white' | 'blue' | 'blue' | 'orange'
  onClick?: () => void
  helpText?: string
}

export const MetricCard: FC<MetricCardProps> = ({ title, value, subtitle, variant = 'white', icon: Icon, onClick, helpText }) => {
  const styles = {
    white: {
      card: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800",
      title: "text-slate-400 dark:text-slate-500",
      value: "text-slate-900 dark:text-white",
      subtitle: "text-slate-400 dark:text-slate-500",
      iconBox: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    blue: {
        card: "bg-[#1B5E20] border-transparent",
        title: "text-emerald-100/70",
        value: "text-white",
        subtitle: "text-emerald-100/60",
        iconBox: "bg-white/10 text-white"
    },
    blue: {
        card: "bg-[#0288D1] border-transparent",
        title: "text-blue-100/70",
        value: "text-white",
        subtitle: "text-blue-100/60",
        iconBox: "bg-white/10 text-white"
    },
    orange: {
        card: "bg-[#E65100] border-transparent",
        title: "text-orange-100/70",
        value: "text-white",
        subtitle: "text-orange-100/60",
        iconBox: "bg-white/10 text-white"
    }
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-6 rounded-[24px] border shadow-sm cursor-pointer transition-all overflow-hidden ${styles.card}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${styles.title}`}>{title}</p>
            {helpText && (
               <div className="group/help relative inline-block">
                 <HelpCircle size={14} className={`${styles.title} opacity-40 hover:opacity-100`} />
                 <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-slate-900 text-white text-[9px] font-black rounded-xl opacity-0 group-hover/help:opacity-100 transition-opacity z-[100] pointer-events-none shadow-2xl uppercase tracking-widest leading-relaxed">
                   {helpText}
                 </div>
               </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <h3 className={`text-4xl font-black tracking-tight ${styles.value}`}>
                {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
            </h3>
          </div>
          {subtitle && (
            <p className={`text-[10px] font-semibold uppercase tracking-wide mt-1 ${styles.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${styles.iconBox}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  )
}

