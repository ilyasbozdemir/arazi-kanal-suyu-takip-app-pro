import React, { useState } from 'react';
import { Wallet, Receipt, CreditCard, ChevronDown, MapPin, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CollectionsTab: React.FC<any> = ({ profileData }) => {
    const data = profileData?.tahsilat || [];
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Verileri Taşınmaz (Ada/Parsel) bazında grupla
    const groupsRaw = data.reduce((acc: any, curr: any) => {
        const key = curr.Ada ? `${curr.Ada}/${curr.Parsel}` : (curr.Donem_Adi || 'GENEL TAHSİLAT');
        if (!acc[key]) acc[key] = {
            id: key,
            name: curr.Ada ? `TAŞINMAZ: ${curr.Ada}/${curr.Parsel}` : key,
            mevki: curr.Mevki_Adi,
            items: [],
            total: 0
        };
        acc[key].items.push(curr);
        acc[key].total += Number(curr.Miktar || 0);
        return acc;
    }, {});

    const groups = Object.values(groupsRaw);
    const totalPages = Math.ceil(groups.length / itemsPerPage);
    const paginatedGroups = groups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    if (data.length === 0) {
        return (
            <div className="py-32 flex flex-col items-center gap-4 opacity-20 text-center">
                <Wallet size={64} />
                <p className="font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] text-xs">TAHSİLAT KAYDI BULUNAMADI</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {paginatedGroups.map((group: any) => {
                const isExpanded = expandedGroups.includes(group.id);
                return (
                    <div key={group.id} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* ACCORDION HEADER */}
                        <button 
                            onClick={() => toggleGroup(group.id)}
                            className="w-full px-8 py-6 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-primary-500/10 group-hover:text-primary-500'}`}>
                                    <Landmark size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">{group.name}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        {group.mevki && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                <MapPin size={10} /> {group.mevki}
                                            </span>
                                        )}
                                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/5 px-2 py-0.5 rounded-lg border border-primary-500/10">
                                            {group.items.length} MAKBUZ
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">GRUP TOPLAMI</span>
                                    <span className="text-xl font-black text-emerald-600 tabular-nums italic">
                                        {group.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                    </span>
                                </div>
                                <div className={`p-2 rounded-xl transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-slate-100 dark:bg-white/10' : ''}`}>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </button>

                        {/* ACCORDION CONTENT */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-8 pt-2">
                                        <div className="border-t border-slate-50 dark:border-white/5 pt-4">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <th className="text-left py-4">TARİH / DÖNEM</th>
                                                        <th className="text-left py-4">MAKBUZ</th>
                                                        <th className="text-left py-4">YÖNTEM</th>
                                                        <th className="text-right py-4">TUTAR</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                    {group.items.map((m: any, i: number) => (
                                                        <tr key={i} className="group/row">
                                                            <td className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black text-slate-700 dark:text-white">
                                                                        {new Date(m.Tarih).toLocaleDateString('tr-TR')}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{m.Donem_Adi || '-'} SEZONU</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-500/5 text-indigo-500 rounded-lg text-[10px] font-black">
                                                                    <Receipt size={12} /> {m.Makbuz_No || '---'}
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                                    <CreditCard size={14} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">{m.Odeme_Yontemi || 'NAKİT'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <span className="text-sm font-black text-emerald-600 tabular-nums">
                                                                    {Number(m.Miktar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
            
            {totalPages > 1 && (
                <div className="px-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAYFA {currentPage} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all"
                        >
                            Önceki
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
