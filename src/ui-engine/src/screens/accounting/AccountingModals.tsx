import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Layers, Search, User, X } from "lucide-react";
import { ElectronService } from "../../services/ElectronService";
import { useAppStore } from "../../store/useAppStore";

interface ModalsProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  activeSubTab: string;
  editingItem: any;
  newKasa: any;
  setNewKasa: (kasa: any) => void;
  newPersonel: any;
  setNewPersonel: (personel: any) => void;
  newTahakkuk: any;
  setNewTahakkuk: (t: any) => void;
  personel: any[];
  handleSaveKasa: () => void;
  handleSavePersonel: () => void;
  handleSaveTahakkuk: () => void;
  // 🛡️ Sarsılmaz Tahsilat Ekleri
  isTahsilatModalOpen?: boolean;
  setIsTahsilatModalOpen?: (open: boolean) => void;
  tahsilatItem?: any;
  tahsilatForm?: { kasaId: string; method: string };
  setTahsilatForm?: (f: any) => void;
  kasalar?: any[];
  handleSaveTahsilat?: () => void;
}

export const AccountingModals: React.FC<ModalsProps> = ({
  isModalOpen,
  setIsModalOpen,
  activeSubTab,
  editingItem,
  newKasa,
  setNewKasa,
  newPersonel,
  setNewPersonel,
  newTahakkuk,
  setNewTahakkuk,
  personel,
  handleSaveKasa,
  handleSavePersonel,
  handleSaveTahakkuk,
  isTahsilatModalOpen,
  setIsTahsilatModalOpen,
  tahsilatItem,
  tahsilatForm,
  setTahsilatForm,
  kasalar,
  handleSaveTahsilat,
}) => {
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerResults, setPickerResults] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const mahalleler = useAppStore.getState().cachedData.DATA_Dagitim_Bolgeleri ||
    [];
  const { profile } = useAppStore();

  // 🛡️ OTOMATİK KASA SEÇİCİ (Hız Tutkunu Tahsildar İçin)
  React.useEffect(() => {
    if (isTahsilatModalOpen) {
      const activePersonelId = personel.find((p) =>
        p.Vatandas_Id === profile?.citizenId || p.Vatandas_Id === profile?.id
      )?.id;
      const validKasalar = kasalar?.filter((k) => {
        if (tahsilatForm?.method === "NAKİT") {
          return (k.Kasa_Tipi === "NAKİT" || !k.Kasa_Tipi) &&
            (k.Zimmet_id === activePersonelId || k.Sistem_Verisi === 1);
        }
        return k.Kasa_Tipi === "BANKA";
      });

      if (validKasalar && validKasalar.length > 0) {
        // Öncelik: Zimmetli olan, yoksa sistem verisi olan
        const bestMatch = validKasalar.find((k) =>
          k.Zimmet_id === activePersonelId
        ) || validKasalar[0];
        if (tahsilatForm?.kasaId !== bestMatch.id) {
          setTahsilatForm?.({ ...tahsilatForm, kasaId: bestMatch.id });
        }
      }
    }
  }, [
    isTahsilatModalOpen,
    tahsilatForm?.method,
    kasalar,
    personel,
    profile,
    tahsilatForm?.kasaId,
  ]);

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

      // 🛡️ OTOMATİK EŞLEŞTİRME: Tam TCKN girildiyse ve tek sonuç varsa mühürle
      if (query.length === 11 && citizens.length === 1) {
        const match = citizens[0];
        if (match.subtitle.includes(query)) {
          setNewPersonel({
            ...newPersonel,
            Vatandas_Id: query,
            Ad_Soyad: match.title,
          });
          setPickerQuery("");
          setPickerResults([]);
        }
      }
    }
    setPickerLoading(false);
  };

  return (
    <>
      {/* 🛡️ ANA MODALLAR (Kasa, Personel, Tahakkuk) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                  {editingItem ? "SİSTEM KAYDI DÜZENLE" : "YENİ KURUMSAL KAYIT"}
                </h3>
                <button
                  title="Pencereyi Kapat"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                {activeSubTab === "kasa"
                  ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="kasa-hesap-kodu"
                            className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1"
                          >
                            TDHP Hesap Kodu (3. Düzey / Muavin Kodu)
                          </label>
                          <div className="flex gap-1">
                            {['100.01.001', '109.01.001', '102.01.001'].map(code => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => setNewKasa({ ...newKasa, Hesap_Kodu: code, Kasa_Tipi: code.startsWith('100') ? 'NAKİT' : 'BANKA' })}
                                className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-mono font-black hover:bg-amber-500 hover:text-white transition-all"
                              >
                                {code.split('.')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          id="kasa-hesap-kodu"
                          title="TDHP Hesap Kodu"
                          type="text"
                          value={newKasa.Hesap_Kodu || '100.01.001'}
                          onChange={(e) => setNewKasa({ ...newKasa, Hesap_Kodu: e.target.value, Kasa_Tipi: e.target.value.startsWith('100') ? 'NAKİT' : 'BANKA' })}
                          placeholder="Örn: 100.01.001"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-black font-mono border-none outline-none focus:ring-2 ring-amber-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="kasa-adi"
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                          >
                            Kasa / Hesap Adı
                          </label>
                          <input
                            id="kasa-adi"
                            title="Kasa Adı"
                            type="text"
                            value={newKasa.Kasa_Adi}
                            onChange={(e) =>
                              setNewKasa({
                                ...newKasa,
                                Kasa_Adi: e.target.value,
                              })}
                            placeholder="Örn: 100 Kasa Hesabı"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-primary-500/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="kasa-konum"
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                          >
                            Fiziksel Konum / Birim
                          </label>
                          <input
                            id="kasa-konum"
                            title="Kasa Konumu"
                            type="text"
                            value={newKasa.Konum}
                            onChange={(e) =>
                              setNewKasa({ ...newKasa, Konum: e.target.value })}
                            placeholder="Örn: Ana Vezne"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-primary-500/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="zimmet-id"
                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                        >
                          Zimmetli Sorumlu (Veznedar)
                        </label>
                        <select
                          id="zimmet-id"
                          title="Zimmetli Personel"
                          value={newKasa.Zimmet_id}
                          onChange={(e) =>
                            setNewKasa({
                              ...newKasa,
                              Zimmet_id: e.target.value,
                            })}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none"
                        >
                          <option value="">Zimmet Seçilmedi</option>
                          {personel.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.Ad_Soyad} — {p.TCKN || "TCKN YOK"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleSaveKasa}
                        className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        KAYDI MÜHÜRLE
                      </button>
                    </>
                  )
                  : activeSubTab === "personel"
                  ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Kişi / Vatandaş TCKN Bağlantısı
                        </label>
                        {!newPersonel.Vatandas_Id
                          ? (
                            <div className="relative">
                              <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"
                                size={16}
                              />
                              <input
                                type="text"
                                placeholder="TC NO VEYA İSİM İLE SORGULA..."
                                value={pickerQuery}
                                onChange={(e) =>
                                  handleSearchCitizens(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase border-none outline-none focus:ring-2 ring-primary-500/20"
                              />
                              <AnimatePresence>
                                {pickerQuery.trim() && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[10] overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar"
                                  >
                                    {pickerLoading
                                      ? (
                                        <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase animate-pulse italic">
                                          Kütük Taranıyor...
                                        </div>
                                      )
                                      : pickerResults.length > 0
                                      ? (
                                        pickerResults.map((c) => (
                                          <button
                                            key={c.id}
                                            onClick={() => {
                                              const tcknMatch = c.subtitle
                                                .match(/\d{11}/);
                                              if (tcknMatch) {
                                                setNewPersonel({
                                                  ...newPersonel,
                                                  Vatandas_Id: tcknMatch[0],
                                                  Ad_Soyad: c.title,
                                                  TCKN: tcknMatch[0],
                                                });
                                                setPickerQuery("");
                                                setPickerResults([]);
                                              } else {
                                                ElectronService.showAlert({
                                                  message:
                                                    "Seçilen kayıtta geçerli TCKN bulunamadı!",
                                                  type: "error",
                                                });
                                              }
                                            }}
                                            className="w-full p-4 hover:bg-primary-500 hover:text-white transition-all text-left border-b border-slate-100 dark:border-white/5 flex items-center justify-between group"
                                          >
                                            <div className="flex flex-col">
                                              <span className="text-[11px] font-black uppercase tracking-tight">
                                                {c.title}
                                              </span>
                                              <span className="text-[9px] font-bold opacity-60 uppercase">
                                                {c.subtitle}
                                              </span>
                                            </div>
                                            <Check
                                              size={14}
                                              className="opacity-0 group-hover:opacity-100"
                                            />
                                          </button>
                                        ))
                                      )
                                      : (
                                        <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase">
                                          Kayıt Bulunamadı
                                        </div>
                                      )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                          : (
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                                  <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-emerald-600 uppercase italic">
                                    TCKN MÜHÜRLENDİ
                                  </span>
                                  <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase leading-none">
                                    {newPersonel.Ad_Soyad}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {newPersonel.TCKN &&
                                        (newPersonel.TCKN !==
                                          newPersonel.Ad_Soyad)
                                      ? `${newPersonel.TCKN} — `
                                      : ""}
                                    {newPersonel.Vatandas_Id}
                                  </span>
                                </div>
                              </div>
                              <button
                                title="Eşleşmeyi Kaldır"
                                onClick={() =>
                                  setNewPersonel({
                                    ...newPersonel,
                                    Vatandas_Id: "",
                                    TCKN: "",
                                  })}
                                className="p-2 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-slate-400"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="unvan"
                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                        >
                          Görev / Unvan
                        </label>
                        <input
                          id="unvan"
                          type="text"
                          value={newPersonel.Unvan || ""}
                          onChange={(e) =>
                            setNewPersonel({
                              ...newPersonel,
                              Unvan: e.target.value,
                            })}
                          placeholder="Örn: Muhasebe Sorumlusu"
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-primary-500/20"
                        />
                      </div>

                      <button
                        onClick={handleSavePersonel}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        KAYDET
                      </button>
                    </>
                  )
                  : (
                    <>
                      {/* 🛡️ MANUEL TAHAKKUK FORMU */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Mükellef Seçimi
                        </label>
                        {!newTahakkuk.Vatandas_Id
                          ? (
                            <div className="relative">
                              <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"
                                size={16}
                              />
                              <input
                                type="text"
                                placeholder="TC NO VEYA İSİM İLE SORGULA..."
                                value={pickerQuery}
                                onChange={(e) =>
                                  handleSearchCitizens(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase border-none outline-none focus:ring-2 ring-primary-500/20"
                              />
                              <AnimatePresence>
                                {pickerQuery.trim() && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[10] overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar"
                                  >
                                    {pickerLoading
                                      ? (
                                        <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase animate-pulse italic">
                                          Kütük Taranıyor...
                                        </div>
                                      )
                                      : pickerResults.length > 0
                                      ? (
                                        pickerResults.map((c) => (
                                          <button
                                            key={c.id}
                                            onClick={() => {
                                              const tcknMatch = c.subtitle
                                                .match(/\d{11}/);
                                              if (tcknMatch) {
                                                setNewTahakkuk({
                                                  ...newTahakkuk,
                                                  Vatandas_Id: tcknMatch[0],
                                                  Ad_Soyad: c.title,
                                                });
                                                setPickerQuery("");
                                                setPickerResults([]);
                                              }
                                            }}
                                            className="w-full p-4 hover:bg-indigo-500 hover:text-white transition-all text-left border-b border-slate-100 dark:border-white/5 flex items-center justify-between group"
                                          >
                                            <div className="flex flex-col">
                                              <span className="text-[11px] font-black uppercase tracking-tight">
                                                {c.title}
                                              </span>
                                              <span className="text-[9px] font-bold opacity-60 uppercase">
                                                {c.subtitle}
                                              </span>
                                            </div>
                                            <Check
                                              size={14}
                                              className="opacity-0 group-hover:opacity-100"
                                            />
                                          </button>
                                        ))
                                      )
                                      : (
                                        <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase">
                                          Kayıt Bulunamadı
                                        </div>
                                      )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                          : (
                            <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
                                  <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-indigo-600 uppercase italic">
                                    MÜKELLEF SEÇİLDİ
                                  </span>
                                  <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase leading-none">
                                    {newTahakkuk.Ad_Soyad}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {newTahakkuk.Vatandas_Id}
                                  </span>
                                </div>
                              </div>
                              <button
                                title="Seçimi Kaldır"
                                onClick={() =>
                                  setNewTahakkuk({
                                    ...newTahakkuk,
                                    Vatandas_Id: "",
                                  })}
                                className="p-2 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-slate-400"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="t-miktar"
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                          >
                            Borç Tutarı (₺)
                          </label>
                          <input
                            id="t-miktar"
                            type="number"
                            value={newTahakkuk.Miktar}
                            onChange={(e) =>
                              setNewTahakkuk({
                                ...newTahakkuk,
                                Miktar: e.target.value,
                              })}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            htmlFor="t-tarih"
                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                          >
                            İşlem Tarihi
                          </label>
                          <input
                            id="t-tarih"
                            type="date"
                            value={newTahakkuk.Tarih}
                            onChange={(e) =>
                              setNewTahakkuk({
                                ...newTahakkuk,
                                Tarih: e.target.value,
                              })}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="t-aciklama"
                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
                        >
                          Tahakkuk Açıklaması
                        </label>
                        <textarea
                          id="t-aciklama"
                          rows={3}
                          value={newTahakkuk.Aciklama}
                          onChange={(e) =>
                            setNewTahakkuk({
                              ...newTahakkuk,
                              Aciklama: e.target.value,
                            })}
                          placeholder="Örn: Geçmiş dönem su borcu devri..."
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-indigo-500/20 resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSaveTahakkuk}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        BORÇ KAYDINI ONAYLA
                      </button>
                    </>
                  )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛡️ TAHSİLAT MODALI (Sarsılmaz Mali Nizam) */}
      <AnimatePresence>
        {isTahsilatModalOpen && tahsilatItem && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                    TAHSİLAT TESCİLİ
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={10} className="text-primary-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {(profile as any)?.name || (profile as any)?.fullName ||
                        "SİSTEM OPERATÖRÜ"} /{" "}
                      {(profile as any)?.citizenId || (profile as any)?.tckn ||
                        "00000000000"}
                    </span>
                  </div>
                </div>
                <button
                  title="Kapat"
                  onClick={() => setIsTahsilatModalOpen?.(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        MÜKELLEF
                      </span>
                      <span className="text-sm font-black text-slate-800 dark:text-white uppercase">
                        {tahsilatItem.Ad_Soyad}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        ÖDENECEK TUTAR
                      </span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(
                          tahsilatItem.Tutar || tahsilatItem.Miktar || 0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase italic line-clamp-1">
                      {tahsilatItem.Aciklama}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 🛡️ OTOMATİK KANAL BİLGİSİ (Kullanıcı seçimi kaldırıldı, sadece gösteriliyor) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      İşlem Kanalı
                    </label>
                    <div className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tahsilatForm?.method === "NAKİT"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-indigo-500/10 text-indigo-500"
                          }`}
                        >
                          {tahsilatForm?.method === "NAKİT"
                            ? <Layers size={18} />
                            : <Search size={18} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                            {tahsilatForm?.method === "NAKİT"
                              ? "ZİMMETLİ KASANIZ"
                              : "BANKA / POS HESABI"}
                          </span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">
                            {kasalar?.find((k) => k.id === tahsilatForm?.kasaId)
                              ?.Kasa_Adi || (kasalar && kasalar.length > 0
                                ? "KANAL BELİRLENİYOR..."
                                : "UYGUN KASA BULUNAMADI!")}
                          </span>
                        </div>
                      </div>
                      {tahsilatForm?.kasaId && (
                        <Check size={16} className="text-emerald-500" />
                      )}
                    </div>

                    {(!kasalar || kasalar.length === 0 ||
                      !tahsilatForm?.kasaId) && (
                      <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-pulse">
                        <AlertCircle size={14} className="text-rose-500" />
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-tight">
                          DİKKAT: Tahsilat için uygun bir kasa/hesap
                          tanımlanmamış!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      ÖDEME YÖNTEMİ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setTahsilatForm?.({
                            ...tahsilatForm,
                            method: "NAKİT",
                          })}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          tahsilatForm?.method === "NAKİT"
                            ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20"
                            : "bg-transparent border-slate-100 dark:border-white/5 text-slate-400"
                        }`}
                      >
                        NAKİT
                      </button>
                      <button
                        onClick={() =>
                          setTahsilatForm?.({
                            ...tahsilatForm,
                            method: "KREDİ KARTI",
                          })}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          tahsilatForm?.method === "KREDİ KARTI"
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                            : "bg-transparent border-slate-100 dark:border-white/5 text-slate-400"
                        }`}
                      >
                        KREDİ KARTI
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveTahsilat}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Check size={18} /> TAHSİLATİ TESCİL ET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
