import React from 'react';
import { Map, Maximize2, MapPin } from 'lucide-react';

export const DeedArchiveTab: React.FC<any> = ({ profileData, onOpenDetail }) => {
    const data = profileData?.lands || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.length > 0 ? (
                data.map((m: any, i: number) => (
                    <div 
                        key={i} 
                        onClick={() => onOpenDetail?.('DATA_Tapu_Verisi', m.id)}
                        className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:border-primary-500/50 transition-all cursor-pointer relative"
                    >
                        <div className="h-32 bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                            <Map className="text-slate-300 dark:text-slate-700 group-hover:text-primary-500 transition-colors" size={48} />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ADA / PARSEL</h4>
                                    <span className="text-xl font-black italic tracking-tighter text-slate-800 dark:text-white">{m.Ada || '?'}-{m.Parsel || '?'}</span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    <Maximize2 size={16} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <MapPin size={14} className="text-primary-500" />
                                <span className="text-[10px] font-bold uppercase truncate flex-1">{m.Mevki || 'MEVKİ BELİRTİLMEMİŞ'}</span>
                                {m.Iliski_Tipi === 'ZİLYET' && (
                                    <span className="text-[7px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">ZİLYET</span>
                                )}
                             </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TAPU ALANI</span>
                                <span className="text-xs font-black text-slate-700 dark:text-white">{m.Alan_m2 || '0'} m²</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-32 flex flex-col items-center gap-4 opacity-20">
                    <Map size={64} />
                    <p className="font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] text-xs">KAYITLI TAŞINMAZ BULUNAMADI</p>
                </div>
            )}
        </div>
    );
};
