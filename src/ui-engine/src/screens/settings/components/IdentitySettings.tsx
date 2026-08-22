import React, { useState, useEffect } from 'react';
import { Building2, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { ElectronService } from '../../../services/ElectronService';
import { useAppStore } from '../../../store/useAppStore';

export const IdentitySettings: React.FC<any> = () => {
  const [kurumAdi, setKurumAdi] = useState('');
  const [kurumLogo, setKurumLogo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { refreshIdentity } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      const res = await (window as any).api.getSettings();
      if (res.success && res.settings) {
        setKurumAdi(res.settings.kurum_adi || '');
        setKurumLogo(res.settings.kurum_logo || '');
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await (window as any).api.updateSetting('kurum_adi', kurumAdi);
    await (window as any).api.updateSetting('kurum_logo', kurumLogo);
    
    // 🔥 Re-Sync Global Store instantly
    await refreshIdentity();
    if (kurumLogo) {
       await (window as any).api.windowControls.setWindowIcon(kurumLogo);
    }
    
    setIsSaving(false);
    (window as any).api.showAlert({ message: 'Kurumsal kimlik bilgileri güncellendi.', type: 'success' });
  };

  const handlePickLogo = async () => {
    const base64 = await (window as any).api.pickLogo();
    if (base64) {
      setKurumLogo(base64);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <Building2 size={24} className="text-primary-500" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic leading-none">Kurumsal Bilgiler</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Uygulama Kimliğini Yönetin</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">KURUM ADI / UYGULAMA BAŞLIĞI</label>
            <input 
              type="text" 
              value={kurumAdi}
              onChange={(e) => setKurumAdi(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-2xl text-xl font-black outline-none border-2 border-transparent focus:border-primary-500 transition-all shadow-inner"
              placeholder="Örn: KURUM ADI"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">KURUM LOGOSU (BASE64)</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePickLogo}
                className="flex-1 flex items-center justify-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary-500 transition-all border-2 border-dashed border-slate-200 dark:border-white/10 group"
              >
                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">LOGOYU BİLGİSAYARDAN SEÇ</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-5 bg-primary-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            KİMLİĞİ KAYDET VE UYGULA
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/40 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-white/5">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">LOGO ÖNİZLEME (DYNAMIC PREVIEW)</span>
         <div className="group relative w-64 h-64 bg-white dark:bg-slate-800 rounded-[48px] shadow-2xl flex items-center justify-center border border-white/10 overflow-hidden ring-8 ring-slate-100 dark:ring-white/5">
            {kurumLogo ? (
              <img src={kurumLogo} alt="LOGO PREVIEW" className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-200 dark:text-slate-800">
                 <ImageIcon size={80} strokeWidth={1} />
                 <span className="text-[10px] font-black tracking-widest uppercase">LOGO SEÇİLMEDİ</span>
              </div>
            )}
         </div>
         <h4 className="mt-8 text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic text-center leading-tight">
            {kurumAdi || 'KURUM ADI BEKLENİYOR...'}
         </h4>
         <div className="mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
            SİSTEM KİMLİĞİ AKTİF
         </div>
      </div>
    </div>
  );
};

