import React from 'react';
import { BookOpen, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const DistributionLedgerTab: React.FC<any> = ({ profileData }) => {
    const data = profileData?.sulama || []; // Sulama kayıtları aslında defter kayıtlarıdır

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.length > 0 ? (
                data.map((m: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 p-8 flex items-center justify-between group hover:shadow-xl transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{m.Donem_Adi || 'SULAMA DEFTERİ'}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Calendar size={12} /> {m.Yil || '-'} SEZONU
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                                        <MapPin size={12} /> {m.Mahalle_Adi || '-'}
                                    </div>
                                    {m.Mevki_Adi && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
                                            {m.Mevki_Adi} {m.Ada ? `${m.Ada}/${m.Parsel}` : m.Parsel}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">DURUM</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                    m.Odeme_Durumu === 'Ödendi' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    m.Odeme_Durumu === 'Kısmi' ? 'bg-amber-500/10 text-amber-500' : 
                                    'bg-rose-500/10 text-rose-500'
                                }`}>
                                    {m.Odeme_Durumu || 'BEKLİYOR'}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">FİŞ NO</span>
                                <span className="text-sm font-black text-slate-700 dark:text-white tabular-nums"># {m.id.toString().substring(0, 8)}</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-300 group-hover:text-primary-500 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-32 flex flex-col items-center gap-4 opacity-20 text-center">
                    <BookOpen size={64} />
                    <p className="font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] text-xs">KAYITLI DEFTER BİLGİSİ BULUNAMADI</p>
                </div>
            )}
        </div>
    );
};
