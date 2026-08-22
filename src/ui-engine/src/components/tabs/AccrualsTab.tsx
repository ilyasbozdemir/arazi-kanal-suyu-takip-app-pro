import React from 'react';
import { FileText, AlertCircle, CheckCircle2, Users, User } from 'lucide-react';

export const AccrualsTab: React.FC<any> = ({ profileData, onPay, owners = [], citizen }) => {
    const data = profileData?.tahakkuk || [];
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const totalDebt = Math.max(0, data.reduce((acc: number, curr: any) => acc + (Number(curr.Kalan_Borc) || 0), 0));
    const hasMultipleOwners = owners.length > 1;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Satır için isim: SQL'den gelen Vatandas_Ad > owners listesi > citizen prop sırası ile bak
    const getRowName = (m: any) => {
        if (m.Vatandas_Ad) return `${m.Vatandas_Ad} ${m.Vatandas_Soyad || ''}`.trim();
        if (owners.length > 0) {
            return owners
                .map((o: any) => (o.Ad && o.Soyad && o.Ad !== 'undefined') ? `${o.Ad} ${o.Soyad}` : (o.Ad_Soyad || ''))
                .filter(Boolean).join(' & ');
        }
        if (citizen?.Ad) return `${citizen.Ad} ${citizen.Soyad || ''}`.trim();
        return null;
    };
    const getRowTCKN = (m: any) => {
        if (m.Vatandas_TCKN) return m.Vatandas_TCKN;
        if (citizen?.TCKN) return citizen.TCKN;
        return null;
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Finansal Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">TOPLAM GÜNCEL BORÇ</div>
                    <div className="text-4xl font-black tracking-tighter italic">{totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm">₺</span></div>
                    <AlertCircle size={80} className="absolute -right-4 -bottom-4 opacity-10" />
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TOPLAM TAHAKKUK</div>
                    <div className="text-4xl font-black tracking-tighter italic text-slate-800 dark:text-white">
                        {data.reduce((acc: number, curr: any) => acc + (curr.Toplam_Tutar || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-sm">₺</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">KAYIT SAYISI</div>
                    <div className="text-4xl font-black tracking-tighter italic text-slate-800 dark:text-white">{data.length} <span className="text-sm">FİŞ</span></div>
                </div>
            </div>

            {/* 👥 Ortak Mülkiyet Uyarısı — sadece birden fazla malik varsa göster */}
            {hasMultipleOwners && (
                <div className="flex items-center gap-4 px-6 py-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl">
                    <div className="w-9 h-9 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ORTAK MÜLKİYET — MALİKLERİ ORTAK ÖDER</p>
                        <p className="text-[9px] font-bold text-indigo-400 mt-0.5 uppercase">
                            {owners
                                .map((o: any) => (o.Ad && o.Soyad && o.Ad !== 'undefined') ? `${o.Ad} ${o.Soyad}` : (o.Ad_Soyad || o.TCKN || ''))
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-6">DÖNEM / YIL</th>
                            <th className="px-8 py-6">MALİK / TAŞINMAZ</th>
                            <th className="px-8 py-6 text-right">TOPLAM TUTAR</th>
                            <th className="px-8 py-6 text-right">KALAN BORÇ</th>
                            <th className="px-8 py-6 text-center">DURUM</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((m: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    {/* DÖNEM */}
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700 dark:text-white uppercase">{m.Donem_Adi || 'SULAMA'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.Yil || '-'} SEZONU</span>
                                        </div>
                                    </td>
                                    {/* MALİK & TAŞINMAZ */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                {getRowName(m) ? (
                                                    <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                        {getRowName(m)}
                                                        {getRowTCKN(m) && <span className="text-[9px] font-bold text-slate-400 ml-1">({getRowTCKN(m)})</span>}
                                                    </span>
                                                ) : null}
                                                {/* Açıklama ve taşınmaz bilgisi */}
                                                <span className="text-[9px] font-bold text-primary-500 uppercase truncate">
                                                    {m.Aciklama || 'SU KULLANIM BEDELİ'}
                                                    {m.Ada && ` · A:${m.Ada} P:${m.Parsel}`}
                                                    {m.Mevki_Adi && ` · ${m.Mevki_Adi}`}
                                                </span>
                                                {/* Ortak mülkiyet notu */}
                                                {hasMultipleOwners && (
                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">
                                                        ⚖ MALİKLERİ ORTAK ÖDER
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {/* TUTAR */}
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-xs font-black text-slate-800 dark:text-white">
                                            {Number(m.Toplam_Tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    </td>
                                    {/* KALAN BORÇ */}
                                    <td className="px-8 py-6 text-right">
                                        <span className={`text-xs font-black ${m.Kalan_Borc > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {Number(m.Kalan_Borc || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    </td>
                                    {/* DURUM & İŞLEMLER */}
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {m.Kalan_Borc <= 0 ? (
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 ${m.Kalan_Borc < 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'} rounded-full text-[9px] font-black uppercase`}>
                                                    {m.Kalan_Borc < 0 ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                                    {m.Kalan_Borc < 0 ? 'FAZLA ÖDEME' : 'ÖDENDİ'}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 ${m.Durum === 'Kısmi' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'} rounded-full text-[9px] font-black uppercase`}>
                                                        <AlertCircle size={12} /> {m.Durum === 'Kısmi' ? 'KISMİ ÖDEME' : 'BEKLEYEN'}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => onPay?.(m)}
                                                            className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            ÖDE
                                                        </button>
                                                        {m.Ada && (
                                                            <button
                                                                title="Hisseye Göre Paylaştır"
                                                                onClick={async () => {
                                                                    const ok = await (window as any).electron.ipcRenderer.invoke('show-confirm', {
                                                                        title: 'BORÇ PAYLAŞTIRMA',
                                                                        message: 'Bu taşınmazın borcunu hissedarları arasında pay oranlarına göre dağıtmak istediğinizden emin misiniz? Mevcut borç kaydı iptal edilecektir.',
                                                                        type: 'question'
                                                                    });
                                                                    if (ok) {
                                                                        const res = await (window as any).electron.ipcRenderer.invoke('split-accrual-by-shares', m.id);
                                                                        if (res.success) {
                                                                            (window as any).electron.ipcRenderer.invoke('show-alert', { message: 'Borç başarıyla hissedarlara paylaştırıldı.', type: 'success' });
                                                                            window.location.reload();
                                                                        } else {
                                                                            (window as any).electron.ipcRenderer.invoke('show-alert', { message: res.error, type: 'error' });
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-1 bg-indigo-500 text-white rounded-full hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                                                            >
                                                                <Users size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <FileText size={64} />
                                        <p className="font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] text-xs">TAHAKKUK KAYDI BULUNAMADI</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="px-8 py-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAYFA {currentPage} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                Önceki
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
