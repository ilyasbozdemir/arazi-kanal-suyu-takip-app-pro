import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Camera,
  Fingerprint,
  Mail,
  Phone,
  Save,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { ElectronService } from "../../services/ElectronService";

interface ProfileDetailsProps {
  onClose?: () => void;
}

export const ProfileDetailsScreen: React.FC<ProfileDetailsProps> = (
  { onClose },
) => {
  const { profile, refreshProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: profile.id || "",
    name: profile.name || "",
    title: profile.title || "",
    email: profile.email || "",
    phone: profile.phone || "",
    password: "",
    citizenId: profile.citizenId || "",
  });
  const [citizenData, setCitizenData] = useState<any | null>(null);

  // Bağlı Vatandaşın Verilerini Çek (Ad, Soyad, Telefon, Eposta)
  React.useEffect(() => {
    const fetchCitizenData = async () => {
      if (formData.citizenId) {
        const res = await (window as any).api.citizen.getByTckn(
          formData.citizenId,
        );
        if (res.success && res.data) {
          const citizen = res.data;
          setCitizenData(citizen || null);

          if (citizen) {
            setFormData((prev) => ({
              ...prev,
              name: `${citizen.Ad} ${citizen.Soyad}`,
              phone: citizen.Telefon || prev.phone,
            }));
          }
        }
      } else {
        setCitizenData(null);
      }
    };

    fetchCitizenData();

    console.log("citizenData", citizenData);
  }, [formData.citizenId]);

  // Store ve Form Verisi Senkronizasyonu
  React.useEffect(() => {
    if (!isEditing) {
      setFormData({
        id: profile.id || "",
        name: profile.name || "",
        title: profile.title || "",
        email: profile.email || "",
        phone: profile.phone || "",
        password: "",
        citizenId: profile.citizenId || "",
      });
    }
  }, [profile, isEditing]);

  // Görsel Yükleme Mekanizması
  React.useEffect(() => {
    const loadImg = async () => {
      if (profile.image) {
        const base64 = await (window as any).api.citizen.getProfileImage(
          profile.image,
        );
        setProfileBase64(base64);
      } else {
        setProfileBase64(null);
      }
    };
    loadImg();
  }, [profile.image]);

  const handlePictureChange = async () => {
    if (!formData.citizenId) {
      ElectronService.showAlert({
        message:
          "Resim yüklemek için önce bir vatandaş kaydı ile eşleşmeniz gerekmektedir.",
        type: "warning",
      });
      return;
    }

    const res = await (window as any).api.citizen.pickProfilePicture(
      formData.citizenId,
    );
    if (res.success && res.path) {
      // 🛡️ Sarsılmaz Nizam: Resmi direkt vatandaş kaydına mühürle
      const saveRes = await (window as any).api.executeRaw(
        "UPDATE DATA_Vatandas SET Profil_Foto_Yolu = ? WHERE TCKN = ?",
        [res.path, formData.citizenId],
      );

      if (saveRes.success) {
        await refreshProfile();
        ElectronService.showAlert({
          message: "Profil fotoğrafı kütüğe mühürlendi.",
          type: "success",
        });
      } else {
        ElectronService.showAlert({
          message: "Resim tescil hatası: " + saveRes.error,
          type: "error",
        });
      }
    }
  };

  const [showPicker, setShowPicker] = useState(false);
  const [pickerResults, setPickerResults] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  // Vatandaş Arama Motoru
  const handleSearchCitizens = async (query: string) => {
    setPickerQuery(query);
    if (!query.trim()) {
      setPickerResults([]);
      return;
    }
    setPickerLoading(true);
    const res = await (window as any).api.globalSearch(query);
    if (res.success && res.data) {
      const citizens = res.data.filter((d: any) => d.type === "Kişi");
      setPickerResults(citizens);
    } else if (!res.success) {
      ElectronService.showAlert({
        message: "Arama Hatası: " + res.error,
        type: "error",
      });
    }
    setPickerLoading(false);
  };

  const handleOpenPicker = () => {
    setShowPicker(true);
    handleSearchCitizens(formData.name);
  };

  const handleSave = async () => {
    try {
      const res = await (window as any).api.saveRecord("TANIM_Personel", {
        id: formData.id,
        Unvan: formData.title,
        Eposta: formData.email,
        Telefon: formData.phone,
        Sifre: formData.password || undefined,
        Vatandas_Id: formData.citizenId,
      });

      if (res.success) {
        await refreshProfile();
        setIsEditing(false);
        ElectronService.showAlert({
          message: "Profil ve güvenlik bilgileri başarıyla güncellendi.",
          type: "success",
        });
        window.location.reload();
      } else {
        ElectronService.showAlert({
          message: "Güncelleme hatası: " + res.error,
          type: "error",
        });
      }
    } catch (err: any) {
      ElectronService.showAlert({
        message: "Sistem hatası: " + err.message,
        type: "error",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-8 space-y-8 overflow-y-auto custom-scrollbar relative">
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-50 dark:border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
                      VATANDAŞ SEÇİMİ
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      KÜTÜK SORGULAMA VE EŞİTLEME
                    </p>
                  </div>
                  <button
                    title="Kapat"
                    onClick={() => setShowPicker(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"
                    size={18}
                  />
                  <input
                    autoFocus
                    placeholder="TC NO VEYA İSİM İLE ARA..."
                    value={pickerQuery}
                    onChange={(e) => handleSearchCitizens(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-950 border-2 border-slate-200 dark:border-white/5 rounded-2xl text-sm font-black outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar min-h-[350px]">
                {pickerLoading
                  ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase animate-pulse">
                        KÜTÜK TARANIYOR...
                      </p>
                    </div>
                  )
                  : pickerResults.length > 0
                  ? (
                    pickerResults.map((citizen, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          // 🛡️ TCKN ÜZERİNDEN MÜHÜRLEME
                          const tcknMatch = citizen.subtitle.match(/\d{11}/);
                          setFormData({
                            ...formData,
                            citizenId: tcknMatch ? tcknMatch[0] : "",
                            name: citizen.title,
                            phone: citizen.phone || formData.phone,
                          });
                          setShowPicker(false);
                          ElectronService.showAlert({
                            message:
                              `${citizen.title} kaydı TCKN ile mühürlendi.`,
                            type: "success",
                          });
                        }}
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-500 hover:text-white rounded-[24px] border border-slate-100 dark:border-white/5 transition-all group text-left flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform shadow-sm">
                          <User size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">
                            {citizen.title}
                          </h4>
                          <p className="text-[10px] font-bold opacity-60 uppercase">
                            {citizen.subtitle}
                          </p>
                        </div>
                      </button>
                    ))
                  )
                  : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-30">
                        <Search size={32} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Arama kriterlerine uygun kayıt bulunamadı.
                      </p>
                    </div>
                  )}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-white/5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center italic">
                  Lütfen resmi kimlik bilgilerini (TCKN vb.) doğrulayarak seçim
                  yapınız.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
            <User className="text-primary-500" size={40} />
            SİSTEM YETKİLİSİ
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            KİMLİK, İLETİŞİM VE GÜVENLİK MERKEZİ
          </p>
        </div>
      </header>

      <div className="flex-1 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-500/10 to-transparent" />
            <div className="relative inline-block group mb-6">
              <div className="w-32 h-32 rounded-[32px] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center text-primary-500 text-5xl font-black italic overflow-hidden">
                {profileBase64
                  ? (
                    <img
                      src={profileBase64}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  )
                  : formData.name?.charAt(0).toUpperCase()}
              </div>
              <button
                title="Profil Fotoğrafını Değiştir"
                onClick={handlePictureChange}
                className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 text-slate-400 hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {formData.name}
            </h2>
            <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">
              {formData.title}
            </p>

            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  E-POSTA
                </span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                  {formData.email}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  DURUM
                </span>
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                  <ShieldCheck size={12} /> AKTİF
                </span>
              </div>
            </div>
          </div>

          <div className="bg-primary-500 rounded-[32px] p-6 text-white space-y-4 shadow-xl shadow-primary-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-8 -mt-8" />
            <div className="flex items-center gap-3">
              <Mail className="text-white" size={24} />
              <span className="text-[11px] font-black uppercase tracking-widest">
                ŞİFRE GÜVENLİĞİ
              </span>
            </div>
            <p className="text-[10px] text-white/90 leading-relaxed font-bold uppercase italic">
              Şifrenizi unutmanız durumunda; sistem, kayıtlı e-posta adresinize
              6 haneli bir doğrulama kodu iletecektir. Bu kod aracılığıyla şifre
              sıfırlama işlemini güvenli bir şekilde gerçekleştirebilirsiniz.
            </p>
            <div className="pt-2">
              <span className="text-[9px] font-black text-primary-200 uppercase tracking-tighter">
                * ŞİFRE SADECE UYGULAMA GİRİŞİ İÇİNDİR.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
                PROFİL VE GÜVENLİK AYARLARI
              </h3>
              <button
                title={isEditing
                  ? "Düzenlemeyi İptal Et"
                  : "Profil Bilgilerini Düzenle"}
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isEditing
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary-500 hover:text-white"
                }`}
              >
                {isEditing ? "İPTAL ET" : "DÜZENLE"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Ad Soyad{" "}
                  {formData.citizenId && (
                    <span className="text-primary-500 font-black">
                      (KÜTÜKTEN SENKRONİZE)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    title="Ad Soyad"
                    placeholder="Ad Soyad"
                    disabled={!isEditing || !!formData.citizenId}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Resmi Ünvan
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    title="Resmi Ünvan"
                    placeholder="Resmi Ünvan"
                    disabled={!isEditing}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  E-Posta Adresi (Şahsi/İmaj)
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    title="E-Posta Adresi"
                    placeholder="Şahsi e-posta adresi (Opsiyonel)"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  İletişim No{" "}
                  {formData.citizenId && (
                    <span className="text-primary-500 font-black">
                      (KÜTÜKTEN SENKRONİZE)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    title="İletişim No"
                    placeholder="İletişim No"
                    disabled={!isEditing || !!formData.citizenId}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Vatandaş Kaydı Bağlantısı
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      title="Bağlı Vatandaş"
                      placeholder="Bağlı bir vatandaş kaydı yok"
                      disabled={true}
                      value={formData.citizenId
                        ? "MÜHÜRLÜ TCKN: " + formData.citizenId
                        : "BAĞIMSIZ KULLANICI"}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none opacity-70"
                    />
                  </div>
                  {isEditing && (
                    <button
                      title="Vatandaş İle Eşitle"
                      onClick={handleOpenPicker}
                      className="px-6 py-4 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-2"
                    >
                      <User size={16} /> EŞİTLE
                    </button>
                  )}
                </div>
                {citizenData?.Eposta && (
                  <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl animate-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary-500" size={16} />
                      <div>
                        <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest">
                          RESMİ / KURUMSAL E-POSTA
                        </p>
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase">
                          {citizenData.Eposta}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[9px] font-medium text-slate-400 ml-2 italic">
                  * Bu kullanıcıyı hiyerarşik düzen içerisinde sistemdeki bir
                  vatandaş kaydıyla ilişkilendirebilirsiniz.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Uygulama Giriş Şifresi
                </label>
                <div className="relative">
                  <Fingerprint
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    size={16}
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled={!isEditing}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 disabled:opacity-70"
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400 ml-2 italic">
                  * Şifreyi değiştirmek istemiyorsanız boş bırakın.
                </p>
              </div>
            </div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSave}
                className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} /> DEĞİŞİKLİKLERİ KAYDET VE TESCİL ET
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
