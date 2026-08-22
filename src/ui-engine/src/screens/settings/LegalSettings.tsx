import { FC } from 'react'
import { Gavel, ShieldAlert as ShieldIcon, Binary } from 'lucide-react'

export const LegalSettings: FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-rose-500 text-white rounded-3xl"><Gavel size={24} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Güvenlik & Yasal Sorumluluk</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">KVKK, Su Tasarrufu ve Lisans Bildirimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl"><ShieldIcon size={18} /></div>
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">KVKK & Gizlilik Bildirimi</h4>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed uppercase opacity-80">
            Bu uygulama, **Kurum Başkanlığı** bünyesindeki arazi ve su yönetimi verilerini modernleştirmek amacıyla geliştirilmiştir.
            İçerdiği tüm Kişi ve tapu verileri **KVKK (Kişisel Verilerin Korunması Kanunu)** kapsamında gizlilikle korunmalı ve kesinlikle 3. şahıslarla paylaşılmamalıdır.
          </p>
          <div className="p-8 bg-rose-500/5 rounded-[32px] border border-rose-500/10 italic">
            <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 leading-relaxed uppercase">
              ÖNEMLİ: Bu sistemin temel amacı, Excel dosyalarındaki formül hatalarını ve veri kayıplarını önlemek; su kıtlığı dönemlerinde sulama saatlerini adil ve israfsız yönetmektir.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl"><Binary size={18} /></div>
            <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">Yazılım Doğrulama (Hash)</h4>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed uppercase opacity-80">
            Orijinal yazılımın bütünlüğünden emin olmak için EXE dosyasının SHA-256 değerini kontrol edebilirsiniz. Crack/modifiye edilmiş yazılımların kullanımı veri kaybına veya güvenlik ihlallerine yol açabilir.
          </p>
          <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 font-mono text-[9px] break-all text-slate-500 ring-1 ring-slate-100 dark:ring-white/5">
            <span className="text-slate-400 block mb-3 font-black uppercase text-[8px] tracking-[0.2em]">RESMİ SHA-256 HASH DEĞERİ:</span>
            3F8D2B1A6E9C0D2F4A5B8C9D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F
          </div>
        </div>
      </div>
    </div>
  )
}

