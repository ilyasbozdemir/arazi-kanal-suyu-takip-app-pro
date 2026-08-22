import { FC } from 'react'
import { Database, FileText, RefreshCw, Binary } from 'lucide-react'

interface ImportSettingsProps {
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void
  onRefresh: () => void | Promise<void>
}

export const ImportSettings: FC<ImportSettingsProps> = ({ showAlert, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary-500 text-white rounded-3xl"><Database size={24} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Veri Aktarım Merkezi</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Toplu Kayıt ve JSON Yedek Yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-6 border-b-4 border-b-emerald-500">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-500 text-white rounded-2xl"><FileText size={20} /></div>
             <h4 className="text-sm font-black uppercase tracking-widest">Excel Aktarımı</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Kurumsal Excel dosyalarınızı sisteme hızlıca aktarın. Mevcut kayıtlarla eşleştirme yapılır.</p>
          <div className="flex flex-col gap-3">
            <button onClick={async () => {
              const res = await (window as any).api.selectFile();
              if (res && res.success) {
                const importRes = await (window as any).api.importExcel(res.filePath, 'merge');
                if (importRes && importRes.success) {
                  showAlert('BİLDİRİM', `🚀 Aktarım tamamlandı!`, 'success');
                  onRefresh();
                }
              }
            }} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10">EXCEL SEÇ VE YÜKLE</button>
          </div>
        </div>

        <div className="p-8 bg-slate-950 text-white rounded-[40px] border border-slate-800 space-y-6 border-b-4 border-b-primary-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 scale-150"><Binary size={40} /></div>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-primary-500 text-white rounded-2xl"><RefreshCw size={20} /></div>
             <h4 className="text-sm font-black uppercase tracking-widest">JSON Sistem Yedeği</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed font-mono">Tüm sistemi (Ayarlar dahil) tek bir JSON dosyasına aktarın veya yedekten dönün.</p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
             <button onClick={async () => {
                const res = await (window as any).api.exportDbJson();
                if (res.success) showAlert('BAŞARILI', 'Tüm sistem yedeği JSON olarak dışa aktarıldı.', 'success');
             }} className="py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all text-[9px] uppercase tracking-widest border border-slate-700">DIŞA AKTAR</button>
             
             <button onClick={async () => {
                if (confirm("DİKKAT: Mevcut tüm veriler silinecek ve JSON dosyasındaki veriler yüklenecektir. Onaylıyor musunuz?")) {
                  const res = await (window as any).api.importDbJson();
                  if (res.success) {
                    showAlert('BAŞARILI', 'Sistem yedeği başarıyla yüklendi. Uygulamayı yeniden başlatmanız önerilir.', 'success');
                    onRefresh();
                  }
                }
             }} className="py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all text-[9px] uppercase tracking-widest">İÇE AKTAR</button>
          </div>
        </div>
      </div>
    </div>
  )
}

