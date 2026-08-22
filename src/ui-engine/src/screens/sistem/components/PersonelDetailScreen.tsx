import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, Phone, Mail, Award, Save, ShieldCheck, ChevronRight
} from "lucide-react";
import { FieldRenderer } from "../../../components/detail/FieldRenderer";
import { useRecordDetail } from "../../../hooks/useRecordDetail";
import { DetailHeader } from "../../../components/detail/DetailHeader";

export const PersonelDetailScreen: React.FC<any> = (props) => {
  const { table, type, data, citizens, locations, onRefresh, onClose, inline } = props;
  const logic = useRecordDetail(table, type, data, false, onRefresh, onClose);
  
  const { 
    values = {}, setValues, isEditing, setIsEditing, activeTab, setActiveTab,
    isProcessing, isFormValid, touched, onFieldBlur, onSaveRecord, onDeleteRecord
  } = logic;

  const linkedCitizen = (citizens || []).find((c: any) => c.TCKN === values.Vatandas_Id);

  const translateHeader = (h: string) => {
    const dict: any = { 
      "Vatandas_Id": "T.C. KİMLİK NO",
      "Unvan": "GÖREV / UNVAN",
      "Aktif": "DURUM"
    };
    return dict[h] || h;
  };

  const renderField = (field: string) => (
    <FieldRenderer 
      key={field} field={field} isEditing={isEditing} values={values} setValues={setValues}
      table={table} type={type as any} translateHeader={translateHeader}
      renderTooltip={() => null}
      isRequiredFieldEmpty={(f) => (type === 'create' || isEditing) && !values[f]}
      isTouched={touched[field]}
      onBlur={() => onFieldBlur(field)}
      vatandaslar={citizens} 
      mevkiler={locations}
    />
  );

  if (isEditing) {
    return (
      <div className="h-full w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden animate-in fade-in duration-500">
        <div className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col p-8 overflow-y-auto custom-scrollbar">
           <div className="mb-10 px-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20">
                    <User size={18} />
                 </div>
                 <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                    {type === 'create' ? 'YENİ PERSONEL' : 'PERSONEL DÜZENLE'}
                 </h1>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">KURUMSAL PERSONEL TESCİLİ</p>
           </div>
           <nav className="space-y-3">
              <button className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 translate-x-2">
                 <Briefcase size={18} /> 01. ÖZLÜK BİLGİLERİ
              </button>
           </nav>
           <div className="mt-auto pt-8 px-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setIsEditing(false)} className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors text-left">
                 İPTAL ET VE DÖN
              </button>
           </div>
        </div>

        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-12">
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-white/5 shadow-2xl space-y-10">
                 <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-8">
                    <div>
                       <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Özlük Bilgileri</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">PERSONEL KAYIT PANELİ</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {['Vatandas_Id', 'Unvan', 'Telefon', 'Eposta', 'Aktif'].map(f => renderField(f))}
                 </div>
              </div>

              <div className="mt-20 flex items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl">
                 <button 
                   disabled={isProcessing || !isFormValid} 
                   onClick={onSaveRecord} 
                   className={`px-16 py-6 font-black rounded-[28px] shadow-2xl transition-all text-sm tracking-[0.1em] uppercase flex items-center gap-4 ${
                     isFormValid ? "bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-[1.05]" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                   }`}
                 >
                   {isProcessing ? "İŞLENİYOR..." : "PERSONEL KAYDINI ONAYLA"} <Save size={20} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden">
      <DetailHeader 
        table={table} type={type} isEditing={isEditing} values={values} 
        activeTab={activeTab} setActiveTab={setActiveTab} setIsEditing={setIsEditing} 
        onSaveRecord={onSaveRecord} onDeleteRecord={onDeleteRecord}
        onClose={onClose} inline={inline} translateHeader={translateHeader}
        setValues={setValues} data={data} isProcessing={isProcessing} isFormValid={isFormValid}
        title={linkedCitizen ? `${linkedCitizen.Ad} ${linkedCitizen.Soyad}` : "Personel Kartı"}
        subtitle="Kurum Kurumsal Personel Yönetim Paneli"
        icon={User}
        tabs={[
          { id: 'genel', label: 'GENEL BİLGİLER', icon: Briefcase },
        ]}
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center text-indigo-500">
                <User size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                {linkedCitizen ? `${linkedCitizen.Ad} ${linkedCitizen.Soyad}` : "BİLİNMİYOR"}
              </h3>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${values.Aktif === 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {values.Aktif === 0 ? 'PASİF' : 'AKTİF'}
              </div>
            </div>
            <div className="md:col-span-3 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 shadow-2xl">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b pb-4 mb-6">Personel Özlük Detayları</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Vatandas_Id', 'Unvan', 'Telefon', 'Eposta', 'Aktif'].map(f => renderField(f))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
