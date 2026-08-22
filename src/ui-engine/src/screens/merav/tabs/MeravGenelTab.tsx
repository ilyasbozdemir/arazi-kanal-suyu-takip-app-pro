import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Activity,
  ExternalLink,
  TrendingUp,
  ShieldCheck,
  Phone,
  Calendar,
  MapPin,
  Layers,
  ShieldAlert,
  ChevronRight
} from "lucide-react";

interface MeravGenelTabProps {
  values: any;
  citizen: any;
  loadingCitizen: boolean;
  profileData: any;
  assignments: any[];
  onOpenDetail?: (table: string, id: any, extraData?: any) => void;
  onDevirOpen: () => void;
}

export const MeravGenelTab: React.FC<MeravGenelTabProps> = ({
  values,
  citizen,
  loadingCitizen,
  profileData,
  assignments,
  onOpenDetail,
  onDevirOpen
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-10"
    >
      {/* 🛡️ Left Profile Panel */}
      <div className="lg:col-span-4 space-y-8">
        <div className="relative group bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-white/5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] p-1 shadow-2xl shadow-emerald-500/30 mb-8 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[38px] flex items-center justify-center overflow-hidden">
                 {citizen?.Profil_Foto_Yolu ? (
                    <img 
                      src={`file://${citizen.Profil_Foto_Yolu}`} 
                      className="w-full h-full object-cover rounded-[38px]" 
                      alt="Profil" 
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                 ) : null}
                 <User size={64} className="text-emerald-500" style={{ display: citizen?.Profil_Foto_Yolu ? 'none' : 'flex' }} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight italic">
                 {citizen ? `${citizen.Ad} ${citizen.Soyad}` : (loadingCitizen ? "YÜKLENİYOR..." : (values.Ad_Soyad || profileData.Ad_Soyad || "GÖREVLİ SEÇİLMEDİ"))}
              </h3>
              <div className="flex items-center justify-center gap-3">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${values.Aktif !== 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                    {values.Aktif !== 0 ? 'AKTİF GÖREVLİ' : 'GÖREVDE DEĞİL'}
                 </span>
                 {(citizen?.TCKN || values.Vatandas_Id) && (
                   <span className="bg-slate-100 dark:bg-white/5 text-slate-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                      ID: {citizen?.TCKN || values.Vatandas_Id}
                   </span>
                 )}
              </div>
            </div>

            <div className="w-full space-y-3 mt-10">
               {assignments.length > 0 && (
                 <button 
                   onClick={() => onOpenDetail?.('DATA_Dagitim_Donemleri', assignments[0].Defter_id, { 
                     activeTab: 'defter',
                     mahalle: { id: assignments[0].Mahalle_id, Mahalle_Adi: assignments[0].Mahalle_Adi, Tip: assignments[0].Mahalle_Tip },
                     ledger: assignments[0]
                   })}
                   className="w-full py-4 bg-primary-500 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-primary-400"
                 >
                   <Layers size={18} /> AKTİF SULAMA DEFTERİNİ AÇ
                 </button>
               )}
               <div className="grid grid-cols-2 gap-4">
                  <button
                    title="Görev Devir Al"
                    onClick={onDevirOpen}
                    className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl hover:bg-emerald-500 hover:text-white transition-all group/btn border border-transparent hover:border-emerald-400"
                  >
                    <Activity size={20} className="text-emerald-500 group-hover/btn:text-white transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest">GÖREV DEVİR</span>
                  </button>
                  <button
                    title="Vatandaş Profilini Aç"
                    onClick={() => onOpenDetail?.('DATA_Vatandas', citizen?.id || values.Vatandas_Id)}
                    className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl hover:bg-violet-500 hover:text-white transition-all group/btn border border-transparent hover:border-violet-400"
                  >
                    <ExternalLink size={20} className="text-violet-500 group-hover/btn:text-white transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest">PROFİLİ AÇ</span>
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* 🛡️ Quick Stats Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><TrendingUp size={200} /></div>
          <div className="relative z-10 space-y-8">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp size={12} className="text-emerald-400" /> PERFORMANS ÖZETİ
                </p>
                <h4 className="text-5xl font-black italic tracking-tighter">
                   {(profileData?.statsSummary?.toplamTahakkuk || 0).toLocaleString("tr-TR")} 
                   <span className="text-xl ml-2 opacity-40 font-black">TL</span>
                </h4>
                <p className="text-[11px] font-bold text-slate-400 uppercase">TOPLAM TAHSİLAT SORUMLULUĞU</p>
             </div>
             <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">MÜKELLEF</p>
                   <p className="text-2xl font-black italic">{profileData?.statsSummary?.toplamVatandas || 0} KİŞİ</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">PARSEL</p>
                   <p className="text-2xl font-black italic">{profileData?.statsSummary?.toplamParsel || 0} ADET</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🛡️ Main Content Panel */}
      <div className="lg:col-span-8 space-y-10">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-12 border-b border-slate-50 dark:border-white/5 pb-8">
             <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-[24px]">
                   <ShieldCheck size={28} />
                </div>
                <div>
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Görev Yetki Bilgileri</h2>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">RESMİ ATAMA VE SORUMLULUK KÜTÜĞÜ</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-transparent hover:border-indigo-500/20 transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><Phone size={16} /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İLETİŞİM TELEFONU</span>
                   </div>
                   <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{citizen?.Telefon || values.Telefon || "BELİRTİLMEMİŞ"}</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-transparent hover:border-emerald-500/20 transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Calendar size={16} /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAYIT TARİHİ</span>
                   </div>
                   <p className="text-2xl font-black text-slate-800 dark:text-white uppercase">{values.created_at ? new Date(values.created_at).toLocaleDateString('tr-TR') : 'YENİ KAYIT'}</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-transparent hover:border-rose-500/20 transition-all h-full">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><MapPin size={16} /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İKÂMET ADRESİ</span>
                   </div>
                   <p className="text-sm font-black text-slate-600 dark:text-slate-300 leading-relaxed uppercase">{citizen?.Adres || values.Vatandas_Adres || "SİSTEMDE KAYITLI ADRES BULUNAMADI"}</p>
                </div>
             </div>
          </div>

          <div className="mt-12 bg-primary-500/5 rounded-[40px] p-10 border border-primary-500/10">
             <div className="flex items-center gap-6 mb-8">
                <div className="p-4 bg-primary-500 text-white rounded-[20px] shadow-lg shadow-primary-500/20">
                   <Layers size={24} />
                </div>
                <div className="flex-1">
                   <h4 className="text-xl font-black text-slate-800 dark:text-white italic uppercase tracking-tighter">Sorumlu Olduğu Bölgeler</h4>
                   <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">GÜNCEL SEZON GÖREVLENDİRMELERİ</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.length > 0 ? (
                   assignments.map((a: any) => (
                      <div 
                        key={a.id} 
                        onClick={() => onOpenDetail?.('DATA_Dagitim_Donemleri', a.Defter_id, { 
                          activeTab: 'defter',
                          mahalle: { id: a.Mahalle_id, Mahalle_Adi: a.Mahalle_Adi, Tip: a.Mahalle_Tip },
                          ledger: a
                        })}
                        className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm group hover:scale-[1.02] transition-all cursor-pointer hover:border-primary-500/50"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                               <MapPin size={18} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">MAHALLE / BÖLGE</p>
                               <p className="text-sm font-black text-slate-800 dark:text-white uppercase italic group-hover:text-primary-500 transition-colors">{a.Mahalle_Adi}</p>
                            </div>
                         </div>
                         <div className="p-3 bg-slate-50 dark:bg-white/5 text-slate-300 rounded-xl group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                   ))
                ) : (
                   <div className="col-span-2 py-10 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-300">
                         <ShieldAlert size={32} />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">BU MERAV İÇİN AKTİF GÖREVLENDİRME BULUNAMADI</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase italic">Lütfen Dağıtım Bölgesi ayarlarından veya sezon yönetiminden Merav ataması yapınız.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
