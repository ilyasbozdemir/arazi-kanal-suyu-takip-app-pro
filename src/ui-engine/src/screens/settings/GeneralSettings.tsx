import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Code, Database, HardDrive, RefreshCw, Maximize2, Type, Layout } from 'lucide-react'
import { ElectronService } from '../../services/ElectronService'
import { useAppStore } from '../../store/useAppStore'
import { DollarSign, ShieldCheck, ArrowRight, X } from 'lucide-react'
import { FONT_SIZE_MAP } from '../../config/uiConfig'

interface GeneralSettingsProps {
  localDevMode: boolean
  handleToggleDev: () => void
}

export const GeneralSettings: FC<GeneralSettingsProps> = ({ localDevMode, handleToggleDev }) => {
  const uiConfig = useAppStore(state => state.uiConfig);
  const updateUIConfig = useAppStore(state => state.updateUIConfig);
  const accountingEnabled = useAppStore(state => state.accountingEnabled);
  const setAccountingEnabled = useAppStore(state => state.setAccountingEnabled);

  const [dbPath, setDbPath] = useState<string>('Yükleniyor...');
  const [dDriveExists, setDDriveExists] = useState<boolean>(false);
  const [recommendedPath, setRecommendedPath] = useState<string | null>(null);

  const [hwConfig, setHwConfig] = useState<any>({
    performanceMode: 'HIGH',
    disableGPU: false,
    ramLimitMB: 2048,
    lowGraphics: false,
    defaultFontSize: 'normal',
    defaultUIScale: 1.0
  });

  useEffect(() => {
    loadDbPath();
    checkDDriveStatus();
    loadHardwareConfig();
  }, []);

  const loadHardwareConfig = async () => {
    if ((window as any).api?.getHardwareConfig) {
      const config = await (window as any).api.getHardwareConfig();
      setHwConfig(config);
      
      // Apply low graphics mode to body immediately
      if (config.lowGraphics) {
        document.body.classList.add('performance-low');
      } else {
        document.body.classList.remove('performance-low');
      }
    }
  };

  const updateHardwareConfig = async (updates: any) => {
    const newConfig = { ...hwConfig, ...updates };
    setHwConfig(newConfig);
    
    if (updates.lowGraphics !== undefined) {
      if (updates.lowGraphics) document.body.classList.add('performance-low');
      else document.body.classList.remove('performance-low');
    }

    if ((window as any).api?.saveHardwareConfig) {
      const success = await (window as any).api.saveHardwareConfig(newConfig);
      if (success && (updates.performanceMode !== undefined || updates.disableGPU !== undefined || updates.ramLimitMB !== undefined)) {
        ElectronService.showAlert({ 
          title: 'SİSTEM AYARI DEĞİŞTİ', 
          message: 'Donanım seviyesindeki değişikliklerin (GPU, RAM vb.) tam uygulanması için uygulamanın yeniden başlatılması gerekmektedir.', 
          type: 'info' 
        });
      }
    }
  };

  const loadDbPath = async () => {
    const path = await ElectronService.getDbPath();
    setDbPath(path);
  };

  const checkDDriveStatus = async () => {
    const exists = await (window as any).api.checkDDrive();
    setDDriveExists(exists);
    if (exists) {
      const path = await (window as any).api.getRecommendedPath();
      setRecommendedPath(path);
    }
  };

  const handleMoveToSafeZone = async () => {
    if (!recommendedPath) return;
    const confirm = await (window as any).api.showConfirm({
      title: 'GÜVENLİ BÖLGEYE TAŞI',
      message: `Veritabanınız D:/ sürücüsündeki korumalı alana taşınacaktır. Uygulama yeniden başlatılacaktır. Onaylıyor musunuz?\n\nHedef: ${recommendedPath}`,
      type: 'question'
    });

    if (confirm) {
      // Move database logic in main handler already handles path selection if we call it differently
      // But here we want to force the recommended path. 
      // I'll update the move-database handler to accept an optional path.
      const res = await (window as any).api.moveDatabase(recommendedPath);
      if (res && !res.success && res.message) {
        ElectronService.showAlert({ title: 'HATA', message: res.message, type: 'error' });
      }
    }
  };

  const handleMoveDb = async () => {
    const res = await ElectronService.moveDatabase();
    if (res && !res.success && res.message) {
      ElectronService.showAlert({ title: 'HATA', message: res.message, type: 'error' });
    }
  };

  const handleUpdateLocation = async () => {
    const res = await ElectronService.updateDatabaseLocation();
    if (res && !res.success && res.message) {
      ElectronService.showAlert({ title: 'HATA', message: res.message, type: 'error' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary-500 text-white rounded-3xl"><Settings size={24} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Genel Uygulama Ayarları</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Arayüz ve Performans</p>
        </div>
      </div>

      {/* VERİTABANI KONUMU KARTI */}
      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Database size={20} /></div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase">Veritabanı Yönetimi</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Depolama ve Konum Ayarları</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3 overflow-hidden">
              <HardDrive size={14} className="text-slate-400 shrink-0" />
              <p className="text-[10px] font-mono text-slate-500 truncate select-all" title={dbPath}>{dbPath}</p>
           </div>
           <div className="flex gap-2 shrink-0">
              <button 
                onClick={handleUpdateLocation}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <RefreshCw size={12} />
                KONUMU GÜNCELLE
              </button>
              <button 
                onClick={handleMoveDb}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
              >
                VERİTABANINI TAŞI
              </button>
           </div>
        </div>

        {dDriveExists && !dbPath.startsWith('D:') && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-500">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                   <HardDrive size={24} />
                </div>
                <div>
                   <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">D:/ Sürücüsü Tespit Edildi!</p>
                   <p className="text-[10px] font-medium text-emerald-600/70 uppercase tracking-widest mt-0.5 max-w-md">Veritabanını güvenli bölgeye (D:/) taşıyarak yanlışlıkla silinmesini engelleyebilir ve performans artışı sağlayabilirsiniz.</p>
                </div>
             </div>
             <button 
                onClick={handleMoveToSafeZone}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
             >
                GÜVENLİ BÖLGEYE TAŞI
             </button>
          </div>
        )}
      </div>

      {/* 🚀 DONANIM VE PERFORMANS KARTI */}
      <div className="p-8 bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl border border-amber-500/20 space-y-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20"><RefreshCw size={20} /></div>
           <div>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase">Donanım ve Performans (Low-End Support)</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Eski Nesil Cihazlar İçin Optimizasyon</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Mod Seçimi */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Çalışma Modu</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Sistem önceliği</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                 <button 
                   onClick={() => updateHardwareConfig({ performanceMode: 'HIGH' })}
                   className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${hwConfig.performanceMode === 'HIGH' ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' : 'text-slate-400'}`}
                 >
                   Yüksek
                 </button>
                 <button 
                   onClick={() => updateHardwareConfig({ performanceMode: 'LOW' })}
                   className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${hwConfig.performanceMode === 'LOW' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400'}`}
                 >
                   Düşük
                 </button>
              </div>
           </div>

           {/* Görsel Efektler */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Görsel Efektler</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Blur, Animasyon ve Gölgeler</p>
              </div>
              <button 
                onClick={() => updateHardwareConfig({ lowGraphics: !hwConfig.lowGraphics })}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hwConfig.lowGraphics ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
              >
                {hwConfig.lowGraphics ? 'KISITLI' : 'STANDART'}
              </button>
           </div>

           {/* GPU Hızlandırma */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">GPU (Ekran Kartı)</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Hardware Acceleration</p>
              </div>
              <button 
                onClick={() => updateHardwareConfig({ disableGPU: !hwConfig.disableGPU })}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hwConfig.disableGPU ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
              >
                {hwConfig.disableGPU ? 'DEVRE DIŞI' : 'AKTİF'}
              </button>
           </div>

           {/* RAM Limiti */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">RAM Sınırı (JS Heap)</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Uygulama bellek limiti</p>
              </div>
              <select 
                title="RAM Sınırı Seçin"
                value={hwConfig.ramLimitMB}
                onChange={(e) => updateHardwareConfig({ ramLimitMB: parseInt(e.target.value) })}
                className="bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 outline-none border-none"
              >
                <option value={1024}>1 GB (Ekonomik)</option>
                <option value={2048}>2 GB (Önerilen)</option>
                <option value={4096}>4 GB (Standart)</option>
                <option value={8192}>8 GB (Performans)</option>
              </select>
           </div>

           {/* Varsayılan Font Boyutu */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Varsayılan Yazı Boyutu</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Donanım açılış değeri</p>
              </div>
              <select 
                title="Yazı Boyutu Seçin"
                value={hwConfig.defaultFontSize}
                onChange={(e) => updateHardwareConfig({ defaultFontSize: e.target.value })}
                className="bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 outline-none border-none"
              >
                <option value="small">Küçük</option>
                <option value="normal">Normal</option>
                <option value="large">Büyük</option>
                <option value="xlarge">Çok Büyük</option>
              </select>
           </div>

           {/* Varsayılan Ölçek */}
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Varsayılan Ekran Ölçeği</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Donanım açılış değeri</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-primary-500">{(hwConfig.defaultUIScale || 1.0).toFixed(2)}x</span>
                <input 
                  type="range" min="0.8" max="1.2" step="0.05"
                  title="Ekran Ölçeği Ayarla"
                  value={hwConfig.defaultUIScale || 1.0}
                  onChange={(e) => updateHardwareConfig({ defaultUIScale: parseFloat(e.target.value) })}
                  className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-amber-500/10">
          <p className="text-[9px] text-amber-600/70 font-bold uppercase italic tracking-tighter text-left max-w-md">
            * 4GB RAM ve 96MB VRAM'li eski i5 cihazlar için 'Düşük Mod', 'Kısıtlı Efekt' ve '1GB RAM' ayarları önerilir.
          </p>
          <button 
            onClick={() => {
              updateUIConfig({ 
                fontSize: hwConfig.defaultFontSize, 
                uiScale: hwConfig.defaultUIScale 
              });
              ElectronService.showAlert({ 
                title: 'VARSAYILANLAR UYGULANDI', 
                message: `Donanım dosyasına kayıtlı olan ${hwConfig.defaultFontSize} yazı boyutu ve ${hwConfig.defaultUIScale}x ölçeği mevcut oturuma uygulandı.`, 
                type: 'success' 
              });
            }}
            className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-amber-500/20"
          >
            <RefreshCw size={14} />
            DONANIM AYARLARINI UI'A AKTAR
          </button>
        </div>
      </div>

      {/* DEV MODE KARTI */}
      <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Code size={20} /></div>
           <div>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase">Geliştirici Modu (DevMode)</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Teknik Ayarlar ve Log Erişimi</p>
           </div>
        </div>
        <button 
          onClick={handleToggleDev}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localDevMode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}
        >
          {localDevMode ? 'AKTİF' : 'PASİF'}
        </button>
      </div>
      
      {/* 💰 MUHASEBE MODÜLÜ KARTI */}
      <div className={`p-8 rounded-3xl border transition-all duration-500 ${accountingEnabled ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${accountingEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Muhasebe & Finans Modülü</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Ücret Tarifeleri, Borç ve Tahsilat Takibi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest ${accountingEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
              {accountingEnabled ? 'AKTİF (ÜCRETLİ TAKİP)' : 'PASİF (SADECE KAYIT)'}
            </span>
            <button 
              onClick={() => setAccountingEnabled(!accountingEnabled)}
              title={accountingEnabled ? "Muhasebe Modülünü Kapat" : "Muhasebe Modülünü Aç"}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${accountingEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <motion.div 
                animate={{ x: accountingEnabled ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>
        
        {!accountingEnabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4"
          >
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><X size={16} /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed italic">
              * MODÜL KAPALIYKEN SADECE ARAZİ VE SULAMA KAYITLARI TUTULUR. PARA, FAİZ VE MAKBUZ DEFTERİ GİBİ MİMARİLER GİZLENİR.
            </p>
          </motion.div>
        )}
      </div>

      {/* 🚀 ARAYÜZ VE GÖRÜNÜM AYARLARI */}
      <div className="p-8 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-3xl border border-indigo-500/20 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
            <Layout size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-white uppercase">Arayüz ve Görünüm</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Ekran Ölçekleme ve Tipografi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UI SCALE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Maximize2 size={14} className="text-indigo-500" />
                <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-300">Ekran Ölçeği</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500 text-white px-2 py-0.5 rounded-lg">{uiConfig.uiScale.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="0.8" max="1.2" step="0.05"
              value={uiConfig.uiScale}
              onChange={(e) => updateUIConfig({ uiScale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[9px] text-slate-400 uppercase font-bold italic tracking-tighter">Büyük ekranlarda daha çok veri görmek için 0.90x önerilir.</p>
          </div>

          {/* FONT SIZE */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Type size={14} className="text-indigo-500" />
               <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-300">Yazı Büyüklüğü</span>
             </div>
             <div className="flex gap-2">
               {Object.keys(FONT_SIZE_MAP).map(size => (
                 <button
                   key={size}
                   onClick={() => updateUIConfig({ fontSize: size as any })}
                   className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${uiConfig.fontSize === size ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                 >
                   {size}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

