import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Printer, Download, Filter, Calendar,
  Droplets, Users, TrendingUp, FileText, Search,
  ChevronDown, RefreshCcw, MapPin, Clock, FileSpreadsheet,
  BookOpen, Briefcase, Database, ShieldCheck, AlertCircle,
  Table as TableIcon, Info, LayoutGrid
} from 'lucide-react';
import { ElectronService } from '../../services/ElectronService';

// ─── TANIMLAR ─────────────────────────────────────────────────────────────
type ReportType = 'sulama_ozet' | 'kisi_listesi' | 'tasinmaz_listesi' | 'mevki_listesi' | 'personel_listesi' | 'mali_tahsilat' | 'veritabani_explorer';

const REPORT_DEFS: { id: ReportType; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'sulama_ozet', label: 'Sulama Hizmet Özeti', desc: 'Dönemsel sulama saati ve mali yükümlülük raporu', icon: Droplets, color: 'bg-primary-500' },
  { id: 'mali_tahsilat', label: 'Mali Tahsilat Analizi', desc: 'Vatandaş bazlı tüm ödeme ve borç dökümü', icon: TrendingUp, color: 'bg-emerald-500' },
  { id: 'kisi_listesi', label: 'Mükellef Arşivi', desc: 'Sistemde kayıtlı tüm vatandaş ve tüzel kişilikler', icon: Users, color: 'bg-blue-500' },
  { id: 'tasinmaz_listesi', label: 'Taşınmaz ve Tapu Kütüğü', desc: 'Arazi envanteri ve mülkiyet dağılımı', icon: BookOpen, color: 'bg-blue-500' },
  { id: 'mevki_listesi', label: 'Bölge ve Mevki Tanımları', desc: 'İdari sınır ve sulama bölgesi hiyerarşisi', icon: MapPin, color: 'bg-indigo-500' },
  { id: 'personel_listesi', label: 'İdari Personel ve Meravlar', desc: 'Görevli listesi ve yetki tanımları', icon: Briefcase, color: 'bg-violet-500' },
  { id: 'veritabani_explorer', label: 'Evrensel Veri Tarayıcı', desc: 'Veritabanı kayıtlarının ham ve tam listesi', icon: Database, color: 'bg-slate-700' },
];

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);
const fmtSaat = (dakika: number) => {
  if (isNaN(dakika)) return '0 saat';
  const s = Math.floor(dakika / 60);
  const d = Math.round(dakika % 60);
  return d > 0 ? `${s}s ${d}d` : `${s} saat`;
};

const PRINT_STYLE = `
@page { size: A4 landscape; margin: 10mm; }
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; top: 0; left: 0; width: 100%; font-size: 8pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .no-print { display: none !important; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 0.5pt solid #ccc; padding: 4pt; }
  .bg-slate-800 { background-color: #333 !important; color: white !important; -webkit-print-color-adjust: exact; }
}
`;

const PrintHeader: React.FC<{ title: string; filters: string; date: string }> = ({ title, filters, date }) => (
  <div className="print-header mb-6">
    <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-2">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">T.C. KURUM KURUM BAŞKANLIĞI — RESMİ VERİ ANALİZ MERKEZİ</p>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 mt-0.5">{title}</h1>
        {filters && <p className="text-[10px] text-slate-500 mt-1 font-bold italic uppercase">{filters}</p>}
      </div>
      <div className="text-right">
        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">RAPOR OLUŞTURMA TARİHİ</p>
        <p className="text-[11px] font-black text-slate-700">{date}</p>
      </div>
    </div>
  </div>
);

