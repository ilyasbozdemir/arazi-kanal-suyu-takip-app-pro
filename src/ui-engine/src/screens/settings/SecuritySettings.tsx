import { FC } from 'react'
import { ShieldCheck, Lock, Database, Key } from 'lucide-react'

export const SecuritySettings: FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-500 text-white rounded-3xl"><ShieldCheck size={24} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Güvenlik Profili & Şifreleme</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Uçtan Uca Veri Güvenliği</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[48px] border border-slate-100 dark:border-slate-700/50 space-y-6">
           <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-500 shadow-sm"><Lock size={32} /></div>
           <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Sistem Giriş Koruması</h4>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Uygulama açılışında veya hassas ayarlarda belirlediğiniz şifre istenir. Bu şifre veritabanında tek yönlü hash olarak saklanmaktadır.</p>
         </div>
         
         <div className="p-10 bg-slate-900 text-white rounded-[48px] border border-slate-800 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150"><Database size={64} /></div>
           <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-primary-500 ring-1 ring-white/20"><Key size={32} /></div>
           <h4 className="text-lg font-black uppercase tracking-tighter">AES-256 Veri Şifreleme</h4>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Tüm sistem ayarları, SMTP şifreleri ve webhook secretları askeri düzey AES-256-CBC algoritması ile şifrelenir. Anahtarınız olmadan veriler çözülemez.</p>
         </div>
      </div>
    </div>
  )
}

