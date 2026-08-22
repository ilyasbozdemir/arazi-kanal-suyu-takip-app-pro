import React from 'react';
import { Droplets, Clock, Calendar, FileText } from 'lucide-react';

export const IrrigationHistoryTab: React.FC<any> = ({ profileData }) => {
    const data = profileData?.sulama || [];
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-8 py-6">TARİH / DÖNEM</th>
                            <th className="px-8 py-6">MAHALLE / TAŞINMAZ</th>
                            <th className="px-8 py-6 text-center">SÜRE (SAAT)</th>
                            <th className="px-8 py-6 text-right">TUTAR</th>
                            <th className="px-8 py-6 text-center">MAKBUZ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((m: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700 dark:text-white uppercase">{m.Tarih || '-'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{m.Donem_Adi || 'GENEL SEZON'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700 dark:text-white uppercase italic">{m.Mevki_Adi || m.Mahalle_Adi || '-'}</span>
                                            <span className="text-[9px] font-bold text-primary-500 uppercase">
                                                {m.Ada ? `ADA: ${m.Ada} / PARSEL: ${m.Parsel}` : `ID: ${m.Tasinmaz_id || '-'}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-600 rounded-full text-[10px] font-black">
                                            <Clock size={12} /> {m.Sure_Saat || 0} SAAT
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-xs font-black text-emerald-600 italic">{Number(m.Toplam_Tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {m.Makbuz_No ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-lg text-[10px] font-bold">
                                                <FileText size={12} /> {m.Makbuz_No}
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-300 uppercase italic">---</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Droplets size={64} />
                                        <p className="font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] text-xs">SULAMA KAYDI BULUNAMADI</p>
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
