import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    DollarSign,
    Download,
    Filter,
    TrendingUp,
    Wallet,
    MoreVertical,
    FileText,
    FileSpreadsheet,
    Image as ImageIcon,
    Mail,
    Printer
} from "lucide-react";
import { ElectronService } from "../../services/ElectronService";

export const CollectionReportScreen: React.FC = () => {
    const [tahakkukList, setTahakkukList] = useState<any[]>([]);
    const [tahsilatList, setTahsilatList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dailyStats, setDailyStats] = useState({ acc: 0, coll: 0, count: 0 });
    const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(
        new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([2024, 2025, 2026]);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 🛡️ KURUM AGREGASYON: Tüm LDGR_ tablolarından özet çek
            const ledgerSummary = await ElectronService.getAllLedgersSummary();
            
            // 🛡️ TAHSİLATLARI VATANDAŞ BİLGİLERİYLE ÇEK
            const collRes = await ElectronService.executeRaw(`
                SELECT t.*, v.Sicil_No, v.TCKN as Vatandas_Id, v.Ad || ' ' || v.Soyad as Full_Name
                FROM MUHASEBE_Tahsilat t
                LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
                WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
            `);

            if (ledgerSummary.success) {
                setTahakkukList(ledgerSummary.allRecords || []);
            }
            if (collRes.success && collRes.data) {
                const normalizedColl = collRes.data.map((r: any) => ({
                    ...r,
                    Ad_Soyad: r.Full_Name || r.Ad_Soyad || 'Bilinmeyen',
                    Sicil_No: r.Sicil_No || '---',
                    TCKN: r.Vatandas_Id || '---'
                }));
                setTahsilatList(normalizedColl);
            }

            // 🛡️ GÜNLÜK ÖZET (Sarsılmaz Senkronizasyon)
            const statsRes = await (window as any).api.getStats();
            if (statsRes.success) {
                setDailyStats({
                    acc: statsRes.stats?.dailyTahakkuk || 0,
                    coll: statsRes.stats?.dailyTahsilat || 0,
                    count: statsRes.stats?.dailyDistributionCount || 0
                });
            }

            // 🛡️ DİNAMİK YIL LİSTESİ: Veritabanındaki tüm dönemleri tara
            const yearsRes = await ElectronService.executeRaw(`
                SELECT DISTINCT Baslangic_Yili as year FROM DATA_Dagitim_Donemleri
                UNION
                SELECT DISTINCT Donem_Yili as year FROM MUHASEBE_Tahakkuk
                ORDER BY year DESC
            `);
            if (yearsRes.success && yearsRes.data) {
                const years = yearsRes.data
                    .map((r: any) => parseInt(r.year))
                    .filter((y: number) => !isNaN(y));
                
                // Mevcut yılı garantiye al, diğerlerini veritabanından çek
                const currentYear = new Date().getFullYear();
                const uniqueYears = Array.from(new Set([...years, currentYear])).sort((a, b) => b - a);
                setAvailableYears(uniqueYears);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadAsCSV = () => {
        const headers = ["Tür", "Sicil No", "TC Kimlik No", "Mükellef Ad Soyad", "Tutar", "Tarih", "Açıklama/Dönem"];
        const rows = [
            ...tahakkukList.map(item => ["Tahakkuk", item.Sicil_No || "---", item.TCKN || "---", item.Ad_Soyad, item.Miktar || item.Tutar, item.Tarih, item.Donem || "SULAMA"]),
            ...tahsilatList.map(item => ["Tahsilat", item.Sicil_No || "---", item.TCKN || "---", item.Ad_Soyad, item.Miktar || item.Tutar, item.Tarih, item.Makbuz_No || "MAKBUZ"])
        ];

        let csvContent = "\uFEFF" + headers.join(";") + "\n";
        rows.forEach(row => {
            csvContent += row.join(";") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `G_Kurum_Mali_Icmal_${selectedMonth}_${selectedYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    const getCSVContent = () => {
        const headers = ["Tür", "Sicil No", "TC Kimlik No", "Mükellef Ad Soyad", "Tutar", "Tarih", "Açıklama/Dönem"];
        const rows = [
            ...tahakkukList.map(item => ["Tahakkuk", item.Sicil_No || "---", item.TCKN || "---", item.Ad_Soyad, item.Miktar || item.Tutar, item.Tarih, item.Donem || "SULAMA"]),
            ...tahsilatList.map(item => ["Tahsilat", item.Sicil_No || "---", item.TCKN || "---", item.Ad_Soyad, item.Miktar || item.Tutar, item.Tarih, item.Makbuz_No || "MAKBUZ"])
        ];

        let csvContent = "\uFEFF" + headers.join(";") + "\n";
        rows.forEach(row => {
            csvContent += row.join(";") + "\n";
        });
        return csvContent;
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredStats = useMemo(() => {
        const accFiltered = (tahakkukList || []).filter((item) => {
            if (!item) return false;
            const date = String(item.Tarih || "");
            if (selectedYear === 'ALL') return true;
            
            const yearMatch = date.startsWith(selectedYear.toString());
            const monthMatch = selectedMonth === 'ALL' || 
                             date.includes(`${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`) ||
                             date.includes(`${selectedYear}/${selectedMonth.toString().padStart(2, "0")}`);
            return yearMatch && monthMatch;
        });

        const collFiltered = (tahsilatList || []).filter((item) => {
            if (!item) return false;
            const date = String(item.Tarih || "");
            if (selectedYear === 'ALL') return true;

            const yearMatch = date.startsWith(selectedYear.toString());
            const monthMatch = selectedMonth === 'ALL' || 
                             date.includes(`${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`) ||
                             date.includes(`${selectedYear}/${selectedMonth.toString().padStart(2, "0")}`);
            return yearMatch && monthMatch;
        });

        const totalAcc = accFiltered.reduce(
            (sum, item) => sum + (Number(item.Tutar || item.Miktar) || 0),
            0,
        );
        const totalColl = collFiltered.reduce(
            (sum, item) => sum + (Number(item.Miktar || item.Tutar) || 0),
            0,
        );

        // 🛡️ DÖNEM BAZLI GRUPLAMA (Sarsılmaz Analiz)
        const periodTotals: Record<string, { acc: number, coll: number }> = {};
        
        accFiltered.forEach(item => {
            const donem = item.Donem || "GENEL";
            if (!periodTotals[donem]) periodTotals[donem] = { acc: 0, coll: 0 };
            periodTotals[donem].acc += (Number(item.Tutar || item.Miktar) || 0);
        });

        collFiltered.forEach(item => {
            const donem = item.Donem_Yili || item.Donem || (item.Tarih ? item.Tarih.substring(0, 4) : "GENEL");
            if (!periodTotals[donem]) periodTotals[donem] = { acc: 0, coll: 0 };
            periodTotals[donem].coll += (Number(item.Miktar || item.Tutar) || 0);
        });

        return {
            accCount: accFiltered.length,
            collCount: collFiltered.length,
            totalAcc,
            totalColl,
            periodTotals,
            rate: totalAcc > 0 ? (totalColl / totalAcc * 100).toFixed(1) : "0",
        };
    }, [tahakkukList, tahsilatList, selectedMonth, selectedYear]);

    return (
        <div className="p-8 h-full flex flex-col space-y-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white flex items-center gap-4">
                        <Wallet size={40} />
                        Mali Tahsilat İcmali
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                        KURUMSAL GELİR VE TAHSİLAT ANALİZİ -{" "}
                        {selectedMonth === 'ALL' ? 'TÜM YIL' : selectedMonth}/{selectedYear === 'ALL' ? 'TÜM ZAMANLAR' : selectedYear} DÖNEMİ
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                        <Calendar size={18} className="text-slate-400" />
                        <div className="flex items-center gap-2">
                            {selectedYear !== 'ALL' && (
                                <select
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                                    title="Rapor Ayı Seçin"
                                    className="bg-transparent border-none outline-none font-black text-xs text-slate-700 dark:text-white uppercase"
                                >
                                    <option value="ALL">TÜM YIL (GENEL)</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1)
                                        .map((m) => (
                                            <option key={m} value={m}>
                                                {new Date(2000, m - 1)
                                                    .toLocaleString("tr-TR", {
                                                        month: "long",
                                                    }).toUpperCase()}
                                            </option>
                                        ))}
                                </select>
                            )}
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                                title="Rapor Yılı Seçin"
                                className={`bg-transparent border-none outline-none font-black text-xs text-slate-700 dark:text-white uppercase ${selectedYear !== 'ALL' ? 'border-l pl-2 border-slate-200 dark:border-white/10' : ''}`}
                            >
                                <option value="ALL">TÜM DÖNEMLER (ARŞİV)</option>
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            title="Raporu Dışa Aktar"
                            className={`p-4 rounded-2xl transition-all shadow-xl flex items-center justify-center ${isExportMenuOpen ? 'bg-emerald-500 text-white rotate-90' : 'bg-slate-900 text-white hover:scale-105'}`}
                        >
                            <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {isExportMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[100]" 
                                        onClick={() => setIsExportMenuOpen(false)} 
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-[110] p-3"
                                    >
                                        <div className="p-4 mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DIŞA AKTARMA SEÇENEKLERİ</p>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <button 
                                                onClick={() => {
                                                    setIsExportMenuOpen(false);
                                                    window.print();
                                                }}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                                            >
                                                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black dark:text-white">PDF RAPOR / YAZDIR</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Resmi Tahsilat Çizelgesi</span>
                                                </div>
                                            </button>

                                            <button 
                                                onClick={downloadAsCSV}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                                            >
                                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <FileSpreadsheet size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black dark:text-white">EXCEL / CSV</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ham Veri Tablosu</span>
                                                </div>
                                            </button>

                                            <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group">
                                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black dark:text-white">PNG GÖRÜNTÜ</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ekran Görüntüsü Al</span>
                                                </div>
                                            </button>

                                            <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-4" />

                                            <button 
                                                onClick={async () => {
                                                    setIsExportMenuOpen(false);
                                                    const csvData = getCSVContent();
                                                    const res = await (window as any).electron.ipcRenderer.invoke('send-report-email', {
                                                        stats: filteredStats,
                                                        period: `${selectedMonth}/${selectedYear}`,
                                                        csvAttachment: csvData
                                                    });
                                                    
                                                    if (res.success) {
                                                        ElectronService.showAlert({ 
                                                            title: 'BAŞARILI', 
                                                            message: 'Mali icmal raporu muhasebe birimine e-posta olarak gönderildi.', 
                                                            type: 'success' 
                                                        });
                                                    } else {
                                                        ElectronService.showAlert({ 
                                                            title: 'HATA', 
                                                            message: 'E-posta gönderilemedi: ' + res.message, 
                                                            type: 'error' 
                                                        });
                                                    }
                                                }}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-indigo-500 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-2xl transition-all text-left group"
                                            >
                                                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-white group-hover:text-indigo-500 transition-all">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black">MUHASEBEYE GÖNDER</span>
                                                    <span className="text-[9px] font-bold opacity-60 uppercase">E-Posta Servisi</span>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* 🛡️ GÜNLÜK PERFORMANS BARAJI (Dashboard Köprüsü) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden border border-white/10 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-emerald-400 backdrop-blur-xl border border-white/20">
                            <TrendingUp size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">GÜNLÜK MALİ NABIZ</h2>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">Bugün mühürlenen ve tahsil edilen yekün</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4 md:gap-12">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GÜNLÜK TAHAKKUK</p>
                            <p className="text-2xl font-black text-white tabular-nums">{dailyStats.acc.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">GÜNLÜK TAHSİLAT</p>
                            <p className="text-2xl font-black text-emerald-400 tabular-nums">+{dailyStats.coll.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">SULAMA ADEDİ</p>
                            <p className="text-2xl font-black text-blue-400 tabular-nums">{dailyStats.count} ADET</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🚀 Performans Özet Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            TOPLAM TAHAKKUK
                        </p>
                        <p className="text-3xl font-black italic dark:text-white mt-1">
                            {filteredStats.totalAcc.toLocaleString("tr-TR")} ₺
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4 border-l-4 border-l-emerald-500">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            TOPLAM TAHSİLAT
                        </p>
                        <p className="text-3xl font-black italic text-emerald-600 dark:text-emerald-400 mt-1">
                            {filteredStats.totalColl.toLocaleString("tr-TR")} ₺
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            TAHSİLAT ORANI
                        </p>
                        <p className="text-3xl font-black italic dark:text-white mt-1">
                            %{filteredStats.rate}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            BEKLEYEN ALACAK
                        </p>
                        <p className="text-3xl font-black italic text-rose-500 mt-1">
                            {(filteredStats.totalAcc - filteredStats.totalColl)
                                .toLocaleString("tr-TR")} ₺
                        </p>
                    </div>
                </div>
            </div>
            
            {/* 📊 Dönem Bazlı Kısımlar (Sarsılmaz Kırılım) */}
            {Object.keys(filteredStats.periodTotals).length > 0 && (
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <TrendingUp size={16} className="text-slate-400" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DÖNEM VE SEZON BAZLI KIRILIM</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(filteredStats.periodTotals).map(([period, values]) => (
                            <div key={period} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:scale-105 transition-all">
                                <p className="text-[9px] font-black text-primary-500 uppercase mb-3 tracking-tighter truncate">{period} SEZONU</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-bold text-slate-400">TAHAKKUK</span>
                                        <span className="text-xs font-black dark:text-white tabular-nums">{values.acc.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-bold text-emerald-500">TAHSİLAT</span>
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{values.coll.toLocaleString('tr-TR')} ₺</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">ORAN</span>
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white">
                                            %{values.acc > 0 ? (values.coll / values.acc * 100).toFixed(0) : '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 📉 Son Tahakkuklar */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-black italic uppercase text-xs tracking-widest text-slate-500">
                            Son Tahakkuk Kayıtları
                        </h3>
                        <Clock size={16} className="text-slate-300" />
                    </div>
                    <div className="p-6 space-y-3 min-h-[400px]">
                        {isLoading
                            ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
                                                <div className="h-2 w-20 bg-slate-100 dark:bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
                                    </div>
                                ))
                            )
                            : tahakkukList.length > 0
                            ? (
                                tahakkukList.slice(0, 10).map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                                                <TrendingUp size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black uppercase text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                                                    {item.Ad_Soyad ||
                                                        "Bilinmeyen Mükellef"}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                                        {item.Donem || "GENEL"}
                                                        {" "}
                                                        SEZONU
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 italic">
                                                        {new Date(item.Tarih)
                                                            .toLocaleDateString(
                                                                "tr-TR",
                                                            )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                                                {Number(item.Miktar || 0)
                                                    .toLocaleString("tr-TR", {
                                                        minimumFractionDigits:
                                                            2,
                                                    })} ₺
                                            </span>
                                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                                                Tahakkuk Fişi
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )
                            : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                                    <TrendingUp size={48} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Kayıt Bulunamadı
                                    </p>
                                </div>
                            )}
                    </div>
                </div>

                {/* 📉 Son Tahsilatlar */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-black italic uppercase text-xs tracking-widest text-slate-500">
                            Son Tahsilat Kayıtları
                        </h3>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div className="p-6 space-y-3 min-h-[400px]">
                        {isLoading
                            ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
                                                <div className="h-2 w-20 bg-slate-100 dark:bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
                                    </div>
                                ))
                            )
                            : tahsilatList.length > 0
                            ? (
                                tahsilatList.slice(0, 10).map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 border-l-4 border-l-emerald-500"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:-rotate-6 transition-transform">
                                                <Wallet size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black uppercase text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                    {item.Ad_Soyad ||
                                                        "Bilinmeyen Tahsilat"}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                                        MAKBUZ:{" "}
                                                        {item.Makbuz_No ||
                                                            "---"}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 italic">
                                                        {new Date(item.Tarih)
                                                            .toLocaleDateString(
                                                                "tr-TR",
                                                            )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                +{Number(item.Miktar || 0)
                                                    .toLocaleString("tr-TR", {
                                                        minimumFractionDigits:
                                                            2,
                                                    })} ₺
                                            </span>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                Nakit Tahsilat
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )
                            : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                                    <Wallet size={48} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Kayıt Bulunamadı
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};
