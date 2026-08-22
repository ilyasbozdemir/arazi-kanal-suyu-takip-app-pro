import { FC } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, DollarSign, FileText, CheckCircle2, HelpCircle, Plus } from 'lucide-react'

export const Manual: FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
        {/* Başlık Paneli */}
        <div className="bg-slate-900 text-white p-12 rounded-[48px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 blur-[100px] -mr-48 -mt-48 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
              <BookOpen size={48} className="text-primary-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase leading-none">SİSTEM KULLANIM REHBERİ (A-Z)</h1>
              <p className="text-primary-400 font-bold uppercase tracking-widest text-sm">KURUM BAŞKANLIĞI ERP & SU TAKİP SİSTEMİ</p>
            </div>
          </div>
        </div>

        {/* İçerik Alanı - Markdown Render Simülasyonu */}
        <div className="max-w-4xl mx-auto space-y-10 prose dark:prose-invert prose-slate">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <DollarSign className="text-primary-500" /> MUHASEBE VE KASA YÖNETİMİ
            </h2>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Sistemdeki tüm mali hareketler **Kasa** ve **Makbuz** ekseninde döner. Fiziksel olarak kesilen her makbuzun sistemdeki karşılığı bir "Muhasebe Fişi"dir.
              </p>
              <ul className="mt-4 space-y-3 list-none p-0">
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold">Kasa Tanımlama:</span> <span className="text-sm text-slate-500">Gelirlerin toplandığı ana ve tali kasaları (Merkez Kasa, Tahsilat Şefliği vb.) yönetin.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold">Virman İşlemleri:</span> <span className="text-sm text-slate-500">Kasalar arası bakiye transferlerini izli ve onaylı şekilde gerçekleştirin.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold">Ödeme Takibi:</span> <span className="text-sm text-slate-500">Dağıtım defterindeki her tahakkuk, muhasebe ekranında "Bekleyen Fiş" olarak görünür.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <FileText className="text-blue-500" /> MAKBUZ VE FİŞ DİSİPLİNİ
            </h2>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Fiziksel makbuzların sisteme işlenmesi sürecinde dikkat edilmesi gerekenler:
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 dark:bg-white/2 rounded-2xl border border-slate-100 dark:border-white/5">
                  <h4 className="font-black text-xs text-primary-500 mb-2 uppercase">Otomatik Numara</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Seçili makbuz defterine göre sıradaki numara otomatik gelir, onaylandığında +1 artar.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/2 rounded-2xl border border-slate-100 dark:border-white/5">
                  <h4 className="font-black text-xs text-blue-500 mb-2 uppercase">Tahsildar Seçimi</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Ödemeyi alan personel sistemden seçilerek idari sorumluluk zinciri korunur.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <HelpCircle className="text-blue-500" /> SIKÇA SORULAN SORULAR
            </h2>
            <div className="space-y-4">
              {[
                { q: "Hatalı kesilen makbuzu nasıl iptal ederim?", a: "Muhasebe ekranından ilgili fişi bulup 'İptal' durumuna getirin. Bu işlem kasadaki bakiyeyi de iade edecektir." },
                { q: "Kasa bakiyesi neden tutmuyor?", a: "Tüm tahsilatların 'Tamamlandı' olarak işaretlendigenden ve virmanların doğru işlendiğinden emin olun." },
                { q: "Personel listesi nasıl güncellenir?", a: "Ayarlar > Personel Yönetimi kısmından yeni tahsildar ekleyebilir veya ünvan güncelleyebilirsiniz." }
              ].map((faq, i) => (
                <details key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-4 group transition-all cursor-pointer hover:border-blue-500/20">
                  <summary className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase list-none flex items-center justify-between">
                    {faq.q}
                    <Plus size={16} className="text-slate-300 group-open:rotate-45 transition-transform" />
                  </summary>
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-50 dark:border-white/5 pt-4">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  )
}

