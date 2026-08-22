import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  MapPin, 
  Droplets, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { ElectronService } from '../../services/ElectronService';

export const AnnualWaterReportScreen: React.FC = () => {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [mahalleler, setMahalleler] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Sarsılmaz Nizam: Artık her mahalle için ayrı tablo gezmeye gerek yok. 
      // Tek bir JOIN sorgusu ile seçili yıla ait tüm verileri topluyoruz.
      const sql = `
        SELECT 
          b.Mahalle_id as mahalleId,
          loc.Ad as mahalleName,
          SUM(COALESCE(k.Kullanim_Saati * 60, 0)) as totalMinutes,
          SUM(COALESCE(k.Toplam_Tutar, 0)) as totalAmount,
          COUNT(k.id) as count
        FROM DATA_Dagitim_Donemleri d
        JOIN DATA_Dagitim_Bolgeleri b ON d.Mahalle_id = b.Mahalle_id
        JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
        LEFT JOIN DATA_Dagitim_Kayitlar k ON d.id = k.Donem_id AND k.deleted_at IS NULL
        WHERE d.Baslangic_Yili = ? AND d.deleted_at IS NULL
        GROUP BY b.Mahalle_id, loc.Ad
      `;
      
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql, [selectedYear]);
      
      // Yılları çekmek için dönemleri alalım
      const donemRes = await ElectronService.getRecords('DATA_Dagitim_Donemleri');
      if (donemRes.success) setLedgers(donemRes.data || []);

      if (res.success) {
        setReportData(res.data || []);
      }
    } catch (err) {
      console.error("[ANNUAL_REPORT_LOAD_ERROR]", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const totals = useMemo(() => {
    return reportData.reduce((acc: any, curr: any) => ({
      minutes: acc.minutes + curr.totalMinutes,
      amount: acc.amount + curr.totalAmount,
      count: acc.count + curr.count
    }), { minutes: 0, amount: 0, count: 0 });
  }, [reportData]);

  const years = useMemo(() => {
    const y = Array.from(new Set(ledgers.map(l => l.Baslangic_Yili))).sort((a: any, b: any) => b - a);
    return y.length > 0 ? y : [new Date().getFullYear()];
  }, [ledgers]);

  return (
    <div className="p-8 h-full flex flex-col space-y-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white flex items-center gap-4">
            <FileText className="text-primary-500" size={40} />
            Yıllık Su Tahakkuk Raporu
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            {selectedYear} SEZONU KURUMSAL TAHAKKUK VE ANALİZ İSTATİSTİKLERİ
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10">
              <Calendar size={18} className="text-slate-400" />
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                title="Rapor Yılı Seçin"
                className="bg-transparent border-none outline-none font-black text-xs text-slate-700 dark:text-white uppercase"
              >
                {years.map(y => <option key={y} value={y}>{y} SEZONU</option>)}
              </select>
           </div>
           <button title="Raporu İndir (PDF/Excel)" className="p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-xl">
              <Download size={20} />
           </button>
        </div>
      </header>

      {/* 🚀 Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM TAHAKKUK</p>
              <p className="text-3xl font-black italic dark:text-white mt-1">{totals.amount.toLocaleString('tr-TR')} ₺</p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Droplets size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM SÜRE</p>
              <p className="text-3xl font-black italic dark:text-white mt-1">{Math.floor(totals.minutes / 60)} SAAT {totals.minutes % 60} DK</p>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
           <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
              <BarChart3 size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM İŞLEM</p>
              <p className="text-3xl font-black italic dark:text-white mt-1">{totals.count} KAYIT</p>
           </div>
        </div>
      </div>

      {/* 📊 Mahalle Bazlı Detay Listesi */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="px-8 py-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <h3 className="font-black italic uppercase text-xs tracking-widest text-slate-500">Mahalle Bazlı Dağılım</h3>
           <Filter size={16} className="text-slate-300" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
              <th className="px-8 py-4 text-left">Mahalle Adı</th>
              <th className="px-8 py-4 text-center">Kayıt Sayısı</th>
              <th className="px-8 py-4 text-center">Toplam Süre</th>
              <th className="px-8 py-4 text-right">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        <MapPin size={16} />
                      </div>
                      <span className="font-black italic uppercase text-sm dark:text-white">{item.mahalleName}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-center font-bold text-slate-600 dark:text-slate-400">{item.count}</td>
                <td className="px-8 py-6 text-center font-bold text-slate-600 dark:text-slate-400">
                  {Math.floor(item.totalMinutes / 60)}s {item.totalMinutes % 60}dk
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="font-black italic text-emerald-600 dark:text-emerald-400">{item.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm">Seçili yıl için henüz kayıtlı bir defter bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

