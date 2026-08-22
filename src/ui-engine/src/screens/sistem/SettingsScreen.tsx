import { useState, useEffect, FC } from 'react'
import {
  Settings,
  Users,
  Mail,
  Code,
  ShieldCheck,
  User,
  Building2,
  ShieldAlert as ShieldIcon,
  History as HistoryIcon,
  MapPin
} from 'lucide-react'

// Sub-components
import { SecurityProfile } from '../settings/SecurityProfile'
import { LegalSettings } from '../settings/LegalSettings'
import { GeneralSettings } from '../settings/GeneralSettings'
import { GenderSettings } from '../settings/GenderSettings'
import { AuditSettings } from '../settings/AuditSettings'
import { DeveloperSettings } from '../settings/DeveloperSettings'
import { SecuritySettings } from '../settings/SecuritySettings'
import { ImportSettings } from '../settings/ImportSettings'
import { BackupSettings } from '../settings/BackupSettings'
import { IdentitySettings } from '../settings/components/IdentitySettings'
import { ChangelogScreen } from '../settings/ChangelogScreen'
import { LocationSettings } from './components/LocationSettings'

interface SettingsScreenProps {
  settingsTab: 'profile' | 'general' | 'gender' | 'import' | 'backup' | 'developer' | 'security_legal' | 'audit' | 'identity' | 'changelog' | 'location'
  setSettingsTab: (tab: any) => void
  onRefresh: () => void | Promise<void>
  handleSendBackup: () => void | Promise<void>
  dbPath: string
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void
  devMode?: boolean
}

export const SettingsScreen: FC<SettingsScreenProps> = ({
  settingsTab,
  setSettingsTab,
  onRefresh,
  handleSendBackup,
  dbPath,
  showAlert,
  devMode = false
}) => {
  const [localDevMode, setLocalDevMode] = useState(devMode)
  const [smtpConfig, setSmtpConfig] = useState<any>({})

  const handleToggleDev = async () => {
    const newVal = !localDevMode;
    setLocalDevMode(newVal);
    localStorage.setItem('dev_mode', newVal ? 'true' : 'false');
    
    if ((window as any).api?.updateSetting) {
      await (window as any).api.updateSetting('dev_mode', newVal ? 'true' : 'false');
    }

    showAlert('SİSTEM GÜNCELLENDİ', `Geliştirici modu ${newVal ? 'aktif edildi' : 'kapatıldı'}. Değişikliklerin tam uygulanması için menüler arası geçiş yapabilirsiniz.`, 'info');
  }

  useEffect(() => {
    const fetchData = async () => {
      const res = await (window as any).api.getSettings()
      if (res.success && res.settings) {
        setSmtpConfig(res.settings)
      }
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'profile', label: 'PROFİL & GÜVENLİK', icon: User },
    { id: 'general', label: 'GENEL', icon: Settings },
    { id: 'gender', label: 'CİNSİYET ANALİZİ', icon: Users },
    { id: 'developer', label: 'GELİŞTİRİCİ', icon: Code },
    { id: 'security_legal', label: 'GÜVENLİK & YASAL', icon: ShieldCheck },
    { id: 'backup', label: 'YEDEKLEME & MAIL', icon: Mail },
    { id: 'identity', label: 'KURUMSAL KİMLİK', icon: Building2 },
    { id: 'location', label: 'BÖLGE TANIMLARI', icon: MapPin },
    { id: 'audit', label: 'VERİ DENETİMİ', icon: ShieldIcon },
    { id: 'changelog', label: 'SÜRÜM NOTLARI', icon: HistoryIcon },
  ];

  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col p-8 overflow-y-auto custom-scrollbar">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mb-2">SİSTEM</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ayarlar & Parametreler</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${settingsTab === tab.id
                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 translate-x-2'
                : 'bg-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
            >
              <tab.icon size={18} className={settingsTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 px-4 border-t border-slate-100 dark:border-white/5">
           <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">OTURUM GÜVENLİĞİ</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Aktif Yönetici Oturumu</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20 p-12">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {settingsTab === 'profile' && <SecurityProfile />}
          {settingsTab === 'general' && <GeneralSettings localDevMode={localDevMode} handleToggleDev={handleToggleDev} />}
          {settingsTab === 'gender' && <GenderSettings onRefresh={onRefresh} />}
          {settingsTab === 'audit' && <AuditSettings />}
          {settingsTab === 'developer' && <DeveloperSettings dbPath={dbPath} />}
          {settingsTab === 'security_legal' && (
            <div className="space-y-12">
              <SecuritySettings />
              <LegalSettings />
            </div>
          )}
          {settingsTab === 'import' && <ImportSettings showAlert={showAlert} onRefresh={onRefresh} />}
          {settingsTab === 'backup' && <BackupSettings smtpConfig={smtpConfig} setSmtpConfig={setSmtpConfig} handleSendBackup={handleSendBackup} showAlert={showAlert} dbPath={dbPath} />}
          {settingsTab === 'identity' && <IdentitySettings />}
          {settingsTab === 'location' && <LocationSettings />}
          {settingsTab === 'changelog' && <ChangelogScreen />}
        </div>
      </div>
    </div>
  )
}
