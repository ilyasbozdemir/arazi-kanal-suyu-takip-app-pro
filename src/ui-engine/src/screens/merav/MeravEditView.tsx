import React from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Save, ShieldCheck, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { FieldRenderer } from "@renderer/components/detail/FieldRenderer";
import { useRecordDetail } from "@renderer/hooks/useRecordDetail";

export const MeravEditView: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, regions, onRefresh, onClose } = props;
  
  const localLogic = useRecordDetail(table, type, data, !props.logic, onRefresh, onClose);
  const logic = props.logic || localLogic;

  const {
    values = {},
    setValues,
    isProcessing,
    isFormValid,
    touched,
    onFieldBlur,
    onSaveRecord,
    setIsEditing
  } = logic;

  const translateHeader = (h: string) => {
    const dict: any = {
      "Vatandas_Id": "GÖREVLİ PERSONEL SEÇİMİ",
      "Aktif": "GÖREV DURUMU",
    };
    return dict[h] || h;
  };

  const renderField = (field: string) => (
    <div className="relative group">
       <FieldRenderer
         key={field}
         field={field}
         isEditing={true}
         values={values}
         setValues={setValues}
         table={table}
         type={type as any}
         translateHeader={translateHeader}
         renderTooltip={() => null}
         isRequiredFieldEmpty={(f) => !values[f]}
         isTouched={touched[field]}
         onBlur={() => onFieldBlur(field)}
         vatandaslar={citizens}
         mevkiler={locations}
         allRegions={props.regions || props.locations || props.neighborhoods || []}
       />
    </div>
  );

  const selectedCitizen = (citizens || []).find((c: any) => c.TCKN === values.Vatandas_Id);

  return (
    <div className="h-full w-full flex bg-[#f8fafc] dark:bg-[#020617] overflow-hidden font-sans">
      {/* 🛡️ Modern Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-96 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col shadow-2xl z-20"
      >
        <div className="p-10 border-b border-slate-50 dark:border-white/5">
          <button 
            onClick={() => type === "create" ? onClose() : setIsEditing(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-primary-500 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Geri Dön</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-emerald-500 text-white rounded-[24px] shadow-lg shadow-emerald-500/20">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                {type === "create" ? "Yeni Kayıt" : "Düzenleme"}
              </h1>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                 Merav Tescil Protokolü
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-4 overflow-y-auto custom-scrollbar">
           <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] space-y-3">
              <div className="flex items-center gap-3 text-emerald-600">
                 <Info size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Kılavuz</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase italic">
                 Merav kaydı için öncelikle vatandaş kütüğünde kayıtlı bir personel seçmelisiniz. Personel aktif görevde ise durumunu "GÖREVDE" olarak işaretleyiniz.
              </p>
           </div>
           
           <div className="pt-8 space-y-2">
              <div className="flex items-center justify-between px-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem Adımları</span>
                 <span className="text-[10px] font-black text-emerald-500">1 / 1</span>
              </div>
              <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-full" />
              </div>
           </div>
        </div>

        <div className="p-10 border-t border-slate-50 dark:border-white/5">
           <button
             disabled={isProcessing || !isFormValid}
             onClick={onSaveRecord}
             className={`w-full h-20 flex items-center justify-center gap-4 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${
               isFormValid 
                 ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:scale-[1.02] active:scale-95" 
                 : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
             }`}
           >
             {isProcessing ? "İŞLENİYOR..." : (type === "create" ? "KAYDI TAMAMLA" : "GÜNCELLEMEYİ KAYDET")}
             <Save size={20} />
           </button>
        </div>
      </motion.div>

      {/* 🛡️ Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-5xl mx-auto p-16 space-y-12">
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-white/5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] space-y-12"
          >
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-10">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-[24px]">
                     <Briefcase size={28} />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Personel & Yetki Tanımı</h2>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">GÖREV BİLGİLERİNİ GÜNCELLEYİN</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">GÖREVLİ PERSONEL</label>
                  {renderField("Vatandas_Id")}
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">GÖREV DURUMU</label>
                  {renderField("Aktif")}
               </div>
            </div>

            {/* 🛡️ Integrated Card for Selected Citizen */}
            <motion.div 
              layout
              className={`relative overflow-hidden transition-all duration-500 ${selectedCitizen ? 'opacity-100 scale-100' : 'opacity-30 scale-[0.98] pointer-events-none'}`}
            >
               <div className="bg-slate-50 dark:bg-white/5 rounded-[40px] p-10 border-2 border-dashed border-slate-200 dark:border-white/10 relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                     <User size={120} />
                  </div>
                  
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-white/10">
                           <User size={32} className="text-primary-500" />
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none mb-2">
                              {selectedCitizen ? `${selectedCitizen.Ad} ${selectedCitizen.Soyad}` : "PERSONEL SEÇİLMEDİ"}
                           </h4>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KAYITLI VATANDAŞ</span>
                              {selectedCitizen && <CheckCircle2 size={12} className="text-emerald-500" />}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200/50 dark:border-white/5">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TC KİMLİK</p>
                           <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tabular-nums">{selectedCitizen?.TCKN || "---"}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TELEFON</p>
                           <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tabular-nums">{selectedCitizen?.Telefon || "---"}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">YERLEŞİM</p>
                           <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase truncate">{selectedCitizen?.Adres || "---"}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>

          <div className="bg-amber-500/5 rounded-[40px] p-10 border border-amber-500/10 flex items-start gap-6">
             <div className="p-4 bg-amber-500 text-white rounded-[20px] shadow-lg shadow-amber-500/20">
                <ShieldCheck size={24} />
             </div>
             <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800 dark:text-white italic uppercase tracking-tighter">Güvenlik ve Yetki Onayı</h4>
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase italic">
                   Bu Merav (Saha Görevlisi) tescili ile ilgili personelin kurum su dağıtım sisteminde tahsilat yapma ve sulama kayıtlarını yönetme yetkisi onaylanacaktır. Lütfen bilgilerin doğruluğunu teyit ediniz.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
