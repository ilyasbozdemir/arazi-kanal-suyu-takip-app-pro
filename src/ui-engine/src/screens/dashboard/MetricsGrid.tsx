import {
  Users,
  Map,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Activity,
  WalletMinimal,
  SunMoon,
  ShieldAlert,
  MapPin,
  FileText,
  Layers,
  BookOpen,
  Plus
} from 'lucide-react';
import { AbbreviatedNumber } from '../../components/AbbreviatedNumber';
import { useAppStore } from '../../store/useAppStore';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  trend?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps & { onAdd?: () => void }> = ({ title, value, subtitle, icon: Icon, color, trend, onClick, onAdd }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const suffix = typeof value === 'string' ? value.replace(/[0-9.,-]/g, '').trim() : '';

  return (
    <div
      className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group transition-all`}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div 
          className={`space-y-3 flex-1 transition-all ${onClick ? 'cursor-pointer hover:opacity-70' : ''}`} 
          onClick={onClick}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
               <AbbreviatedNumber value={numericValue} suffix={suffix} label={title} />
            </div>
            {trend && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {trend}
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium text-slate-400 italic">{subtitle}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div 
            onClick={onClick}
            className={`p-4 rounded-xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center transition-transform group-hover:scale-110 ${onClick ? 'cursor-pointer' : ''}`}
          >
            <Icon className={color.replace('bg-', 'text-')} size={24} />
          </div>
          {onAdd && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
              title="Hızlı Ekle"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 ${color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
    </div>
  );
};

interface MetricsGridProps {
  stats: {
    vatandasCount: number;
    tapuCount: number;
    totalArea: number;
    yaylaCount: number;
    usageHours: number;
    totalSuHakki: number;
    overUsageCount: number;
    totalDebt: number;
    totalPaid: number;
    mevkiCount?: number;
    mahalleCount?: number;
    meravCount?: number;
    dailyTahakkuk?: number;
    dailyTahsilat?: number;
    dailyDistributionCount?: number;
    dailyBreakdown?: { Mahalle_Adi: string; count: number }[];
    trend?: string;
  };
  onNavigate: (table: string) => void;
  addTab: (tab: any) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats, onNavigate, addTab }) => {
  const accountingEnabled = useAppStore(state => state.accountingEnabled);

  // GÜVENLİ VERİ ERİŞİMİ
  const safeStats = stats || {
    vatandasCount: 0,
    tapuCount: 0,
    totalArea: 0,
    yaylaCount: 0,
    usageHours: 0,
    totalSuHakki: 0,
    overUsageCount: 0,
    totalDebt: 0,
    totalPaid: 0,
    dailyTahakkuk: 0,
    dailyTahsilat: 0,
    dailyDistributionCount: 0,
    dailyBreakdown: [],
    meravCount: 0,
    trend: "+0.0%"
  };

  const collectionRate = (Number(safeStats.totalDebt) || 0) > 0
    ? (((Number(safeStats.totalPaid) || 0) / Number(safeStats.totalDebt)) * 100).toFixed(1) + '%'
    : '0%';

  // 🛡️ Defter Bazlı Dağılım Metni
  const breakdownText = safeStats.dailyBreakdown && safeStats.dailyBreakdown.length > 0
    ? safeStats.dailyBreakdown.map(b => `${b.Mahalle_Adi}: ${b.count}`).join(' | ')
    : "Bugün deftere işlenen sulama sayısı";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <MetricCard
        title="TOPLAM MÜKELLEF"
        value={Number(safeStats.vatandasCount) || 0}
        subtitle="Sistemde kayıtlı vatandaş"
        icon={Users}
        color="bg-primary-500"
        onClick={() => onNavigate('DATA_Vatandas')}
      />
      <MetricCard
        title="TAPU KAYITLARI"
        value={Number(safeStats.tapuCount) || 0}
        subtitle="Tescilli taşınmaz kaydı"
        icon={BookOpen}
        color="bg-emerald-500"
        onClick={() => onNavigate('DATA_Tapu_Verisi')}
      />
      <MetricCard
        title="MEVKİ VE BÖLGELER"
        value={Number(safeStats.mevkiCount) || 0}
        subtitle="Tanımlı sulama mevkileri"
        icon={MapPin}
        color="bg-blue-500"
        onClick={() => onNavigate('DATA_Tasinmaz_Mevkileri')}
      />
      {accountingEnabled && (
        <MetricCard
          title="TAHSİLAT PERFORMANSI"
          value={collectionRate}
          subtitle="Tahakkuk ve ödeme dengesi"
          icon={WalletMinimal}
          color="bg-violet-500"
          trend={safeStats.trend || "+0.0%"}
          onClick={() => addTab({ id: 'collection-report', title: 'Mali Tahsilat İcmali', type: 'COLLECTION_REPORT' })}
        />
      )}
      <MetricCard
        title="Görevdeki Meravlar"
        value={Number(safeStats.meravCount) || 0}
        subtitle="Aktif görevli merav personeli"
        icon={Users}
        color="bg-amber-500"
        onClick={() => onNavigate('TANIM_Meravlar')}
      />
      {accountingEnabled && (
        <>
          <MetricCard
            title="GÜNLÜK TAHAKKUK"
            value={Number(safeStats.dailyTahakkuk) || 0}
            subtitle="Bugün mühürlenen borç yekünü"
            icon={DollarSign}
            color="bg-rose-500"
            trend="₺"
            onClick={() => addTab({ id: 'collection-report', title: 'Mali Tahsilat İcmali', type: 'COLLECTION_REPORT' })}
          />
          <MetricCard
            title="GÜNLÜK TAHSİLAT"
            value={Number(safeStats.dailyTahsilat) || 0}
            subtitle="Bugün kasaya giren nakit/kart"
            icon={TrendingUp}
            color="bg-emerald-600"
            trend="₺"
            onClick={() => addTab({ id: 'collection-report', title: 'Mali Tahsilat İcmali', type: 'COLLECTION_REPORT' })}
          />
        </>
      )}
      <MetricCard
        title="GÜNLÜK DAĞITIM"
        value={Number(safeStats.dailyDistributionCount) || 0}
        subtitle={breakdownText}
        icon={Activity}
        color="bg-blue-600"
        onClick={() => addTab({ id: 'active-ledgers', type: 'activeLedgers', title: 'Aktif Defterler' })}
      />
      {accountingEnabled && (
        <>
          <MetricCard
            title="TOPLAM TAHAKKUK"
            value={Number(safeStats.totalDebt) || 0}
            subtitle="Cari dönem borç yekünü"
            icon={DollarSign}
            color="bg-blue-500"
            trend="₺"
            onClick={() => addTab({ id: 'collection-report', title: 'Mali Tahsilat İcmali', type: 'COLLECTION_REPORT' })}
          />
          <MetricCard
            title="TOPLAM TAHSİLAT"
            value={Number(safeStats.totalPaid) || 0}
            subtitle="İlga edilen ödeme toplamı"
            icon={CheckCircle2}
            color="bg-indigo-500"
            trend="₺"
            onClick={() => addTab({ id: 'collection-report', title: 'Mali Tahsilat İcmali', type: 'COLLECTION_REPORT' })}
          />
        </>
      )}

      {/* 📊 ANALİTİK MERKEZİ KÖPRÜSÜ */}
      <div 
        onClick={() => addTab({ id: 'analytics', title: 'Analitik Veri Yönetim Merkezi', type: 'analytics' })}
        className="bg-primary-500 dark:bg-primary-600 p-6 rounded-2xl shadow-xl shadow-primary-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-center items-center text-center group border-2 border-white/10"
      >
         <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-3 group-hover:rotate-12 transition-transform">
            <TrendingUp size={28} />
         </div>
         <h4 className="text-white font-black text-sm uppercase tracking-tighter italic">STRATEJİK ANALİZ MERKEZİ</h4>
         <p className="text-primary-100 text-[9px] font-bold uppercase mt-1 opacity-70">VERİYE DAYALI KARAR DESTEK SİSTEMİ</p>
      </div>
    </div>
  );
};

