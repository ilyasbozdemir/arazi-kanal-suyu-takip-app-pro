import { marked } from 'marked';
import { HelpCircle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const HELP_MARKDOWN = `
# KURUM BAŞKANLIĞI - AKILLI SİSTEM YARDIM REHBERİ

Bu rehber, kurum su takip ve arazi yönetim sistemini hatasüz kullanmanız için hazırlanmıştır. Sistemin veri bütünlüğü prensibi gereği bazı işlemlerin belirli bir sırayla yapılması zorunludur.

---

## 1. Mükellef ve Vatandaş İşlemleri
Sistemin temel taşı **Vatandaş** verisidir.
- **Kural:** Bir arazi (Tapu) eklemeden önce, o arazinin sahibini (Vatandaşı) sisteme kaydetmiş olmalısınız.
- **Neden?** Tapu kayıtları TCKN üzerinden vatandaş kartlarına bağlanır. Sahibi olmayan bir taşınmaz sisteme girilemez.

## 2. Taşınmaz (Tapu) Kayıtları
- **Kural:** Sulama kaydı girmeden önce ilgili **Taşınmaz** sisteme eklenmiş olmalıdır.
- **Önemli:** Taşınmaz kartında "Aylık Su Hakkı" alanını doldurmayı unutmayın. Bu alan, dağıtım defterinde uyarıların otomatik çıkmasını sağlar.

## 3. Sulama ve Dağıtım Süreçleri
Sulama defterine kayıt girerken aşağıdaki önkoşulların tamamlanmış olması gerekir:
1. **Makbuz Defteri:** "Ayarlar > Makbuz Defterleri" kısmından en az bir aktif defter tanımlanmalıdır. Defter tanımlanmadan tahakkuk yapılamaz.
2. **Su Ücretleri (Tarife):** "Su Hizmetleri > Tarife Yönetimi" altından cari yılın Gündüz ve Gece birim fiyatlarını belirlemelisiniz.
3. **Personel (Tahsildar):** Tahsilatı yapacak personel sisteme "Personel Yönetimi" altından eklenmelidir.

---

## 4. Kritik Uyarılar ve İpuçları
> [!IMPORTANT]
> **Dosya Saklama:** Haritaya eklediğiniz KML veya DXF dosyaları artık sistem tarafından otomatik yedeklenir. Dosyaları bilgisayarınızdan silseniz dahi sistemdeki kopyaları çalışmaya devam eder.

> [!WARNING]
> **Su Hakkı Aşımı:** Eğer bir parsele o ay için hakkından fazla su yazılırsa sistem kırmızı yanıp sönerek sizi uyaracaktır. Bu uyarıyı dikkate alarak adaleti sağlayınız.

> [!TIP]
> **Hızlı Sorgulama:** Harita ekranında sol alttaki "Fare" simgesine basarak, arama yapmadan sadece haritaya tıklayarak parsel bilgilerine erişebilirsiniz.

---

## 5. Destek ve İletişim
Sistemle ilgili teknik sorunlarda lütfen **Bilgi İşlem Birimi** ile iletişime geçiniz. Verilerinizi her akşam "Yedekleme & Mail" kısmından buluta göndermeyi unutmayınız.
`;

export const HelpSettingsScreen: React.FC = () => {
  const getHtml = () => {
    const renderer = new marked.Renderer();
    
    // Custom header renderer
    renderer.heading = ({ tokens, depth }: any) => {
      const text = tokens.map((t: any) => t.text || t.raw).join('');
      if (depth === 1) {
        return `<h1 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8 border-b-4 border-primary-500 pb-4 inline-block">${text}</h1>`;
      }
      if (depth === 2) {
        return `<h2 class="text-xl font-black text-slate-700 dark:text-white uppercase tracking-tight mt-12 mb-6 flex items-center gap-3 before:content-[''] before:w-2 before:h-8 before:bg-primary-500 before:rounded-full">${text}</h2>`;
      }
      return `<h${depth}>${text}</h${depth}>`;
    };

    // Custom blockquote (alert) renderer
    renderer.blockquote = ({ tokens }: any) => {
      let quote = tokens.map((t: any) => t.text || t.raw || '').join('');
      let type = 'info';
      
      if (quote.includes('[!IMPORTANT]')) {
        type = 'important';
        quote = quote.replace('[!IMPORTANT]', '').trim();
      } else if (quote.includes('[!WARNING]')) {
        type = 'warning';
        quote = quote.replace('[!WARNING]', '').trim();
      } else if (quote.includes('[!TIP]')) {
        type = 'tip';
        quote = quote.replace('[!TIP]', '').trim();
      }

      const classes = {
        important: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20',
        warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20',
        tip: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20',
        info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20'
      };

      const icons = {
        important: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        warning: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
        tip: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>',
        info: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
      };

      return `
        <div class="my-8 p-6 rounded-2xl border-2 flex items-start gap-4 ${classes[type as keyof typeof classes]}">
          <div class="flex-shrink-0 mt-1">${icons[type as keyof typeof icons]}</div>
          <div class="font-bold text-sm leading-relaxed">${quote}</div>
        </div>
      `;
    };

    return marked.parse(HELP_MARKDOWN, { renderer }) as string;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col">
      <div className="p-8 bg-primary-500 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <HelpCircle size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Sistem Yardım & Kullanım Klavuzu</h2>
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-1">Kurum Başkanlığı ERP Standartları</p>
        </div>
      </div>

      <div 
        className="p-12 overflow-y-auto custom-scrollbar max-h-[600px] prose dark:prose-invert prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: getHtml() }}
      />
    </div>
  );
};

