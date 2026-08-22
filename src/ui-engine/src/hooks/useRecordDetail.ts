import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { TableNames, RECORD_CONFIGS, RecordConfig } from "../config/recordConfig";

/**
 * 🛡️ HELPER: Data Normalization (Case-Sensitivity & Value mapping)
 */
const normalizeRecord = (data: any) => {
  let base = { ...(data || {}) };
  const mapping: Record<string, string> = {
    'id': 'id', 'ID': 'id', 'Id': 'id',
    'sahip_turu': 'Sahip_Turu', 'alan_m2': 'Alan_m2',
    'ada_parsel': 'Ada_Parsel', 'aylik_su_hakki': 'Aylik_Su_Hakki',
    'mahalle_koy': 'Mahalle_Koy', 'mevki_adi': 'Mevki_Adi', 'mevki': 'Mevki_id',
    'mevki_id': 'Mevki_id', 'Vatandas_Id': 'Vatandas_Id', 'aktif': 'Aktif'
  };

  Object.keys(base).forEach(key => {
    const target = mapping[key.toLowerCase()];
    if (target && key !== target) base[target] = base[key];
  });

  return base;
};

/**
 * 🛡️ HELPER: TCKN Checksum Validation
 */
const validateTCKN = (tckn: string) => {
  if (!tckn || tckn.length !== 11) return false;
  
  // 🛡️ DEV MODE BYPASS: Eğer 11 hanenin tamamı aynı rakamsa (111..., 222... hatta 000... gibi) geçerli say.
  const digits = tckn.split("").map(Number);
  const isAllSame = digits.every(d => d === digits[0]);
  if (isAllSame) return true;

  if (tckn[0] === "0") return false;
  
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  // 🛡️ JS Modulo Correction: Ensure result is positive
  let d10 = ((oddSum * 7) - evenSum) % 10;
  if (d10 < 0) d10 += 10;
  
  if (d10 !== digits[9]) return false;
  const d11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return d11 === digits[10];
};

/**
 * 🛡️ COMPOSABLE HOOK: THE ULTIMATE useRecordDetail
 */