export const ReportsScreen: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('sulama_ozet');
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<{ key: string, label: string, isNum?: boolean }[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Universal Explorer Ayarları
  const [explorerTable, setExplorerTable] = useState<string>('DATA_Vatandas');
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  // Filtreler
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMahalle, setFilterMahalle] = useState('');
  const [mahalleler, setMahalleler] = useState<string[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setRows([]);
    setColumns([]);
    try {
      if (availableTables.length === 0) {
        const tableRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%'");
        if (tableRes.success) setAvailableTables(tableRes.data.map((t: any) => t.name).sort());
      }

      if (activeReport === 'sulama_ozet') {
        const mahRes = await ElectronService.getRecords('DATA_Dagitim_Bolgeleri');
        if (mahRes.success) {
          // Konum tablosundan isimleri çekelim
          const locRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Konumlar');
          if (locRes.success) {
             const locMap = new Map(locRes.data.map((l: any) => [l.id, l.Ad]));
             setMahalleler(mahRes.data.map((m: any) => locMap.get(m.Mahalle_id) || m.Mahalle_id));
          }
        }

        const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
          SELECT 
            v.Ad as ad, 
            v.Soyad as soyad, 
            v.TCKN as tckn, 
            loc.Ad as mahalle,
            SUM(f.Kullanim_Saati * 60) as sure_dakika, 
            SUM(f.Toplam_Tutar) as tutar
          FROM DATA_Dagitim_Kayitlar f
          LEFT JOIN DATA_Vatandas v ON f.Vatandas_Id = v.id
          LEFT JOIN DATA_Dagitim_Bolgeleri b ON f.Mahalle_id = b.Mahalle_id
          LEFT JOIN TANIM_Konumlar loc ON b.Mahalle_id = loc.id
          LEFT JOIN DATA_Dagitim_Donemleri d ON f.Donem_id = d.id
          WHERE f.deleted_at IS NULL 
          AND (d.Baslangic_Yili = ? OR ? = '')
          GROUP BY v.TCKN, b.Mahalle_id
        `, [filterYear, filterYear]);

        let sorted: any[] = [];
        if (res.success && res.data) {
          sorted = res.data
            .filter((r: any) => !filterMahalle || r.mahalle === filterMahalle)
            .sort((a: any, b: any) => b.sure_dakika - a.sure_dakika)
            .map((r: any, i: number) => ({
              ...r,
              rank: i + 1,
              sure_saat: fmtSaat(r.sure_dakika || 0),
              tTutar: fmt(r.tutar || 0)
            }));
        }
        
        setColumns([
          { key: 'rank', label: '#' }, { key: 'ad', label: 'AD' }, { key: 'soyad', label: 'SOYAD' },
          { key: 'tckn', label: 'TCKN' }, { key: 'mahalle', label: 'BÖLGE' },
          { key: 'sure_saat', label: 'TOP. SÜRE', isNum: true }, { key: 'tTutar', label: 'TAHAKKUK', isNum: true },
        ]);
        setRows(sorted);
        setSummary({
          toplamKayit: sorted.length,
          toplamDakika: sorted.reduce((s: number, r: any) => s + (r.sure_dakika || 0), 0),
          toplamTutar: sorted.reduce((s: number, r: any) => s + (r.tutar || 0), 0)
        });
      }

      else if (activeReport === 'veritabani_explorer') {
        const res = await ElectronService.getRecords(explorerTable);
        if (res.success && res.data.length > 0) {
          const first = res.data[0];
          const keys = Object.keys(first).filter(k => !['id', 'guid', 'deleted_at', 'updated_at', 'created_at', 'metadata_json', 'Detay_JSON'].includes(k.toLowerCase()));
          
          setColumns(keys.map(k => ({ key: k, label: k.replace(/_/g, ' ').toUpperCase() })));
          setRows(res.data.map((r: any, i: number) => ({ ...r, rank: i + 1 })));
          setColumns(prev => [{ key: 'rank', label: '#' }, ...prev]);
          setSummary({ toplamKayit: res.data.length });
        }
      }

      else if (activeReport === 'mali_tahsilat') {
        const sql = `
          SELECT 
            v.Ad as ad, v.Soyad as soyad, v.TCKN as tckn,
            COUNT(t.id) as islem_sayisi,
            SUM(t.Miktar) as toplam_borc,
            SUM(CASE WHEN t.Durum = 'Ödendi' THEN t.Miktar ELSE 0 END) as odenen,
            SUM(CASE WHEN t.Durum != 'Ödendi' THEN t.Miktar ELSE 0 END) as bakiye
          FROM MUHASEBE_Tahakkuk t
          LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
          WHERE t.deleted_at IS NULL
          GROUP BY v.TCKN
          ORDER BY bakiye DESC
        `;
        const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql);
        if (res.success) {
          const data = (res.data || []).map((r: any, i: number) => ({
            ...r,
            rank: i + 1,
            tBorc: fmt(r.toplam_borc || 0),
            tOdenen: fmt(r.odenen || 0),
            tBakiye: fmt(r.bakiye || 0)
          }));
          setColumns([
            { key: 'rank', label: '#' }, { key: 'ad', label: 'AD' }, { key: 'soyad', label: 'SOYAD' },
            { key: 'tckn', label: 'TCKN' }, { key: 'islem_sayisi', label: 'İŞLEM' },
            { key: 'tBorc', label: 'TOP. TAHAKKUK', isNum: true },
            { key: 'tOdenen', label: 'ÖDENEN', isNum: true },
            { key: 'tBakiye', label: 'BAKİYE', isNum: true }
          ]);
          setRows(data);
          setSummary({
            toplamKayit: data.length,
            toplamBakiye: data.reduce((s: number, r: any) => s + (r.bakiye || 0), 0)
          });
        }
      }

      else {
        const tableMap: Record<string, string> = {
          'kisi_listesi': 'DATA_Vatandas',
          'tasinmaz_listesi': 'DATA_Tapu_Verisi',
          'mevki_listesi': 'DATA_Tasinmaz_Mevkileri',
          'personel_listesi': 'TANIM_Personel'
        };
        const res = await ElectronService.getRecords(tableMap[activeReport]);
        if (res.success) {
          const data = res.data.map((r: any, i: number) => ({ ...r, rank: i + 1 }));
          let cols: any[] = [{ key: 'rank', label: '#' }];
          if (activeReport === 'kisi_listesi') cols.push({ key: 'Ad', label: 'AD' }, { key: 'Soyad', label: 'SOYAD' }, { key: 'TCKN', label: 'TCKN' }, { key: 'Telefon', label: 'TELEFON' });
          if (activeReport === 'tasinmaz_listesi') cols.push({ key: 'Ada', label: 'ADA' }, { key: 'Parsel', label: 'PARSEL' }, { key: 'Alan_m2', label: 'ALAN (M2)', isNum: true });
          if (activeReport === 'mevki_listesi') cols.push({ key: 'Mevki_Adi', label: 'MEVKİ ADI' }, { key: 'Mahalle_Koy', label: 'MAHALLE/KÖY' });
          if (activeReport === 'personel_listesi') cols.push({ key: 'Ad_Soyad', label: 'PERSONEL ADI' }, { key: 'Unvan', label: 'GÖREV' });
          
          setColumns(cols);
          setRows(data);
          setSummary({ toplamKayit: data.length });
        }
      }

    } catch (e) {
      console.error("Rapor Yükleme Hatası:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeReport, filterYear, filterMahalle, explorerTable, availableTables.length]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const filteredRows = rows.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLocaleLowerCase('tr-TR');
    return Object.values(r).some(v => String(v).toLocaleLowerCase('tr-TR').includes(term));
  });

  const handlePrint = () => {
    const style = document.createElement('style');
    style.textContent = PRINT_STYLE;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  const handleExportExcel = async () => {
    if (filteredRows.length === 0) return;
    try {
      const exportData = filteredRows.map(r => {
        const rowData: any = {};
        columns.forEach(c => { rowData[c.label] = r[c.key]; });
        return rowData;
      });
      const res = await (window as any).api.exportExcel({
        table: activeReport,
        data: exportData,
        fileName: `Kurum_Baskanligi_Rapor_${activeReport}_${new Date().getTime()}.xlsx`
      });
      if (res.success) ElectronService.showAlert({ message: 'Rapor başarıyla Excel formatına tahvil edildi.', type: 'success' });
    } catch (err) {
      console.error('Excel export error:', err);
    }
  };

  const reportDef = REPORT_DEFS.find(r => r.id === activeReport)!;
  const printDate = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans">
      <style>{PRINT_STYLE}</style>

      <div className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className={`p-2.5 rounded-xl ${reportDef.color} text-white shadow-lg`}>
              <reportDef.icon size={20} />
           </div>
           <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 leading-none">RESMİ VERİ ANALİZ MERKEZİ</h1>
              <div className="flex items-center gap-2 mt-1">
                 <ShieldCheck size={10} className="text-primary-500" />
                 <p className="text-[0.6rem] text-slate-400 font-black uppercase tracking-[0.2em]">{reportDef.label} — KURUMSAL DENETİM</p>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative w-56 group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input type="text" placeholder="TABLODA ARA..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[0.6rem] font-black uppercase outline-none focus:border-primary-500 w-full transition-all" />
          </div>
          <button title="Verileri Yenile" onClick={loadReport} className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all shadow-sm"><RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /></button>
          <div className="w-px h-6 bg-slate-100 dark:bg-white/5 mx-1" />
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-black text-[0.6rem] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-600/20"><FileSpreadsheet size={14} /> EXCEL AKTAR</button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-black text-[0.6rem] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"><Printer size={14} /> RESMİ ÇIKTI</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="no-print w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col overflow-y-auto p-5 space-y-6">
          <div>
            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><LayoutGrid size={12} /> ANALİZ KATALOGLARI</p>
            <div className="space-y-1.5">
              {REPORT_DEFS.map(r => (
                <button key={r.id} onClick={() => { setActiveReport(r.id); setSearchTerm(''); }}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-2xl text-left transition-all group ${activeReport === r.id ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <div className={`mt-0.5 p-1.5 rounded-lg ${activeReport === r.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-primary-500/10'}`}><r.icon size={14} className={activeReport === r.id ? 'text-white' : 'text-slate-500'} /></div>
                  <div><span className="text-[0.65rem] font-black uppercase tracking-tight block leading-tight">{r.label}</span><span className={`text-[0.55rem] font-bold uppercase block mt-1 leading-relaxed opacity-60 ${activeReport === r.id ? 'text-white' : 'text-slate-400'}`}>{r.desc}</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 dark:border-white/5 space-y-5">
            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Filter size={12} /> PARAMETRELER</p>
            {activeReport === 'veritabani_explorer' ? (
               <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[0.55rem] font-black text-slate-400 uppercase ml-1">TABLO SEÇİMİ</label>
                    <div className="relative">
                       <select title="Tablo Seçiniz" value={explorerTable} onChange={e => setExplorerTable(e.target.value)} className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-[0.65rem] font-black uppercase outline-none transition-all cursor-pointer">
                         {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                       <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                  </div>
               </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[0.55rem] font-black text-slate-400 uppercase ml-1">MALİ SEZON</label>
                  <div className="relative">
                      <select title="Sezon Seçiniz" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-[0.65rem] font-black uppercase outline-none transition-all">
                        <option value="">TÜM SEZONLAR</option>
                        {years.map(y => <option key={y} value={y}>{y} SEZONU</option>)}
                      </select>
                     <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
                {activeReport === 'sulama_ozet' && (
                  <div className="space-y-1.5">
                    <label className="text-[0.55rem] font-black text-slate-400 uppercase ml-1">MAHALLE / BÖLGE</label>
                    <div className="relative">
                       <select title="Mahalle Seçiniz" value={filterMahalle} onChange={e => setFilterMahalle(e.target.value)} className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-[0.65rem] font-black uppercase outline-none transition-all">
                         <option value="">TÜM BÖLGELER</option>
                         {mahalleler.map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                       <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#020617] p-8 custom-scrollbar">
          <div id="print-area" className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="hidden print:block"><PrintHeader title={reportDef.label} filters={`${filterYear} SEZONU · ${filterMahalle || 'TÜM BÖLGELER'}`} date={printDate} /></div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary-500/20" /><p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Veriler Çekiliyor...</p></div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-300 space-y-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5"><div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full"><Database size={48} className="opacity-20" /></div><div className="text-center space-y-2"><p className="text-lg font-black text-slate-400 uppercase italic">Kayıt Saptanmadı</p><p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Seçilen kriterlere uygun resmi veri bulunamadı.</p></div></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8 no-print">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 group hover:scale-105 transition-all"><div className="flex items-center justify-between mb-4"><div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 group-hover:rotate-12 transition-transform"><Database size={20} /></div><span className="text-[0.55rem] font-black text-primary-500 italic uppercase">TESCİLLİ</span></div><p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-1">TOPLAM KAYIT</p><h3 className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter italic">{filteredRows.length} <span className="text-xs opacity-30">ADET</span></h3></div>
                   {activeReport === 'sulama_ozet' && (
                     <>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 group hover:scale-105 transition-all"><div className="flex items-center justify-between mb-4"><div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform"><Clock size={20} /></div><span className="text-[0.55rem] font-black text-blue-500 italic uppercase">KÜMÜLATİF</span></div><p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-1">TOPLAM SÜRE</p><h3 className="text-3xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter italic">{fmtSaat(summary.toplamDakika || 0)}</h3></div>
                        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/20 group hover:scale-105 transition-all relative overflow-hidden text-white"><TrendingUp className="absolute -right-6 -bottom-6 text-white/10" size={150} /><div className="flex items-center justify-between mb-4 relative z-10"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><FileText size={20} /></div><span className="text-[0.55rem] font-black text-white/60 italic uppercase tracking-widest">MALİ TAHAKKUK</span></div><p className="text-[0.55rem] font-black text-white/60 uppercase tracking-[0.3em] mb-1 relative z-10">GENEL TOPLAM</p><h3 className="text-4xl font-black tabular-nums tracking-tighter italic relative z-10">{fmt(summary.toplamTutar || 0)}</h3></div>
                     </>
                   )}
                   {activeReport === 'mali_tahsilat' && (
                      <div className="md:col-span-3 bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[2rem] shadow-xl shadow-rose-500/20 group hover:scale-105 transition-all relative overflow-hidden text-white"><AlertCircle className="absolute -right-6 -bottom-6 text-white/10" size={150} /><p className="text-[0.55rem] font-black text-white/60 uppercase tracking-[0.3em] mb-1 relative z-10">SİSTEMDEKİ TOPLAM BEKLEYEN BAKİYE</p><h3 className="text-5xl font-black tabular-nums tracking-tighter italic relative z-10">{fmt(summary.toplamBakiye || 0)}</h3></div>
                   )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 print:rounded-none">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="bg-slate-900 text-white">{columns.map(c => (<th key={c.key} className={`px-6 py-5 text-[0.55rem] font-black uppercase tracking-widest border-r border-white/5 whitespace-nowrap ${c.isNum ? 'text-right' : ''}`}>{c.label}</th>))}</tr></thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredRows.map((row, i) => (
                          <tr key={i} className={`group hover:bg-primary-500/5 transition-all duration-300 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50/30 dark:bg-white/5'}`}>
                            {columns.map(c => (
                              <td key={c.key} className={`px-6 py-4 text-[0.65rem] border-r border-slate-100 dark:border-white/5 whitespace-nowrap ${c.key === 'rank' ? 'text-slate-300 font-black w-10 text-center italic' : (c.key === 'ad' || c.key === 'soyad' || c.key === 'Ad' || c.key === 'Soyad') ? 'font-black text-slate-800 dark:text-white uppercase text-[0.7rem] italic' : c.isNum ? 'font-black text-primary-600 dark:text-primary-400 text-right tabular-nums text-[0.7rem]' : 'font-bold text-slate-500 dark:text-slate-400 uppercase'}`}>{row[c.key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-center justify-between no-print shadow-lg"><div className="flex items-center gap-4"><div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400"><Info size={16} /></div><div><p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">VERİ DOĞRULAMA</p><p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-tight italic">Bu rapor sarsılmaz veritabanı üzerinden anlık üretilmiştir.</p></div></div><div className="text-right"><p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest">SON GÜNCELLEME</p><p className="text-[0.65rem] font-black text-slate-800 dark:text-white italic">{printDate}</p></div></div>
                <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t-2 border-slate-800 text-[10px] text-slate-400 font-black uppercase"><span>KURUM BAŞKANLIĞI — ARAZİ SU TAKİP SİSTEMİ</span><span>RESMİ VERİ KAYITLARI — SAYFA: 1</span></div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
