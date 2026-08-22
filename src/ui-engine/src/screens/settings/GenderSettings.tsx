import { FC } from 'react'
import { Users } from 'lucide-react'
import { UnknownGenderManager } from '../../components/UnknownGenderManager'

interface GenderSettingsProps {
  onRefresh: () => void | Promise<void>
}

export const GenderSettings: FC<GenderSettingsProps> = ({ onRefresh }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pink-500 text-white rounded-3xl"><Users size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Akıllı Cinsiyet Sözlüğü</h3>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">İsim Analizi ve Tahminleme</p>
          </div>
        </div>
        <div className="p-8 bg-pink-50 dark:bg-pink-900/10 rounded-[40px] border border-pink-100 dark:border-pink-900/30">
          <p className="text-sm font-bold text-pink-700 dark:text-pink-400 leading-relaxed uppercase tracking-tight opacity-75 mb-8">Sistem, kayıtlı Kişilerın isimlerinden otomatik cinsiyet analizi yapar.</p>
          <button onClick={async () => {
            const res = await (window as any).api.analyzeGenders();
            if (res.success) {
              alert(`Analiz Tamamlandı!\nErkek: ${res.stats.maleCount}\nKadın: ${res.stats.femaleCount}\nBelirsiz: ${res.stats.unknownCount}`);
              onRefresh();
            }
          }} className="w-full py-5 bg-pink-500 text-white font-black rounded-3xl hover:bg-pink-600 transition-all text-xs uppercase tracking-widest shadow-xl shadow-pink-500/20">TÜM KAYITLARDA ANALİZİ BAŞLAT</button>
        </div>
        <UnknownGenderManager />
      </div>
    </div>
  )
}

