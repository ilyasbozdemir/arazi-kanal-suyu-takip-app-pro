import React from "react";
import { 
  Calendar, Fingerprint, Landmark, MapPin, ShieldCheck, Smartphone, 
  User, Users, Phone, MessageCircle, Mail, Navigation, QrCode
} from "lucide-react";
import { DetailSection } from "@renderer/components/detail/DetailSection";

export const GeneralTab: React.FC<any> = (props: any) => {
    const { values, setActiveQR, ppPreview } = props;
    return (
        <React.Fragment>
            <div className="relative p-12 bg-gradient-to-br from-indigo-700 via-primary-600 to-indigo-800 rounded-[64px] shadow-[0_32px_80px_-20px_rgba(37,99,235,0.3)] overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12"><User size={400} /></div>
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-12">
                    <div className="flex items-center gap-10">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-[44px] border border-white/20 flex items-center justify-center p-3 relative group">
                            <div className="w-full h-full rounded-[32px] bg-white overflow-hidden flex items-center justify-center">
                                {ppPreview ? (
                                    <img src={ppPreview} alt="PP" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-200" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800"><ShieldCheck size={20} /></div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none drop-shadow-2xl">
                                {values.Ad || '-'} {values.Soyad || '-'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8 text-white/50 font-bold text-xs tracking-[0.2em] uppercase">
                                <div className="flex items-center gap-2.5" title="TÜRKİYE CUMHURİYETİ KİMLİK NUMARASI">
                                    <Fingerprint size={18} className="text-white/30" /> 
                                    <span className="opacity-60">TCKN:</span> 
                                    <span className="text-white font-black">{(!isNaN(parseFloat(values.TCKN)) && parseFloat(values.TCKN) % 1 === 0) ? String(parseInt(values.TCKN)) : (values.TCKN || 'KAYITSIZ')}</span>
                                </div>
                                <div className="flex items-center gap-2.5" title="KURUM RESMİ SİCİL NUMARASI">
                                    <Landmark size={18} className="text-white/30" /> 
                                    <span className="opacity-60">SİCİL:</span> 
                                    <span className="text-white font-black">{(!isNaN(parseFloat(values.Sicil_No)) && parseFloat(values.Sicil_No) % 1 === 0) ? String(parseInt(values.Sicil_No)) : (values.Sicil_No || '---')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {values.Telefon && (
                            <div className="flex items-center gap-2">
                                <button title="Hızlı Arama QR" onClick={() => setActiveQR({ type: 'tel', data: values.Telefon, title: 'Hızlı Arama' })} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[24px] border border-white/10 transition-all backdrop-blur-md shadow-xl"><Phone size={24} /></button>
                                <button title="WhatsApp Mesaj QR" onClick={() => setActiveQR({ type: 'wp', data: values.Telefon, title: 'WhatsApp Mesaj' })} className="p-4 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-[24px] border border-emerald-500/20 transition-all backdrop-blur-md shadow-xl"><MessageCircle size={24} /></button>
                            </div>
                        )}
                        {values.Eposta && (
                            <button title="E-Posta QR" onClick={() => setActiveQR({ type: 'mail', data: values.Eposta, title: 'E-Posta Gönder' })} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[24px] border border-white/10 transition-all backdrop-blur-md shadow-xl"><Mail size={24} /></button>
                        )}
                        <button title="Kişi Arama QR" onClick={() => setActiveQR({ type: 'search', data: values.TCKN || values.Sicil_No || values.id, title: 'Kişi Arama' })} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[24px] border border-white/10 transition-all backdrop-blur-md shadow-xl"><QrCode size={24} /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DetailSection title="İletişim Kanalları" icon={Smartphone} iconColor="text-sky-500">
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl group">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GSM / MOBİL</h4>
                            <span className="text-xl font-black italic tracking-tighter text-slate-800 dark:text-white tabular-nums">{values.Telefon || '---'}</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl group">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ELEKTRONİK POSTA</h4>
                            <span className="text-base font-black text-slate-700 dark:text-white truncate block">{values.Eposta || '---'}</span>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Resmi Adres" icon={MapPin} iconColor="text-rose-500">
                    <div className="h-full p-8 bg-rose-500/5 rounded-3xl border border-rose-500/10 flex flex-col justify-between">
                        <p className="text-lg font-black italic uppercase leading-tight text-slate-700 dark:text-white">{values.Adres || 'ADRES BİLGİSİ BULUNMUYOR'}</p>
                        <div className="flex items-center gap-3 mt-6">
                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white"><Navigation size={14} /></div>
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">RESMİ İKAMETGAH</span>
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Nüfus Detayları" icon={Users} iconColor="text-emerald-500">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">BABA ADI</h4>
                            <span className="font-black text-slate-800 dark:text-white">{values.Baba_Adi || '-'}</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ANA ADI</h4>
                            <span className="font-black text-slate-800 dark:text-white">{values.Ana_Adi || '-'}</span>
                        </div>
                        <div className="col-span-2 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center justify-between">
                            <div>
                                <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">DOĞUM TARİHİ</h4>
                                <span className="text-xl font-black italic text-emerald-700 dark:text-emerald-400 tabular-nums">{values.Dogum_Tarihi || '-'}</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"><Calendar size={20} className="text-emerald-500" /></div>
                        </div>
                    </div>
                </DetailSection>
            </div>
        </React.Fragment>
    );
};
