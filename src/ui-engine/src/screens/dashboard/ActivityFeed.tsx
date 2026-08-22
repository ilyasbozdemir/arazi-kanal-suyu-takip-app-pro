import React from 'react';
import { 
  Activity, 
  User, 
  MapPin, 
  Droplets, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

// 🛡️ YEREL TARİH FORMATLAYICI: Dış bağımlılık olmadan resmi nizamda tarih gösterimi
const formatTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }).format(date);
  } catch (e) {
    return '--:--';
  }
};

interface RecentActivityProps {
  activity: any[];
  onSeeAll?: () => void;
}

export const ActivityFeed: React.FC<RecentActivityProps> = ({ activity, onSeeAll }) => {
  const getIcon = (action: string) => {
    if (action.includes('HATA')) return <AlertCircle className="text-rose-500" size={16} />;
    if (action.includes('SULAMA')) return <Droplets className="text-cyan-500" size={16} />;
    if (action.includes('VATANDAS')) return <User className="text-blue-500" size={16} />;
    if (action.includes('TAPU')) return <MapPin className="text-blue-500" size={16} />;
    return <Activity className="text-slate-400" size={16} />;
  };

  // 🛡️ AKILLI SINIRLAYICI: Ana ekran vakarını korumak için sadece son 10 kayıt gösterilir
  const displayActivity = (activity || []).slice(0, 10);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] p-8 shadow-sm flex flex-col max-h-[300px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">SİSTEM HAREKETLERİ</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">RESMİ İŞLEM VE KAYIT ÖZETİ</p>
          </div>
        </div>
        <button 
          onClick={onSeeAll}
          className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline transition-all"
        >
          DETAYLI ARŞİV &rsaquo;
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {displayActivity && displayActivity.length > 0 ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {displayActivity.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (item.details) {
                        (window as any).api.showAlert({ 
                          title: item.action || 'Resmi İşlem Detayı', 
                          message: item.details, 
                          type: 'info' 
                        });
                    }
                  }}
                  className="group flex items-center gap-4 p-2.5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-white/5 hover:bg-slate-50 dark:hover:bg-white/2 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                    {getIcon(item.action?.toUpperCase() || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[10px] font-black text-slate-700 dark:text-white uppercase truncate tracking-tight">
                        {item.action || 'İdari Bilgilendirme'}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                        {item.date ? formatTime(item.date) : '--:--'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 opacity-70 italic">
                      {item.details || 'Açıklama kaydı mevcut değildir.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={onSeeAll}
              className="w-full mt-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[24px] text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all active:scale-[0.98] shadow-sm"
            >
              HİYERARŞİK TÜM KAYITLARI GÖRÜNTÜLE
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-4 py-16">
            <Activity size={48} className="animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Henüz bir idari işlem saptanmadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

