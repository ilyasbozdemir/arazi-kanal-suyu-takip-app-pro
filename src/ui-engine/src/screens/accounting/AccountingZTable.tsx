import React, { useState, useMemo } from 'react';
import { Wallet, User, ArrowUpRight, ArrowDownRight, Scale, ChevronDown, ChevronRight, Calendar } from 'lucide-react';

interface ZTableProps {
  reports: any[];
}

export const AccountingZTable: React.FC<ZTableProps> = ({ reports }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  
  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

  const months = [
    { v: 1, n: 'OCAK' }, { v: 2, n: 'ŞUBAT' }, { v: 3, n: 'MART' }, { v: 4, n: 'NİSAN' },
    { v: 5, n: 'MAYIS' }, { v: 6, n: 'HAZİRAN' }, { v: 7, n: 'TEMMUZ' }, { v: 8, n: 'AĞUSTOS' },
    { v: 9, n: 'EYLÜL' }, { v: 10, n: 'EKİM' }, { v: 11, n: 'KASIM' }, { v: 12, n: 'ARALIK' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const toggleDate = (date: string) => {
    const newSet = new Set(expandedDates);
    if (newSet.has(date)) newSet.delete(date);
    else newSet.add(date);
    setExpandedDates(newSet);
  };

  const groupedReports = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    // Filtreleme Uygula
    const filteredReports = reports.filter(r => {
       const d = new Date(r.Tarih);
       const mMatch = filterMonth === 0 || (d.getMonth() + 1) === filterMonth;
       const yMatch = filterYear === 0 || d.getFullYear() === filterYear;
       return mMatch && yMatch;
    });

    // Tarihe göre tersten sırala (En yeni gün en üstte)
    const sortedReports = filteredReports.sort((a, b) => new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime());
    
    sortedReports.forEach(r => {
      const d = new Date(r.Tarih);
      const dateKey = d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(r);
    });
    return groups;
  }, [reports, filterMonth, filterYear]);

  // İlk yüklemede en güncel günü açık tut (opsiyonel)
  React.useEffect(() => {
    const dates = Object.keys(groupedReports);
    if (dates.length > 0 && expandedDates.size === 0) {
      setExpandedDates(new Set([dates[0]]));
    }
  }, [groupedReports]);

  return (
    <div className="space-y-6 p-6 h-full overflow-y-auto custom-scrollbar">
      {/* 🛡️ FİLTRELEME PANELİ (Mali Denetim Standardı) */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-900 dark:bg-white p-8 rounded-[32px] shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center text-white dark:text-slate-900">
              <Scale size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-white dark:text-slate-900 uppercase tracking-tighter">Z-RAPORU ARŞİVİ</h2>
              <p className="text-[10px] font-bold text-white/50 dark:text-slate-500 uppercase tracking-widest">Resmi Gün Sonu Kayıtları</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <select 
             title="Ay Filtresi"
             value={filterMonth} 
             onChange={e => setFilterMonth(parseInt(e.target.value))}
             className="px-6 py-3 bg-white/10 dark:bg-black/5 text-white dark:text-slate-900 border-none rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-2 ring-white/20"
           >
              <option value={0} className="text-slate-900">TÜM AYLAR</option>
              {months.map(m => <option key={m.v} value={m.v} className="text-slate-900">{m.n}</option>)}
           </select>
           <select 
             title="Yıl Filtresi"
             value={filterYear} 
             onChange={e => setFilterYear(parseInt(e.target.value))}
             className="px-6 py-3 bg-white/10 dark:bg-black/5 text-white dark:text-slate-900 border-none rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-2 ring-white/20"
           >
              {years.map(y => <option key={y} value={y} className="text-slate-900">{y}</option>)}
           </select>
        </div>
      </div>

      {Object.keys(groupedReports).length === 0 ? (
        <div className="p-20 text-center bg-slate-50 dark:bg-white/5 rounded-[48px] border-4 border-dashed border-slate-200 dark:border-white/10">
          <div className="flex flex-col items-center gap-4 opacity-30">
            <Calendar size={64} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Seçili Dönemde Rapor Bulunamadı</span>
          </div>
        </div>
      ) : (
        <>
          {Object.entries(groupedReports).map(([date, dayReports]: [string, any[]]) => (
            <div key={date} className="bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[24px] overflow-hidden shadow-sm">
              {/* Header - Günlük Özet */}
              <button 
                onClick={() => toggleDate(date)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{date}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dayReports.length} Rapor Kaydı</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GÜNLÜK TOPLAM CİRO</span>
                    <span className="text-base font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {fmt(dayReports.reduce((sum: number, r: any) => sum + (r.Toplam_Ciro || 0), 0))}
                    </span>
                  </div>
                  {expandedDates.has(date) ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                </div>
              </button>

              {/* Table Content */}
              {expandedDates.has(date) && (
                <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-black/20">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Saat & Rapor</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kasa & Veznedar</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Sistem / Fiziki</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Fark</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Ciro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {dayReports.map((r: any) => (
                        <tr key={r.id} className="hover:bg-white dark:hover:bg-white/5 transition-all group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
                                 {new Date(r.Tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-0.5">{r.Rapor_No}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase flex items-center gap-1.5">
                                 <Wallet size={10} className="text-primary-500" />
                                 {r.Kasa_Adi || 'Bilinmeyen Kasa'}
                               </span>
                               <span className="text-[9px] font-medium text-slate-400 uppercase italic mt-0.5 flex items-center gap-1.5">
                                 <User size={10} />
                                 {r.Veznedar_Ad} {r.Veznedar_Soyad}
                               </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tabular-nums">{fmt((r.Sistem_Nakit || 0) + (r.Sistem_Pos || 0))}</span>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt((r.Fiziki_Nakit || 0) + (r.Fiziki_Pos || 0))}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black tabular-nums border ${
                              ((r.Fark_Nakit || 0) + (r.Fark_Pos || 0)) === 0 
                              ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' 
                              : ((r.Fark_Nakit || 0) + (r.Fark_Pos || 0)) > 0 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}>
                              {fmt((r.Fark_Nakit || 0) + (r.Fark_Pos || 0))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white tracking-tighter">
                              {fmt(r.Toplam_Ciro || 0)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
