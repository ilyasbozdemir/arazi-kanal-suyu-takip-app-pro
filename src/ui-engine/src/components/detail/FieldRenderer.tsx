import { FC } from "react";
import {
  Activity,
  Calendar,
  Droplets,
  FileText,
  Fingerprint,
  Globe,
  Hash,
  Info,
  Landmark,
  Layers,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  UserPlus,
} from "lucide-react";
import { DetailField } from "./DetailField";
import { useAppStore } from "@renderer/store/useAppStore";
import { ComplexJsonField } from "@renderer/components/fields/ComplexJsonField";
import { CitizenField } from "@renderer/components/fields/CitizenField";
import { MevkiField } from "@renderer/components/fields/MevkiField";
import { SuHakkiField } from "@renderer/components/fields/SuHakkiField";
import { GeoJSONField } from "@renderer/components/fields/GeoJSONField";
import { AdaParselField } from "@renderer/components/fields/AdaParselField";
import { AlanField } from "@renderer/components/fields/AlanField";

interface FieldRendererProps {
  field: string;
  table: string;
  values: any;
  setValues: (v: any) => void;
  isEditing: boolean;
  mevkiler?: any[];
  vatandaslar?: any[];
  translateHeader: (h: string) => string;
  tcknStatus?: any;
  sicilStatus?: any;
  checkTCKNExistence?: any;
  checkSicilExistence?: any;
  debounceTimer?: any;
  sicilTimer?: any;
  onOpenDetail?: any;
  onOpenCreate?: any;
  color?: any;
  helpText?: string;
  icon?: any;
  type?: string;
  renderTooltip: (h: string) => React.ReactNode;
  isRequiredFieldEmpty: (field: string) => boolean;
  draftGeometry?: any;
  setDraftGeometry?: any;
  error?: string;
  errors?: Record<string, string>;
  isTouched?: boolean;
  onBlur?: () => void;
  allRegions?: any[];
}

// ─────────────────────────────────────────────
// 🛡️ FIELD_CONFIG — Basit alanların merkezi tanımı
// Yeni alan eklemek için sadece buraya satır ekle.
// ─────────────────────────────────────────────
interface FieldCfg {
  label?: string;
  type?: string;
  icon: any;
  color: string;
  options?: string[];
  listId?: string;
  placeholder?: string;
  onlyAlpha?: boolean;
  onlyNumeric?: boolean;
  defaultValue?: string;
}

const FIELD_CONFIG: Record<string, FieldCfg> = {
  Sahip_Turu: {
    label: "SAHİPLİK TÜRÜ",
    type: "select",
    icon: UserPlus,
    color: "indigo",
    options: ["Tam", "Hisseli"],
  },
  Cinsiyet: {
    label: "CİNSİYET",
    type: "select",
    icon: User,
    color: "indigo",
    options: ["Erkek", "Kadın"],
  },
  Notlar: {
    label: "ÖZEL NOTLAR VE AÇIKLAMALAR",
    type: "textarea",
    icon: FileText,
    color: "blue",
    options: [
      "Arazide buğday/arpa ekimi yapılmaktadır; yıllık sulama ihtiyacı yaklaşık 3-4 dekar/saat olarak beyan edilmiştir.",
      "Parselde meyve bahçesi (elma/armut/kiraz) mevcuttur; damla sulama sistemi kurulu olup haftalık sulama talebi alınmıştır.",
      "Sebze bahçesi (domates/biber/salatalık) ekimi yapılmaktadır; sulama sezonu Mayıs–Eylül arası aktiftir.",
      "Arazide bağ (üzüm) mevcuttur; sulama sezonu başında 2 saat/hafta hak tanınmıştır.",
      "Vatandaşın beyanına göre arazi nadasa bırakılmıştır; bu sezon sulama talebi bulunmamaktadır.",
      "Parselde kanala yakınlık nedeniyle yeraltı suyu yeterlidir; ek tahakkuk yapılmayacaktır.",
      "Yüzey sulaması ile sulanan bu parselde kayıp oranı yüksektir; damlama sistemine geçiş tavsiye edilmiştir.",
      "Parsel, kanal hat sonunda yer aldığından su basıncı düşüklüğü şikayeti alınmıştır; teknik inceleme beklemektedir.",
      "Miras nedeniyle ortak hisseli arazi; tüm hissedarlar sulama sırasını kendi aralarında düzenlemektedir."
    ]
  },
  Aktif: {
    label: "GÖREV DURUMU",
    type: "select",
    icon: ShieldCheck,
    color: "emerald",
    options: [
      { label: "AKTİF", value: 1 },
      { label: "PASİF", value: 0 },
    ] as any[],
  },
  Mulk_Tipi: {
    label: "MÜLKİYET TİPİ",
    type: "select",
    icon: ShieldCheck,
    color: "primary",
    options: ["MÜLKİYET", "ZİLYETLİK", "KİRALAMA", "TAHSİS"],
    defaultValue: "MÜLKİYET",
  },
  Nitelik: {
    label: "TAŞINMAZ NİTELİĞİ",
    type: "text",
    icon: Layers,
    color: "emerald",
    listId: "list-nitelik",
    options: ["ARSA", "TARLA", "BAĞ", "BAHÇE", "KONUT", "TİCARİ", "ZEYTİNLİK", "ELMALIK", "KİRAZLIK", "BOŞ ALAN"],
  },
  Ad:    { type: "text", icon: User, color: "primary" },
  Soyad: { type: "text", icon: User, color: "primary" },
  Unvan: {
    label: "ÜNVAN / LAKAP",
    type: "text",
    icon: Info,
    color: "indigo",
  },
  Mevki_Lat: { label: "ENLEM (LATITUDE)",   type: "text", icon: Navigation, color: "rose", placeholder: "37.XXXX" },
  Mevki_Lng: { label: "BOYLAM (LONGITUDE)", type: "text", icon: Navigation, color: "rose", placeholder: "32.XXXX" },
  Lat:       { label: "ENLEM (LATITUDE)",   type: "text", icon: Navigation, color: "rose", placeholder: "37.XXXX" },
  Lng:       { label: "BOYLAM (LONGITUDE)", type: "text", icon: Navigation, color: "rose", placeholder: "32.XXXX" },
};

