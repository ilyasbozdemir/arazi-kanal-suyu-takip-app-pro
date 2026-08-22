import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Droplets, 
  BookOpen, 
  Users,
  RefreshCw,
  MapPin,
  DollarSign,
  ShieldCheck,
  Wallet,
  Clock,
  History,
  TrendingUp,
  FileText
} from 'lucide-react';

interface DistributionGuideWidgetProps {
  addTab: (tab: any) => void;
}

export const DistributionGuideWidget: React.FC<DistributionGuideWidgetProps> = ({ addTab }) => {
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');
  const [checks, setChecks] = useState({
    citizens: false,
    properties: false,
    pricing: false,
    receiptBooks: false,
    personnel: false,
    kasalar: false,
    fisler: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const runChecks = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all([
        (window as any).api.getDbData('DATA_Vatandas'),
        (window as any).api.getDbData('DATA_Tapu_Verisi'),
        (window as any).api.getDbData('TANIM_Su_Ucretleri', { Aktif: 1 }),
        (window as any).api.getDbData('TANIM_Sulama_Fis_Kocanlari'),
        (window as any).api.getDbData('TANIM_Personel'),
        (window as any).api.getDbData('TANIM_Kasalar')
      ]);

      // 🛡️ MERKEZİ KAYIT KONTROLÜ (Sarsılmaz Nizam)
      const checkRes = await (window as any).api.executeRaw("SELECT COUNT(*) as count FROM DATA_Dagitim_Kayitlar WHERE deleted_at IS NULL");
      const hasFis = checkRes.success && checkRes.data?.[0]?.count > 0;

      setChecks({
        citizens: results[0].success && results[0].data?.length > 0,
        properties: results[1].success && results[1].data?.length > 0,
        pricing: results[2].success && results[2].data?.length > 0,
        receiptBooks: results[3].success && results[3].data?.length > 0,
        personnel: results[4].success && results[4].data?.length > 0,
        kasalar: results[5].success && results[5].data?.length > 0,
        fisler: hasFis
      });
    } catch (err) {
      console.error("Resmi rehber kontrol hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const preSteps = [
    {
      id: 'citizens',
      title: 'Mükellef Kayıtları',
      desc: checks.citizens ? 'Vatandaş kayıtları hazır.' : 'Sistemde henüz kayıtlı vatandaş bulunmamaktadır!',
      status: checks.citizens,
      action: () => addTab({ type: 'tableView', table: 'DATA_Vatandas', title: 'Vatandaş Yönetimi' }),
      icon: Users
    },
    {
      id: 'excel_import',
      title: 'Toplu Veri Aktarımı (Excel)',
      desc: 'Mevcut mükellef listelerinizi hızlı bir şekilde sisteme kaydedin.',
      status: true,
      action: () => addTab({ id: 'excel-import', title: 'Excel Veri Aktarımı', type: 'excelImport', mappingFile: 'excel_advanced_mapping.json' }),
      icon: FileText
    },
    {
      id: 'properties',
      title: 'Taşınmaz Veri Tabanı',
      desc: checks.properties ? 'Araziler ve parsel bilgileri sisteme işlenmiş.' : 'Sulanacak taşınmazlar (Ada/Parsel) sisteme henüz işlenmemiş!',
      status: checks.properties,
      action: () => addTab({ type: 'tableView', table: 'DATA_Tapu_Verisi', title: 'Taşınmaz Kayıtları' }),
      icon: MapPin
    },
    {
      id: 'kasalar',
      title: 'Vezne ve Kasa Tanımları',
      desc: checks.kasalar ? 'Ödemelerin toplanacağı kasalar hazır.' : 'Henüz tanımlı bir kasa yok! Tahsilat yapılamaz.',
      status: checks.kasalar,
      action: () => addTab({ id: 'accounting-kasa', type: 'accounting', title: 'Kasa Yönetimi', initialSubTab: 'kasa' }),
      icon: Wallet
    },
    {
      id: 'receiptBooks',
      title: 'Makbuz Defteri Tescili',
      desc: checks.receiptBooks ? 'Resmi makbuz serileri tescil edildi.' : 'Makbuz defteri olmadan sistem fiş kesmeye izin vermez!',
      status: checks.receiptBooks,
      action: () => addTab({ id: 'accounting-makbuz', type: 'accounting', title: 'Makbuz Defterleri', initialSubTab: 'makbuz' }),
      icon: BookOpen
    }
  ];

  const postSteps = [
    {
      id: 'fisler',
      title: 'Tahsilat ve Mutabakat',
      desc: checks.fisler ? 'Saha kayıtları sisteme girilmiş. Mutabakat bekliyor.' : 'Henüz bekleyen bir tahsilat hareketi yok.',
      status: checks.fisler,
      action: () => addTab({ id: 'accounting-fisler', type: 'accounting', title: 'Muhasebe Fişleri', initialSubTab: 'fisler' }),
      icon: History
    },
    {
      id: 'gunsonu',
      title: 'Gün Sonu Kapanış Protokolü',
      desc: 'Her günün sonunda kasalar işlenmeli ve virmanlar yapılmalıdır.',
      status: true,
      action: () => addTab({ id: 'accounting-gunsonu', type: 'accounting', title: 'Gün Sonu Kapanışı', initialSubTab: 'gunsonu' }),
      icon: Clock
    },
    {
      id: 'reports',
      title: 'Dönemsel Tahakkuk Raporları',
      desc: 'Tüm sezonun mali özetini ve borç listelerini oluşturun.',
      status: true,
      action: () => addTab({ id: 'reports', title: 'Rapor Merkezi', type: 'reports' }),
      icon: TrendingUp
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
      <div className="px-10 py-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20">
               <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 dark:text-white leading-none">
                SULAMA SEZONU HAZIRLIK REHBERİ
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">İdari ve Mali Operasyonel Yol Haritası</p>
            </div>
          </div>
          <button 
            title="Verileri Yenile"
            onClick={runChecks} 
            disabled={isLoading}
            className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-primary-500 hover:rotate-180 transition-all shadow-sm"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 🛡️ TAB SEÇİCİ */}
        <div className="flex items-center gap-2 mt-8 p-1 bg-slate-200/50 dark:bg-white/5 rounded-[20px]">
           <button 
             onClick={() => setActiveTab('pre')}
             className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'pre' ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
           >
              Dağıtım Öncesi
           </button>
           <button 
             onClick={() => setActiveTab('post')}
             className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'post' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
           >
              Dağıtım Sonrası
           </button>
        </div>
      </div>

      <div className="p-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {(activeTab === 'pre' ? preSteps : postSteps).map((step) => (
              <div 
                key={step.id}
                onClick={step.action}
                className="group relative flex items-start gap-6 p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[32px] cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all"
              >
                <div className={`p-4 rounded-2xl ${step.status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} group-hover:scale-110 transition-transform`}>
                   <step.icon size={28} />
                </div>
                <div className="flex-1 space-y-1">
                   <div className="flex items-center justify-between">
                      <h3 className="font-black italic uppercase text-sm tracking-tight text-slate-800 dark:text-white">{step.title}</h3>
                      {step.status ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-rose-500" />}
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight group-hover:text-slate-500">{step.desc}</p>
                   <div className="pt-2 flex items-center gap-2 text-primary-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                      Süreci Başlat <ArrowRight size={12} />
                   </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-10 py-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resmi İdari Denetim Aktif</span>
         </div>
         <p className="text-[10px] font-bold text-slate-500">Kurum Başkanlığı © 2026</p>
      </div>
    </div>
  );
};
