import { useState, FC } from 'react'
import { Mail, ShieldAlert as ShieldIcon, Eye, EyeOff, FolderOpen, Lock, Save, Database, Activity, Download, Upload, Clock } from 'lucide-react'
import { ElectronService } from '../../services/ElectronService'

interface BackupSettingsProps {
  smtpConfig: any
  setSmtpConfig: (config: any) => void
  handleSendBackup: () => void | Promise<void>
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void
  dbPath: string
}

export const BackupSettings: FC<BackupSettingsProps> = ({ smtpConfig, setSmtpConfig, handleSendBackup, showAlert, dbPath }) => {
  const [showPass, setShowPass] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [jsonInput, setJsonInput] = useState('')

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setSmtpConfig({ ...smtpConfig, ...parsed });
      showAlert('JSON İÇE AKTARILDI', 'JSON verisindeki ayarlar forma yansıtıldı. Kaydet butonuna basarak kalıcı hale getirebilirsiniz.', 'success');
      setJsonInput('');
    } catch (e: any) {
      showAlert('HATA', 'Geçersiz JSON formatı: ' + e.message, 'error');
    }
  }

  const handleSaveConfig = async () => {
    try {
      const res = await ElectronService.saveMailSettings(smtpConfig);
      if (res.success) {
        showAlert('KAYIT BAŞARILI', 'Tüm SMTP ve yedekleme ayarları sistem bir disiplinle güncellendi.', 'success');
      } else {
        throw new Error(res.message || 'Ayarlar kaydedilemedi.');
      }
    } catch (e: any) {
      showAlert('HATA', 'Ayarlar kaydedilemedi: ' + e.message, 'error');
    }
  }

  const handleTestEmail = async () => {
    setIsSyncing(true);
    try {
      const res = await ElectronService.sendTestEmail(smtpConfig);
      if (res.success) {
        showAlert('TEST BAŞARILI', 'Test e-postası başarıyla gönderildi. Bağlantı başarılı!', 'success');
      } else {
        throw new Error(res.message || 'Bilinmeyen bir hata oluştu.');
      }
    } catch (e: any) {
      showAlert('BAĞLANTI HATASI', e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  }

  const setFastSmtp = (type: string) => {
    const profiles: Record<string, any> = {
      gmail: { smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_secure: 'false' },
      yandex: { smtp_host: 'smtp.yandex.com', smtp_port: '465', smtp_secure: 'true' },
      personal_outlook: { smtp_host: 'smtp-mail.outlook.com', smtp_port: '587', smtp_secure: 'false' },
      business_office365: { smtp_host: 'smtp.office365.com', smtp_port: '587', smtp_secure: 'false' }
    };

    if (profiles[type]) {
      setSmtpConfig({ ...smtpConfig, ...profiles[type] });
    }
  }

  const selectedProfile = Object.keys({
    gmail: { host: 'smtp.gmail.com', port: '587' },
    yandex: { host: 'smtp.yandex.com', port: '465' },
    personal_outlook: { host: 'smtp-mail.outlook.com', port: '587' },
    business_office365: { host: 'smtp.office365.com', port: '587' }
  }).find(id => {
    const p = ({
      gmail: { host: 'smtp.gmail.com' },
      yandex: { host: 'smtp.yandex.com' },
      personal_outlook: { host: 'smtp-mail.outlook.com' },
      business_office365: { host: 'smtp.office365.com' }
    } as any)[id];
    return smtpConfig.smtp_host === p.host;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* GÜVENLİK ÖZETİ & HIZLI GERİ YÜKLEME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[32px] border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-3 mb-4 text-rose-500">
            <ShieldIcon size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">kurum KVKK & Gizlilik Protokolü</span>
          </div>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed uppercase opacity-80">
            Bulut yedekleme sırasında hassas veriler (TCKN, İsim) maskelenir ve tüm veritabanı AES-256 algoritmasıyla şifrelenerek iletilir.
          </p>
        </div>

        <div className="p-8 bg-slate-900 text-white rounded-[32px] border border-white/5 flex flex-col justify-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
            <Download size={60} />
          </div>
          <div className="relative z-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">HIZLI KURTARMA</h4>
            <button 
              onClick={async () => {
                const confirm = await ElectronService.showConfirm({
                  title: 'YEDEKTEN GERİ YÜKLEME',
                  message: 'Seçilen yedek dosyası (.zip.aes) mevcut verilerin üzerine yazılacaktır. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
                  type: 'warning'
                });
                if (!confirm) return;

                setIsSyncing(true);
                try {
                  const res = await ElectronService.restoreBackupFromFile();
                  if (res.success) {
                    showAlert('BAŞARILI', res.message, 'success');
                  } else if (res.message !== 'İşlem iptal edildi.') {
                    throw new Error(res.message);
                  }
                } catch (e: any) {
                  showAlert('HATA', 'Geri yükleme başarısız: ' + e.message, 'error');
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-rose-900/40"
            >
              <Download size={16} /> {isSyncing ? 'İŞLENİYOR...' : 'YEDEKTEN GERİ YÜKLE (.ZIP.AES)'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* SMTP AYARLARI KARTI */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center shadow-inner">
              <Mail size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">SMTP Servis Ayarları</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">E-posta gönderimi için sunucu kimlik bilgileri.</p>
            </div>
            <button 
              type="button"
              title="SMTP Ayarlarını Kaydet"
              onClick={handleSaveConfig}
              className="ml-auto px-6 py-3 bg-white dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 hover:text-white text-emerald-500 font-black text-[10px] rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500 transition-all active:scale-95 flex items-center gap-2"
            >
              <Save size={14} /> KAYDET
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SMTP SUNUCUSU</label>
              <input 
                value={smtpConfig.smtp_host || ''} 
                onChange={e => setSmtpConfig({ ...smtpConfig, smtp_host: e.target.value })}
                placeholder="Örn: smtp.gmail.com"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">PORT</label>
              <input 
                type="number"
                title="SMTP Port Numarası"
                value={smtpConfig.smtp_port || ''} 
                onChange={e => setSmtpConfig({ ...smtpConfig, smtp_port: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">GÖNDERİCİ E-POSTA</label>
              <input 
                value={smtpConfig.smtp_user || ''} 
                onChange={e => setSmtpConfig({ ...smtpConfig, smtp_user: e.target.value })}
                placeholder="kurum@kurum.gov.tr"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">HEDEF E-POSTA</label>
              <input 
                value={smtpConfig.backup_email || ''} 
                onChange={e => setSmtpConfig({ ...smtpConfig, backup_email: e.target.value })}
                placeholder="yedek@kurum.gov.tr"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">UYGULAMA ŞİFRESİ</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                value={smtpConfig.smtp_pass || ''} 
                onChange={e => setSmtpConfig({ ...smtpConfig, smtp_pass: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-rose-500/20 rounded-2xl outline-none font-bold text-sm dark:text-white transition-all"
              />
              <button 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">HIZLI PROFİLLER / JSON AKTARIMI</label>
              <button 
                onClick={handleImportJson}
                disabled={!jsonInput}
                className="text-[9px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest disabled:opacity-30 transition-all"
              >
                JSON'DAN AKTAR
              </button>
            </div>
            
            <textarea 
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder='{ "smtp_host": "...", "smtp_user": "..." }'
              className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl outline-none font-mono text-[10px] dark:text-slate-400 focus:border-primary-500/30 transition-all resize-none"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'gmail', label: 'GMAIL', color: '#ea4335' },
                { id: 'yandex', label: 'YANDEX', color: '#ffcc00' },
                { id: 'personal_outlook', label: 'OUTLOOK', color: '#0078d4' },
                { id: 'business_office365', label: 'OFFICE 365', color: '#d83b01' }
              ].map(prof => (
                <button 
                  key={prof.id} 
                  onClick={() => setFastSmtp(prof.id)}
                  style={{ 
                    borderColor: selectedProfile === prof.id ? prof.color : 'transparent',
                    background: selectedProfile === prof.id ? `${prof.color}10` : '',
                    color: selectedProfile === prof.id ? prof.color : ''
                  }}
                  className={`px-4 py-4 rounded-2xl border-2 text-[10px] font-black transition-all active:scale-95 ${selectedProfile === prof.id ? '' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  {prof.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* YEDEKLEME VE TEST KARTI */}
        <div className="flex flex-col gap-8">
            <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-700">
                <Database size={100} />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary-500/20 text-primary-400 rounded-2xl">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Bulut Yedekleme</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">kurum Veri Güvenliği Paneli</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleTestEmail}
                    disabled={isSyncing}
                    className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${isSyncing ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'}`}
                  >
                    <Mail size={18} /> {isSyncing ? 'BAĞLANTI TEST EDİLYOR...' : 'E-POSTA BAĞLANTI TESTİ'}
                  </button>

                  <button 
                    onClick={async () => {
                      const res = await ElectronService.sendBackupEmail();
                      if (res.success) showAlert('BAŞARILI', 'Veritabanı yedeği belirtilen adrese başarıyla gönderildi.', 'success');
                      else showAlert('HATA', 'Yedek gönderilemedi: ' + res.message, 'error');
                    }}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                  >
                    <Upload size={18} /> YEDEĞİ ŞİMDİ E-POSTA İLE GÖNDER
                  </button>

                  <button 
                    onClick={handleSendBackup}
                    className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/5 flex items-center justify-center gap-3"
                  >
                    <Clock size={18} /> MANUEL LOKAL YEDEK (.DB)
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    * E-posta ile yedekleme yapıldığında dosya sistem tarafından otomatik olarak AES-256 ile şifrelenir. 
                    Veritabanı dosyası güvenli sunucularda saklanır.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-primary-500/30 transition-all" onClick={() => (window as any).api.openDbFolder()}>
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <FolderOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Veritabanı Klasörünü Aç</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lokal .db dosyasına erişim</p>
                  </div>
               </div>
               <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                  <Download size={20} />
               </div>
            </div>
        </div>
      </div>
    </div>
  )
}