export const useRecordDetail = (
  table: string, 
  type: string, 
  data: any, 
  isOpen: boolean, 
  onRefresh?: (data?: any) => void, 
  onClose?: () => void,
  api = (window as any).api
) => {
  // 🛡️ Resolve Config (Safe Fallback)
  const config: RecordConfig = useMemo(() => 
    RECORD_CONFIGS[table] || { validate: () => ({ isValid: true, missingFields: [] }) }
  , [table]);

  // --- Core States ---
  const [values, setValues] = useState<any>(() => normalizeRecord(data));
  const [isEditing, setIsEditing] = useState(type === "create");

  // 🛡️ KRİTİK SENKRONİZASYON: Üst bileşenden (Prop) veri gelirse yerel state'i mühürle
  useEffect(() => {
    if (isOpen && data && type !== 'create') {
      setValues((prev: any) => {
        const next = normalizeRecord(data);
        // Eğer aynı kayıttaysak, mevcut state'i koruyarak üzerine yaz (virtual field'ları öldürme)
        if (prev && prev.id === next.id) {
          return { ...prev, ...next };
        }
        // Farklı kayıt geldiyse tam reset
        return next;
      });
    }
  }, [data, isOpen, type]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("genel");
  const [profileData, setProfileData] = useState<any>({});
  
  // --- UI States (Restored for compatibility) ---
  const [creationStep, setCreationStep] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [duplicateStatus, setDuplicateStatus] = useState<Record<string, { status: string; message: string }>>({
    TCKN: { status: 'idle', message: '' },
    Sicil_No: { status: 'idle', message: '' },
    Mevki_Adi: { status: 'idle', message: '' }
  });

  const validation = useMemo(() => 
    config.validate(values, { 
       tcknError: duplicateStatus.TCKN?.status === 'error',
       tcknErrorMessage: duplicateStatus.TCKN?.message,
       sicilError: duplicateStatus.Sicil_No?.status === 'error',
       sicilErrorMessage: duplicateStatus.Sicil_No?.message,
       mevkiError: duplicateStatus.Mevki_Adi?.status === 'error',
       mevkiErrorMessage: duplicateStatus.Mevki_Adi?.message
    })
  , [config, values, duplicateStatus]);

  // --- Initial State Hydration ---
  useEffect(() => {
    console.log(`[useRecordDetail:${table}] Hydrating values from data:`, data);
    if (type === 'create') {
      const initial = config.initialValues ? config.initialValues(table) : {};
      setValues((prev: any) => ({
        ...prev,
        id: window.crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...initial
      }));
    }
  }, [type, table, config, data]);

  // --- Profile Data Loading (Config-Driven) ---
  const loadProfile = useCallback(async (isManual: boolean = false) => {
    if (!isOpen || (type === 'create' && !isManual) || !data?.id || !config.loadProfile) return;
    
    setIsProcessing(true);
    try {
      console.log(`[useRecordDetail:${table}] Profile load started for ID:`, data.id);
      
      // 🛡️ RE-FETCH MAIN RECORD DATA (Sarsılmaz Live Update)
      const mainRes = await api.executeRaw(`SELECT * FROM ${table} WHERE id = ?`, [data.id]);
      if (mainRes.success && mainRes.data?.[0]) {
         setValues(normalizeRecord(mainRes.data[0]));
      }

      const res = await config.loadProfile!(data.id, api, values);
      console.log(`[useRecordDetail:${table}] Profile load success:`, res);
      setProfileData((p: any) => ({ ...p, ...res }));
      
      // 🛡️ SARSILMAZ HİDRASYON: Eğer profil yüklemesi ana kaydı da kapsıyorsa (Merav vb.), forma mühürle
      if (res?._mainRecord) {
         setValues((v: any) => ({ ...v, ...res._mainRecord }));
      }

      // 🛡️ KRİTİK SENKRONİZASYON: İlişkisel verileri forma mühürle
      if (table === TableNames.TAPU && res.owners) {
         setValues((v: any) => ({
            ...v,
            Hissedarlar_JSON: res.owners,
            Ilgili_Kisiler_JSON: res.zilyetler || []
         }));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isOpen, data?.id, config, api, type, table]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // --- Duplicate Checking Logic ---
  const checkDuplicates = useCallback(async (field: string, val: string) => {
    // 🛡️ TCKN_Yok aktifse veya değer boşsa kontrolü atla
    if (values.TCKN_Yok && (field === 'TCKN' || field === 'Sicil_No')) {
       setDuplicateStatus(prev => ({ ...prev, [field]: { status: 'idle', message: '' } }));
       return;
    }

    if (!val) {
       setDuplicateStatus(prev => ({ ...prev, [field]: { status: 'idle', message: '' } }));
       return;
    }
    
    setDuplicateStatus(prev => ({ ...prev, [field]: { status: 'loading', message: '' } }));

    try {
      let isAlgorithmValid = true;
      if (field === 'TCKN' && !validateTCKN(val)) {
         isAlgorithmValid = false;
      }

      const res = await api.checkDuplicate(table, field, val.trim(), data?.id);
      
      if (res.exists) {
        setDuplicateStatus(prev => ({ 
           ...prev, 
           [field]: { status: 'error', message: `SİSTEMDE BU ${field === 'Mevki_Adi' ? 'İSİMDE MEVKİ' : field} ZATEN MEVCUT!` } 
        }));
      } else {
        setDuplicateStatus(prev => ({ 
           ...prev, 
           [field]: (field === 'TCKN' && !isAlgorithmValid)
             ? { status: 'warning', message: 'T.C. KİMLİK ALGORİTMASINA UYGUN DEĞİL (HARİCİ/YABANCI KİMLİK?)' }
             : { status: 'success', message: '' } 
        }));

        // 🛡️ AKILLI BULANIK DENETİM: Eğer TCKN/Sicil çakışmıyorsa bile Ad+Soyad+Doğum Tarihi çakışıyor mu?
        if (field === 'TCKN' && values.Ad && values.Soyad && values.Dogum_Tarihi) {
           const fuzzyRes = await api.executeRaw(`
              SELECT id FROM DATA_Vatandas 
              WHERE Ad = ? AND Soyad = ? AND Dogum_Tarihi = ? AND id != ? AND (deleted_at IS NULL OR deleted_at = '')
              LIMIT 1
           `, [values.Ad, values.Soyad, values.Dogum_Tarihi, data?.id || 'NEW']);
           
           if (fuzzyRes.success && fuzzyRes.data?.length > 0) {
              setDuplicateStatus(prev => ({ 
                 ...prev, 
                 TCKN: { status: 'warning', message: 'AYNI İSİM VE DOĞUM TARİHLİ BİRİ ZATEN VAR!' } 
              }));
           }
        }
      }
    } catch (e: any) {
      console.error(`[checkDuplicates:${field}]`, e);
      setDuplicateStatus(prev => ({ ...prev, [field]: { status: 'idle', message: '' } }));
    }
  }, [table, data?.id, api, values.TCKN_Yok]);

  useEffect(() => {
    const fieldsToCheck = [
      { key: 'TCKN', condition: (type === 'create' || values.TCKN !== data?.TCKN) && values.TCKN },
      { key: 'Sicil_No', condition: (type === 'create' || values.Sicil_No !== data?.Sicil_No) && values.Sicil_No },
      { key: 'Mevki_Adi', condition: (type === 'create' || values.Mevki_Adi !== data?.Mevki_Adi) && table === TableNames.MEVKI && values.Mevki_Adi }
    ];

    const timers = fieldsToCheck.map(f => {
      if (f.condition) {
        // 🛡️ ANLIK SIFIRLAMA: Değer değiştiği an "ONAYLANDI" veya "HATA" durumunu temizle
        setDuplicateStatus(prev => ({ ...prev, [f.key]: { status: 'loading', message: '' } }));
        return setTimeout(() => checkDuplicates(f.key, values[f.key]), 600);
      } else {
        // Eğer şart sağlanmıyorsa (örn: TCKN_Yok açıldıysa) temizle
        setDuplicateStatus(prev => ({ ...prev, [f.key]: { status: 'idle', message: '' } }));
      }
      return null;
    });

    return () => timers.forEach(t => t && clearTimeout(t));
  }, [values.TCKN, values.Sicil_No, values.Mevki_Adi, type, table, checkDuplicates]);

  // --- Actions ---
  const onSaveRecord = async (overridePayload?: any) => {
    // 🛡️ EVENT SIZINTISI ENGELLEME: Eğer bir event nesnesi gelmişse onu yok say
    const isEvent = overridePayload && (overridePayload.nativeEvent || overridePayload.preventDefault);
    const actualPayload = isEvent ? null : overridePayload;

    if (!validation.isValid) {
      api.showAlert({ title: 'EKSİK BİLGİ', message: validation.missingFields.join(", "), type: 'warning' });
      return { success: false };
    }

    setIsProcessing(true);
    console.log(`[useRecordDetail:${table}] onSaveRecord başlatıldı.`, actualPayload || values);
    try {
      // 🛡️ KURUM MEVKİ OTOMASYONU: Eğer yeni bir mevki ismi yazılmışsa otomatik kaydet ve ID al
      let finalValues = { ...values };
      if (table === TableNames.TAPU) {
         try {
           const { LandService } = await import("../services/LandService");
           const resolvedMevkiId = await LandService.handleMevkiAutomation(values);
           if (resolvedMevkiId) {
              finalValues.Mevki_id = resolvedMevkiId;
           }
         } catch (mevkiErr) {
           console.warn("[useRecordDetail] Mevki otomasyonu atlandı:", mevkiErr);
         }
      }

      const payload = JSON.parse(JSON.stringify(actualPayload || (config.prepare ? config.prepare(finalValues) : finalValues)));
      console.log(`[useRecordDetail:${table}] IPC save-record isteği gönderiliyor...`);
      const res = await api.saveRecord(table, payload);
      console.log(`[useRecordDetail:${table}] IPC save-record yanıtı:`, res);

      if (res.success) {
        // 🛡️ Başarı durumunda beklemeden bildirimi göster ve süreci tamamla
        api.showAlert({ message: "KAYIT BAŞARIYLA ONAYLANDI.", type: 'success' });
        useAppStore.getState().notifyChange(table);
        
        if (onRefresh) {
          console.log(`[useRecordDetail:${table}] onRefresh tetikleniyor...`);
          onRefresh(res.id ? { ...payload, id: res.id } : payload);
        }

        if (type === 'create' && onClose) {
          console.log(`[useRecordDetail:${table}] Pencere kapatılıyor (onClose)...`);
          onClose(); 
        } else {
          setIsEditing(false);
          // 🛡️ Kayıt sonrası verileri tazeleyerek view'i güncelle
          loadProfile(true);
        }
      } else {
        api.showAlert({ title: 'TESCİL HATASI', message: res.error || 'Kayıt sırasında teknik bir sorun oluştu.', type: 'error' });
      }
      return res;
    } catch (e: any) {
      console.error(`[useRecordDetail:${table}] Save Error:`, e);
      let msg = e.message;
      if (msg.includes("UNIQUE constraint failed")) {
         msg = `HATA: BU ${table === TableNames.MEVKI ? 'MEVKİ İSMİ' : 'VERİ'} SİSTEMDE ZATEN KAYITLI!`;
      }
      api.showAlert({ title: 'KAYIT HATASI', message: msg, type: 'error' });
      return { success: false, error: msg };
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeleteRecord = async () => {
    if (!data?.id) return;
    setIsProcessing(true);
    try {
      const res = await (api.deleteRecord ? api.deleteRecord(table, data.id) : api.deleteDbRow(table, data.id));
      if (res.success) {
        api.showAlert({ message: "KAYIT SİLİNDİ.", type: 'success' });
        useAppStore.getState().notifyChange(table);
        setIsDeleteModalOpen(false);
        onRefresh?.();
        onClose?.();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    values, setValues, isEditing, setIsEditing, isProcessing, touched,
    onFieldBlur: (f: string) => setTouched((p: any) => ({ ...p, [f]: true })),
    activeTab, setActiveTab, isFormValid: validation.isValid, 
    missingFields: validation.missingFields,
    errors: [], // Gelecekteki detaylı hata mesajları için
    onSaveRecord,
    onDeleteRecord, isDeleteModalOpen, setIsDeleteModalOpen, profileData,
    duplicateStatus, tcknStatus: duplicateStatus.TCKN, sicilStatus: duplicateStatus.Sicil_No, mevkiStatus: duplicateStatus.Mevki_Adi,
    creationStep, setCreationStep, debounceTimer, setDebounceTimer,
    refresh: () => loadProfile(true)
  };
};
