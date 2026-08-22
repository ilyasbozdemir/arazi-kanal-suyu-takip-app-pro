import { FC } from 'react'
import { CheckCircle, ShieldAlert, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModernAlertProps {
  config: {
    isOpen: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }
  onClose: () => void
}

export const ModernAlert: FC<ModernAlertProps> = ({ config, onClose }) => {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md text-slate-800 dark:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5"
      >
        <div className={`p-10 flex flex-col items-center text-center space-y-6 ${config.type === 'success' ? 'bg-emerald-500/5' : config.type === 'error' ? 'bg-rose-500/5' : 'bg-primary-500/5'}`}>
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${config.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/40' : config.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/40' : 'bg-primary-500 text-white shadow-primary-500/40'}`}>
            {config.type === 'success' ? <CheckCircle size={40} /> : config.type === 'error' ? <ShieldAlert size={40} /> : <Info size={40} />}
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{config.title || 'BİLDİRİM'}</h3>
            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight">{config.message}</p>
          </div>
          <button onClick={onClose} className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${config.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : config.type === 'error' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' : 'bg-primary-600 hover:bg-slate-800 text-white shadow-primary-500/20'}`}>ANLADIM</button>
        </div>
      </motion.div>
    </div>
  )
}

