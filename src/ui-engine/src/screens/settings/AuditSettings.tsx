import { FC, useState } from 'react'
import { ShieldAlert as ShieldIcon, History, Activity } from 'lucide-react'
import { AuditScreen } from '../sistem/AuditScreen'
import { ActivityLogScreen } from '../sistem/ActivityLogScreen'

export const AuditSettings: FC = () => {
  const [activeTab, setActiveTab] = useState<'dirty' | 'activity'>('activity')

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
       {/* 🛡️ TAB NAVIGATOR */}
       <div className="bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex gap-2 w-fit">
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            <Activity size={16} />
            Personel İşlem Denetimi
          </button>
          <button 
            onClick={() => setActiveTab('dirty')}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dirty' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            <ShieldIcon size={16} />
            Veri Bütünlük Analizi
          </button>
       </div>

       <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[700px]">
          {activeTab === 'dirty' ? (
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-500 text-white rounded-3xl"><ShieldIcon size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Veri Denetim & Bütünlük</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Sistem Hataları ve Tutarsızlık Analizi</p>
                </div>
              </div>
              <AuditScreen onOpenDetail={(table: string, id: any) => {
                 (window as any).addTab({ type: 'detail', table, data: { id }, title: 'Hata Kaydı' });
              }} />
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary-500 text-white rounded-3xl"><History size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Personel İşlem Geçmişi</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Kriptografik Mühürlü Denetim Kayıtları</p>
                </div>
              </div>
              <ActivityLogScreen />
            </div>
          )}
       </div>
    </div>
  )
}
