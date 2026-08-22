import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Landmark, FileText } from 'lucide-react';

export const AccountingLedgerTab: React.FC<any> = ({ profileData }) => {
    const tahakkuklar = profileData?.tahakkuk || [];
    const tahsilatlar = profileData?.tahsilat || [];

    // Tüm hareketleri birleştir ve tarihe göre sırala
    const movements = [
        ...tahakkuklar.map((t: any) => ({
            id: t.id,
            tarih: t.Tarih || t.created_at,
            type: t.Tur === 'GÜN_SONU_NOKSANI' ? 'KASA NOKSANI' : 'TAHAKKUK',
            fisNo: t.Fis_No || t.Rapor_No || '-',
            description: t.Aciklama || (t.Tur === 'GÜN_SONU_NOKSANI' ? 'KASA NOKSANI BORÇLANDIRMA' : 'SULAMA TAHAKKUKU'),
            amount: t.Miktar || 0,
            direction: 'DEBT', // Borçlandırma
            status: t.Durum
        })),
        ...tahsilatlar.map((ts: any) => ({
            id: ts.id,
            tarih: ts.Tarih || ts.created_at,
            type: 'TAHSİLAT',
            fisNo: ts.Makbuz_No || '-',
            description: ts.Aciklama || 'TAHSİLAT MAKBUZU',
            amount: ts.Miktar || 0,
            direction: 'CREDIT', // Alacak (Ödeme)
            status: 'TAMAMLANDI'
        }))
    ].sort((a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime());

    let runningBalance = 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Tarih</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Tür</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Açıklama</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Borç</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Alacak</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-40">Bakiye</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {movements.map((m, i) => {
                            if (m.direction === 'DEBT') runningBalance += m.amount;
                            else runningBalance -= m.amount;

                            return (
                                <tr key={m.id + i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-slate-800 dark:text-white tabular-nums">
                                                {new Date(m.tarih).toLocaleDateString('tr-TR')}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                                                {new Date(m.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                                                m.type === 'TAHAKKUK' 
                                                ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' 
                                                : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                                            }`}>
                                                {m.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${
                                                m.direction === 'DEBT' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                                {m.type === 'TAHAKKUK' ? <FileText size={14} /> : <Landmark size={14} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{m.description}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-medium text-slate-400 uppercase italic"># {m.id.substring(0, 8)}</span>
                                                    {m.fisNo && m.fisNo !== '-' && (
                                                        <span className="text-[8px] font-black text-indigo-500 bg-indigo-500/5 px-1.5 py-0.5 rounded uppercase">FİŞ: {m.fisNo}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className={`text-[13px] font-black tabular-nums ${m.direction === 'DEBT' ? 'text-rose-500' : 'text-slate-300'}`}>
                                            {m.direction === 'DEBT' ? `${new Intl.NumberFormat('tr-TR').format(m.amount)} ₺` : '-'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className={`text-[13px] font-black tabular-nums ${m.direction === 'CREDIT' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            {m.direction === 'CREDIT' ? `${new Intl.NumberFormat('tr-TR').format(m.amount)} ₺` : '-'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className={`flex flex-col items-end`}>
                                            <span className={`text-sm font-black tabular-nums tracking-tighter ${
                                                runningBalance > 0 ? 'text-rose-600' : runningBalance < 0 ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(runningBalance)}
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                {runningBalance > 0 ? 'BORÇ BAKİYE' : runningBalance < 0 ? 'ALACAK BAKİYE' : 'HESAP KAPALI'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10">
                            <td colSpan={5} className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">GÜNCEL NET BAKİYE</td>
                            <td className="p-6 text-right">
                                <span className={`text-xl font-black tabular-nums tracking-tighter ${
                                    runningBalance > 0 ? 'text-rose-600' : runningBalance < 0 ? 'text-emerald-600' : 'text-slate-800 dark:text-white'
                                }`}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(runningBalance)}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
