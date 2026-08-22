import React, { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Users, Map, FileSpreadsheet, RefreshCcw, Droplet, 
  History, Settings, HelpCircle, UserPlus, Database, ArrowRightLeft, MapPin,
  CreditCard, ShieldCheck, DollarSign
} from 'lucide-react'
import { useAppStore } from "@renderer/store/useAppStore";

interface ActionItem {
  id: string
  label: string
  icon: any
  color: string
  table?: string
  module?: 'SULAMA_BIRLIGI' | 'SU_DEFTERI' // Optional: if missing, show in both
}

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  onAction: (action: string, table?: string) => void
}

export const QuickActionModal: FC<QuickActionModalProps> = ({ isOpen, onClose, onAction }) => {
  const { activeModule } = useAppStore()

  const actions: { category: string, items: ActionItem[] }[] = [
    {
      category: 'İDARİ HIZLI İŞLEMLER',
      items: [
        { id: 'new_vatandas', label: 'YENİ VATANDAŞ KAYDI', icon: UserPlus, color: 'bg-primary-500', table: 'DATA_Vatandas' },
        { id: 'new_tapu', label: 'YENİ TAPU / ARAZİ', icon: Map, color: 'bg-emerald-500', table: 'DATA_Tapu_Verisi' },
        { id: 'new_tahsilat', label: 'YENİ TAHSİLAT MAKBUZU', icon: CreditCard, color: 'bg-blue-500', table: 'MUHASEBE_Tahsilat' },
        { id: 'new_tarife', label: 'YENİ MECLİS KARARI', icon: ShieldCheck, color: 'bg-rose-500', table: 'TANIM_Su_Ucretleri' },
        { id: 'new_kasa', label: 'KASA / VİRMAN İŞLEMİ', icon: DollarSign, color: 'bg-indigo-500', table: 'MUHASEBE_Kasa_Hareketleri' },
      ]
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#0d1016] border border-slate-200 dark:border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="text-primary-500" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">HIZLI İŞLEM MERKEZİ</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">YAPILACAK İŞLEMİ SEÇİNİZ</p>
                </div>
              </div>
              <button 
                type="button"
                title="Kapat"
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-rose-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {actions.map((cat) => (
                <div key={cat.category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{cat.category}</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cat.items.map((item) => (
                      <button
                        type="button"
                        title={item.label}
                        key={item.id}
                        onClick={() => {
                          onAction(item.id, item.table)
                          onClose()
                        }}
                        className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary-500 dark:hover:border-primary-500/50 hover:bg-white dark:hover:bg-primary-500/10 transition-all group active:scale-95"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                          <item.icon size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 group-hover:text-primary-500 text-center uppercase tracking-widest">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-white/5 px-8 py-4 flex justify-center border-t border-slate-100 dark:border-white/5">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">SEKME YÖNETİMİ PANELİ v1.2</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