export const FieldRenderer: FC<FieldRendererProps> = (props) => {
  const {
    field: h,
    table,
    values,
    setValues,
    isEditing,
    mevkiler,
    vatandaslar,
    translateHeader,
    tcknStatus,
    sicilStatus,
    onOpenDetail,
    color,
    helpText,
    icon: CustomIcon,
    type,
    renderTooltip = () => null,
    error,
    errors = {},
    isRequiredFieldEmpty,
    isTouched,
    onBlur,
  } = props;

  const mandatoryFields: string[] = [];
  const isMandatory = false;
  const isFilled = values[h] && String(values[h]).trim() !== "";
  const fieldColor = color || ((error && isTouched) ? "rose" : isMandatory ? "rose" : "primary");

  // ── Ortak prop'lar (her DetailField çağrısında tekrar yazmamak için) ──
  const common = {
    value: values[h],
    isEditing,
    onChange: (v: any) => setValues({ ...values, [h]: v }),
    error: errors[h] || error,
    isTouched,
    onBlur,
    isMandatory,
  };

  // ─────────────────────────────────────────────
  // 1. Gizli Alanlar (Arka planda yönetilenler)
  // ─────────────────────────────────────────────
  if (h === "Unvan" && table === "TANIM_Personel") {
     return null; // 🛡️ Sarsılmaz Gizlilik: Ekrana getirmeden yapıyoruz!
  }

  if (h === "Hissedarlar_JSON" || h === "Ilgili_Kisiler_JSON") {
    return <ComplexJsonField {...props} />;
  }

  // ─────────────────────────────────────────────
  // 2. Özel component gerektiren alanlar
  // ─────────────────────────────────────────────
  if (h === "Ada_Parsel") {
    return <AdaParselField {...props} field={h} isRequiredFieldEmpty={isRequiredFieldEmpty} isMandatory={isMandatory} />;
  }
  if (h === "Alan_m2") {
    return <AlanField {...props} field={h} isRequiredFieldEmpty={isRequiredFieldEmpty} isMandatory={isMandatory} />;
  }
  if (h === "Mevki_id" || h === "Sorumlu_Bolge_id" || h === "Mevki") {
    return <MevkiField {...props} field={h} isRequiredFieldEmpty={isRequiredFieldEmpty} mevkiler={mevkiler || []} onOpenCreate={props.onOpenCreate} />;
  }
  if (h === "Aylik_Su_Hakki") {
    return <SuHakkiField {...props} field={h} isRequiredFieldEmpty={isRequiredFieldEmpty} isMandatory={isMandatory} />;
  }
  if (h === "GeoJSON") {
    return <GeoJSONField {...props} field={h} isRequiredFieldEmpty={isRequiredFieldEmpty} isMandatory={isMandatory} />;
  }
  if (h === "Vatandas_Id" || h === "Tapu_Sahibi_TCKN") {
    return (
      <CitizenField
        {...props} field={h}
        isRequiredFieldEmpty={isRequiredFieldEmpty}
        citizens={vatandaslar || []}
        translateHeader={translateHeader}
        error={errors[h] || error}
        isTouched={isTouched}
        onBlur={onBlur}
      />
    );
  }

  // ─────────────────────────────────────────────
  // 3. FIELD_CONFIG — basit alanlar
  // ─────────────────────────────────────────────
  const cfg = FIELD_CONFIG[h];
  if (cfg) {
    return (
      <DetailField
        label={cfg.label || translateHeader(h)}
        type={cfg.type || "text"}
        icon={cfg.icon}
        color={cfg.color || fieldColor}
        options={cfg.options}
        listId={cfg.listId}
        placeholder={cfg.placeholder}
        onlyAlpha={cfg.onlyAlpha}
        onlyNumeric={cfg.onlyNumeric}
        helpText={helpText}
        {...common}
      />
    );
  }

  // ─────────────────────────────────────────────
  // 4. Karmaşık mantıklı özel alanlar
  // ─────────────────────────────────────────────

  // TCKN
  if (h === "TCKN") {
    const fieldError = errors[h] || error;
    const rightElement = isEditing && values.TCKN && (
      <div className="flex items-center gap-2 pr-1">
        {values.TCKN_Confirmed ? (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-[16px] shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
            <ShieldCheck size={14} className="animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-tighter">ONAYLANDI</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={tcknStatus?.status === "loading" || tcknStatus?.status === "error"}
            onClick={() => setValues({ ...values, TCKN_Confirmed: true })}
            className={`px-4 py-2 text-white text-[10px] font-black rounded-[16px] shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2 ${
              tcknStatus?.status === "loading" ? "bg-slate-400"
              : (tcknStatus?.status === "error" && tcknStatus.message.includes("MEVCUT")) ? "bg-rose-600 shadow-rose-900/20"
              : tcknStatus?.status === "error" ? "bg-slate-400 cursor-not-allowed" // Algoritma hatasında butonu etkisiz ama gri yap
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
            }`}
          >
            {tcknStatus?.status === "loading" ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            {tcknStatus?.status === "loading" ? "SORGULANIYOR" : (tcknStatus?.status === "error" && tcknStatus.message.includes("MEVCUT")) ? "Aynı Kişi Var!" : "DOĞRULA"}
          </button>
        )}
      </div>
    );
    return (
      <div className="space-y-3">
        <DetailField
          label={translateHeader(h)}
          value={values[h]}
          isEditing={isEditing}
          onChange={(v: string) => setValues({ ...values, [h]: v, TCKN_Confirmed: false })}
          type="text"
          maxLength={30}
          icon={Fingerprint}
          color={fieldError ? "rose" : tcknStatus?.status === "success" ? (values.TCKN_Confirmed ? "emerald" : "blue") : tcknStatus?.status === "warning" ? "blue" : "rose"}
          error={fieldError}
          isTouched={isTouched}
          onBlur={onBlur}
          helpText={tcknStatus?.status === "success" && !values.TCKN_Confirmed ? "LÜTFEN T.C. KİMLİK NUMARASINI DOĞRULAYIN!" : undefined}
          rightElement={rightElement}
          isMandatory={isMandatory}
        />
        {isEditing && (tcknStatus?.status === "error" || tcknStatus?.status === "warning") && (
          <div className={`flex items-center gap-2 px-4 py-2 border rounded-xl animate-in slide-in-from-top-2 ${
            tcknStatus.status === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
              : "bg-amber-500/10 border-amber-500/20 text-amber-600"
          }`}>
            <Activity size={12} className={tcknStatus.status === "error" ? "text-rose-600 animate-pulse" : "text-amber-600"} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{tcknStatus.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Sicil_No
  if (h === "Sicil_No") {
    const isKurumsal = values.Tur === "ŞAHIS / KURUMSAL";
    const fieldError = errors[h] || error;
    const rightElement = isEditing && values.Sicil_No && (
      <div className="flex items-center gap-2 pr-1">
        {values.Sicil_Confirmed ? (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-[16px] shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
            <ShieldCheck size={14} className="animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-tighter">ONAYLANDI</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={sicilStatus?.status === "loading" || sicilStatus?.status === "error"}
            onClick={() => setValues({ ...values, Sicil_Confirmed: true })}
            className={`px-4 py-2 text-white text-[10px] font-black rounded-[16px] shadow-lg transition-all active:scale-95 uppercase flex items-center gap-2 ${
              sicilStatus?.status === "loading" ? "bg-slate-400"
              : (sicilStatus?.status === "error" && sicilStatus.message.includes("MEVCUT")) ? "bg-rose-600 shadow-rose-900/20"
              : sicilStatus?.status === "error" ? "bg-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
            }`}
          >
            {sicilStatus?.status === "loading" ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            {sicilStatus?.status === "loading" ? "SORGULANIYOR" : (sicilStatus?.status === "error" && sicilStatus.message.includes("MEVCUT")) ? "ÇAKIŞMA!" : "DOĞRULA"}
          </button>
        )}
      </div>
    );
    return (
      <div className="space-y-3">
        <DetailField
          label={translateHeader(h)}
          value={values[h]}
          isEditing={isEditing}
          onChange={(v: string) => setValues({ ...values, [h]: v, Sicil_Confirmed: false })}
          type="text"
          onlyNumeric={true}
          icon={Hash}
          color={fieldError ? "rose" : sicilStatus?.status === "success" ? (values.Sicil_Confirmed ? "emerald" : "blue") : (isKurumsal ? "blue" : "rose")}
          error={fieldError}
          isTouched={isTouched}
          onBlur={onBlur}
          helpText={sicilStatus?.status === "success" && !values.Sicil_Confirmed
            ? "LÜTFEN BU SİCİL NUMARASINI DOĞRULAYIN!"
            : isKurumsal ? "KURUMSAL KAYITLARDA SİCİL NO YERİNE VERGİ NO ESASTIR!" : undefined}
          rightElement={rightElement}
          isMandatory={isMandatory}
        />
        {isEditing && sicilStatus?.status === "error" && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in slide-in-from-top-2">
            <Activity size={12} className="text-rose-600 animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">{sicilStatus.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Tur — dinamik renk
  if (h === "Tur") {
    return (
      <DetailField
        label="MÜKELLEF TÜRÜ"
        type="select"
        icon={Landmark}
        color={values[h] === "KURUMSAL" ? "blue" : "indigo"}
        options={["ŞAHIS / BİREYSEL", "KURUMSAL", "KAMU KURUMU", "TÜZEL KİŞİ"]}
        {...common}
      />
    );
  }

  // Durum — tablo bazlı dinamik label/options
  if (h === "Durum") {
    const isVatandas = table === "DATA_Vatandas";
    const isDefter  = table === "DATA_Dagitim_Bolgeleri";
    const isPersonel = table === "TANIM_Personel";
    const statusLabel   = isVatandas ? "Vatandaş Durumu" : isDefter ? "Defter Durumu" : isPersonel ? "Görev Durumu" : "Durum";
    const statusOptions = isVatandas ? ["SAĞ", "ÖLÜ"] : ["AKTİF", "PASİF"];
    const defaultVal    = isVatandas ? "SAĞ" : "AKTİF";
    return (
      <DetailField
        label={statusLabel}
        value={values[h] || defaultVal}
        isEditing={isEditing}
        onChange={(v: any) => setValues({ ...values, [h]: v })}
        type="select"
        options={statusOptions}
        icon={Activity}
        color={(values[h] === "ÖLÜ" || values[h] === "PASİF") ? "rose" : "emerald"}
        error={errors[h] || error}
        isTouched={isTouched}
        onBlur={onBlur}
        isMandatory={isMandatory}
      />
    );
  }

  // 📱 TELEFON NUMARASI — ÖZEL MASKELİ GİRİŞ (+90 Desteği)
  if (h === "Telefon") {
    const rawValue = values[h] || "";
    // +90 kısmını input ekranında göstermiyoruz, sadece kalan 10 haneyi maskeliyoruz
    const cleanValue = rawValue.startsWith("+90") ? rawValue.substring(3) : rawValue.replace(/\D/g, "");
    
    const formatDisplay = (val: string) => {
      const d = val.replace(/\D/g, "");
      let m = "";
      if (d.length > 0) m += "(" + d.substring(0, 3);
      if (d.length > 3) m += ") " + d.substring(3, 6);
      if (d.length > 6) m += " " + d.substring(6, 8);
      if (d.length > 8) m += " " + d.substring(8, 10);
      return m;
    };

    return (
      <DetailField
        label="CEP TELEFONU"
        value={isEditing ? formatDisplay(cleanValue) : rawValue}
        isEditing={isEditing}
        onChange={(v: string) => {
          const digits = v.replace(/\D/g, "").substring(0, 10);
          setValues({ ...values, [h]: digits ? `+90${digits}` : "" });
        }}
        placeholder="(5XX) XXX XX XX"
        leftElement={
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/5 text-[10px] font-black text-slate-500">
             🇹🇷 +90
          </div>
        }
        icon={Smartphone}
        color="sky"
        error={errors[h] || error}
        isTouched={isTouched}
        onBlur={onBlur}
        isMandatory={isMandatory}
      />
    );
  }


  // Mahalle_id — Merav ve diğerleri için sarsılmaz seçim kutusu
  if (h === "Mahalle_id" || h === "Sorumlu_Mahalle") {
    const mahalleler = (props.allRegions && props.allRegions.length > 0) 
      ? props.allRegions 
      : (useAppStore.getState().cachedData.TANIM_Konumlar || []);
      
    return (
      <DetailField
        label="SORUMLU OLDUĞU MAHALLE"
        type="select"
        icon={Navigation}
        color={fieldColor}
        options={mahalleler.map((m: any) => ({ label: m.Ad || m.Mevki_Adi || m.name, value: m.id }))}
        {...common}
      />
    );
  }

  // Mahalle_Koy — store'dan seçenekler
  if (h === "Mahalle_Koy") {
    const mahalleler = useAppStore.getState().cachedData.DATA_Dagitim_Bolgeleri || [];
    return (
      <DetailField
        label="MAHALLE / KÖY"
        type="text"
        icon={Globe}
        color={fieldColor}
        listId="mahalle-suggestions"
        options={mahalleler.map((m: any) => m.Mahalle_Adi)}
        {...common}
      />
    );
  }

  // ─────────────────────────────────────────────
  // 5. Tarih alanları — pattern match
  // ─────────────────────────────────────────────
  if (h === "Dogum_Tarihi" || h === "Olum_Tarihi" || h === "Vefat_Tarihi" || h.includes("_Tarihi") || h === "Tarih") {
    return (
      <DetailField
        label={translateHeader(h)}
        type="date"
        icon={Calendar}
        color="blue"
        {...common}
      />
    );
  }

  // ─────────────────────────────────────────────
  // 5b. Boolean toggle alanları (Kanal, vb.)
  // ─────────────────────────────────────────────
  if (h === "Kanal_Seviyesi_Altinda" || h === "Kanal_Suyu_Ile_Sulanan") {
    const isOn = !!values[h];
    const labelMap: Record<string, { label: string; onText: string; offText: string; onColor: string; offColor: string }> = {
      Kanal_Seviyesi_Altinda: { label: "KANAL SEVİYESİ ALTINDA", onText: "EVET — Kanal altında", offText: "HAYIR — Kanal üstünde", onColor: "emerald", offColor: "slate" },
      Kanal_Suyu_Ile_Sulanan: { label: "KANAL SUYU İLE SULANAN", onText: "EVET — Kanal suyu kullanıyor", offText: "HAYIR — Kanal suyu yok", onColor: "sky", offColor: "slate" },
    };
    const cfg = labelMap[h];
    return (
      <div className="flex flex-col gap-1.5 group/field w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{cfg.label}</label>
        {isEditing ? (
          <button
            type="button"
            onClick={() => setValues({ ...values, [h]: isOn ? 0 : 1 })}
            className={`h-[56px] w-full rounded-[20px] border-2 flex items-center px-4 gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md ${
              isOn
                ? `bg-${cfg.onColor}-500/10 border-${cfg.onColor}-500/40 text-${cfg.onColor}-600 dark:text-${cfg.onColor}-400`
                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex-shrink-0 transition-all ${isOn ? `bg-${cfg.onColor}-500 shadow-lg shadow-${cfg.onColor}-500/30` : "bg-slate-300 dark:bg-white/20"}`} />
            {isOn ? cfg.onText : cfg.offText}
          </button>
        ) : (
          <div className={`h-[56px] rounded-[20px] border-2 flex items-center px-4 gap-3 font-black text-xs uppercase tracking-widest ${
            isOn
              ? `bg-${cfg.onColor}-500/10 border-${cfg.onColor}-500/40 text-${cfg.onColor}-600 dark:text-${cfg.onColor}-400`
              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
          }`}>
            <span className={`w-5 h-5 rounded-full flex-shrink-0 ${isOn ? `bg-${cfg.onColor}-500` : "bg-slate-300 dark:bg-white/20"}`} />
            {isOn ? cfg.onText : cfg.offText}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 6. Fallback — bilinmeyen alanlar
  // ─────────────────────────────────────────────
  return (
    <DetailField
      label={translateHeader(h)}
      type={type || (typeof values[h] === "number" ? "number" : "text")}
      icon={CustomIcon || Info}
      color={fieldColor}
      helpText={helpText}
      {...common}
    />
  );
};
