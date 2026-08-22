import { useState, useEffect, FC } from 'react'
import { User, ShieldCheck, Key, Eye, EyeOff, Lock, Database, FolderOpen } from 'lucide-react'

export const SecurityProfile: FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [vaultInfo, setVaultInfo] = useState<any>(null)

  useEffect(() => {
    const checkPass = async () => {
      const res = await (window as any).api.verifyAppPassword('')
      if (!res.empty) setHasPassword(true)
    }
    checkPass()
  }, [])

  useEffect(() => {
    const fetchVault = async () => {
      const res = await (window as any).api.getVaultInfo()
      if (res.success) setVaultInfo(res)
    }
    fetchVault()
  }, [])

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      (window as any).showAlert("HATA", "Şifreler uyuşmuyor!", "error")
      return
    }
    if (password.length < 4) {
      (window as any).showAlert("HATA", "Şifre en az 4 karakter olmalıdır.", "error")
      return
    }
    const res = await (window as any).api.updateSetting('app_password', password)
    if (res.success) {
      (window as any).showAlert("BAŞARILI", "Uygulama şifresi güncellendi. Artık hassas alanlara erişim için bu şifre gerekecektir.", "success")
      setHasPassword(true)
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-500 text-white rounded-3xl"><User size={24} /></div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Kullanıcı Profili & Güvenlik</h3>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Sistem Yetkilendirme Kontrolü</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-indigo-500" />
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Giriş Şifresi</h4>
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight opacity-75">
            {hasPassword
              ? "Sisteminiz şu an bir şifre ile korunmaktadır. Hassas alanlara erişim için bu şifre gerekecektir."
              : "Sistem güvenliğinizi artırmak için dilediğiniz zaman bir şifre belirleyebilirsiniz."}
          </p>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4 opacity-50 pointer-events-none grayscale">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">YENİ ŞİFRE (Kilitli)</label>
              <div className="relative">
                <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold text-sm" placeholder="Şifre Değişimi Devre Dışı" disabled />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-all" disabled>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ŞİFRE TEKRAR (Kilitli)</label>
              <div className="relative">
                <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type={showPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold text-sm" placeholder="Şifre Değişimi Devre Dışı" disabled />
              </div>
            </div>
            <button onClick={handleUpdatePassword} disabled className="w-full py-4 bg-slate-400 text-white font-black rounded-xl cursor-not-allowed transition-all text-[10px] uppercase tracking-widest shadow-lg">
              YÖNETİCİ TARAFINDAN KİLİTLENDİ
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-blue-500" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Veri Güvenlik & Kasa (Vault)</h4>
            </div>
            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/30 space-y-4">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                Tüm hassas verileriniz (SMTP şifreleri, API keyler) veritabanında **AES-256-CBC** algoritması ile askeri düzeyde şifreli olarak saklanır.
              </p>
              {vaultInfo && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[9px] font-black text-blue-600 uppercase border-b border-blue-500/20 pb-2">
                    <span>ALGORİTMA</span>
                    <span>{vaultInfo.algorithm}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-blue-600 uppercase border-b border-blue-500/20 pb-2">
                    <span>KASA DURUMU</span>
                    <span className="text-emerald-500">{vaultInfo.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {vaultInfo && (
            <div className="p-8 bg-slate-50 dark:bg-slate-800/80 rounded-[32px] border border-slate-100 dark:border-slate-700/50 space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 bg-primary-500/10 text-primary-500 rounded-bl-3xl"><Database size={16} /></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kurtarma Anahtarı Bilgisi</h4>
              <p className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                Şifrenizi unutursanız, aşağıdaki konumda bulunan gizli anahtar (recovery key) ile veritabanınızı kurtarabilirsiniz. Bu dosyayı asla silmeyin!
              </p>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-400 uppercase">ANAHTAR KONUMU (GİZLİ):</p>
                  <button onClick={() => (window as any).api.openDbFolder()} className="flex items-center gap-1.5 text-[9px] font-black text-primary-500 hover:text-primary-600 uppercase transition-all">
                    <FolderOpen size={12} /> KLASÖRÜ AÇ
                  </button>
                </div>
                <p className="text-[10px] font-mono font-bold text-primary-600 break-all opacity-80">{vaultInfo.vaultPath}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase">KASA ID (HASH):</p>
                <p className="text-[10px] font-mono font-bold text-slate-500 break-all">{vaultInfo.keyHash}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

