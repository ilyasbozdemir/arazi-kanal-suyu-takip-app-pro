import React, { FC } from 'react';
import { 
  MapPin, Maximize2, Save, Layers, History, 
  UserPlus, Droplets, FileText, ShieldCheck
} from 'lucide-react';

interface TapuEditViewProps {
  values: any;
  setValues: (vals: any) => void;
  renderField: (field: string, config?: any) => JSX.Element;
  isProcessing: boolean;
  isFormValid: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const TapuEditView: FC<TapuEditViewProps> = ({ 
  values, renderField, isProcessing, isFormValid, onSave, onCancel 
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 🛡️ DÜZENLEME FORMU - KONUM */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl transition-all">
        <h3 className="flex items-center gap-3 text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em]">
          <MapPin size={18} /> KONUM VE BÖLGE TANIMI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderField("Mevki_id")}
          {renderField("Ada_Parsel")}
        </div>
      </div>

      {/* 🛡️ ALAN VE NİTELİK */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl transition-all">
        <h3 className="flex items-center gap-3 text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em]">
          <Maximize2 size={18} /> ALAN VE ARAZİ NİTELİĞİ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderField("Alan_m2")}
          {renderField("Nitelik")}
        </div>
      </div>

      {/* 🛡️ MÜLKİYET VE TEKNİK */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl transition-all">
        <h3 className="flex items-center gap-3 text-[11px] font-black text-violet-500 uppercase tracking-[0.3em]">
          <Layers size={18} /> MÜLKİYET YAPISI VE TEKNİK VERİLER
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderField("Aylik_Su_Hakki")}
          {renderField("Notlar")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderField("Kanal_Seviyesi_Altinda")}
          {renderField("Kanal_Suyu_Ile_Sulanan")}
        </div>
        <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">MÜLK SAHİPLERİ VE HİSSEDARLAR</p>
          {renderField("Hissedarlar_JSON")}
        </div>
      </div>

      {/* 🛡️ RESMİ KAYITLAR */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl transition-all">
        <h3 className="flex items-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
          <History size={18} /> RESMİ TAPU ARŞİV KAYITLARI
        </h3>
        <div className="grid grid-cols-2 gap-8">
          {renderField("Pafta")}
          {renderField("Cilt_Sayfa")}
          {renderField("Tasinmaz_No")}
          {renderField("Yevmiye_No")}
        </div>
      </div>

      {/* 🛡️ ZİLYET VE BAKICILAR */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-6 hover:shadow-xl transition-all">
        <h3 className="flex items-center gap-3 text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">
          <UserPlus size={18} /> ZİLYET VE BAKICILAR
        </h3>
        {renderField("Ilgili_Kisiler_JSON")}
      </div>

      {/* 🛡️ KAYDET BUTONU (Yüzer Panel) */}
      <div className="sticky bottom-8 z-50 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4 text-slate-400 px-4">
          <div className={`w-12 h-12 rounded-full border-2 border-dashed ${isFormValid ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-200'} flex items-center justify-center`}>
            {isFormValid ? <ShieldCheck size={24} /> : <FileText size={22} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
              {isFormValid ? 'TESCİLE HAZIR' : 'EKSİK BİLGİLERİ\nTAMAMLAYIN'}
            </p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Lütfen tüm zorunlu alanları kontrol edin.</p>
          </div>
        </div>

        <div className="flex gap-6">
          <button 
            onClick={onCancel} 
            className="px-10 py-5 font-black text-slate-400 hover:text-rose-500 text-[11px] uppercase tracking-widest transition-colors"
          >
            Vazgeç
          </button>
          <button 
            disabled={isProcessing || !isFormValid} 
            onClick={onSave} 
            className={`px-14 py-5 font-black rounded-[24px] shadow-xl transition-all text-xs tracking-widest uppercase flex items-center gap-4 ${
              isFormValid 
              ? "bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95" 
              : "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-50"
            }`}
          >
            {isProcessing ? "İŞLENİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"} <Save size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
