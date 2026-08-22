import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, LayoutGrid, Archive, Trash2, ArrowRight, Lock, CheckCircle2, AlertCircle, Users, FileWarning } from "lucide-react";
import { motion } from "framer-motion";
import { ElectronService } from "../../../services/ElectronService";

interface LedgerCardProps {
  ledger: any;
  mahalle: any;
  personel: any[];
  allKocanlar: any[];
  onOpen: (ledger: any) => void;
  onRefresh: () => void;
  onOpenDetail: (table: string, data: any) => void;
  onOpenCreate: (table: string, initialData: any) => void;
}

export const LedgerCard: React.FC<LedgerCardProps> = ({ 
  ledger, mahalle, personel, onOpen, onRefresh
}) => {
  const year = ledger.Baslangic_Yili;
  const isArchived = ledger.Durum === 'Arşivlendi';
  const [kayitSayisi, setKayitSayisi] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // 🛡️ Dönem içindeki kayıt sayısını çek (Donem_id ile)
  useEffect(() => {
    const loadCount = async () => {
      setIsLoadingCount(true);
      try {
        const sql = `SELECT COUNT(*) as cnt FROM DATA_Dagitim_Kayitlar WHERE Donem_id = '${ledger.id}' AND (deleted_at IS NULL OR deleted_at = '')`;
        const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql);
        if (res.success && res.data?.length > 0) {
          setKayitSayisi(res.data[0].cnt ?? 0);
        } else {
          setKayitSayisi(0);
        }
      } catch {
        setKayitSayisi(0);
      } finally {
        setIsLoadingCount(false);
      }
    };
    loadCount();
  }, [ledger.id]);

  const hasKayit = (kayitSayisi ?? 0) > 0;
  const [ledgerMeravs, setLedgerMeravs] = useState<any[]>([]);

  // 🛡️ Deftere atanmış özel merakları çek
  useEffect(() => {
    const loadMeravs = async () => {
      try {
        const sql = `
          SELECT m.id, (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
          FROM REL_Defter_Merav r
          JOIN TANIM_Meravlar m ON r.Merav_id = m.id
          JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
          WHERE r.Defter_id = '${ledger.id}' AND (r.deleted_at IS NULL OR r.deleted_at = '')
        `;
        const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql);
        if (res.success) setLedgerMeravs(res.data || []);
      } catch (err) { console.error(err); }
    };
    loadMeravs();
  }, [ledger.id]);

  const assignedPersonel = useMemo(() => {
    if (ledgerMeravs.length > 0) return ledgerMeravs;
    return personel.filter(p => String(p.id) === String(mahalle?.Sorumlu_Merav_id));
  }, [ledgerMeravs, personel, mahalle?.Sorumlu_Merav_id]);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived) return;
    const confirm = await ElectronService.showConfirm({ 
      title: 'Dönem Arşivleme',
      message: `${year} yılı defterini arşivlemek istiyor musunuz? Arşivlenen defterlere yeni kayıt eklenemez.`,
      type: 'warning'
    });
    if (confirm) {
      const res = await (window as any).electron.ipcRenderer.invoke('archive-ledger', ledger.id);
      if (res.success) {
        ElectronService.showAlert({ message: `${year} yılı defteri arşivlendi.`, type: 'success' });
        onRefresh();
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasKayit) {
      ElectronService.showAlert({ 
        message: `Bu dönemde ${kayitSayisi} adet kayıt bulunmaktadır. Kayıtlı dönem silinemez!`, 
        type: 'error' 
      });
      return;
    }
    const confirmText = await (window as any).api?.showPrompt?.({ 
      title: 'DEFTER SİLİNECEK',
      message: `${year} yılına ait defteri silmek için "SORUMLULUGU KABUL EDIYORUM" yazınız:`,
    });
    if (confirmText === "SORUMLULUGU KABUL EDIYORUM") {
      const res = await ElectronService.deleteRecord('DATA_Dagitim_Donemleri', ledger.id);
      if (res.success) {
        ElectronService.showAlert({ message: "Defter silindi.", type: 'success' });
        onRefresh();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[28px] transition-all hover:shadow-2xl hover:shadow-primary-500/10 overflow-hidden"
    >
      {/* Status bar */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${isArchived ? 'bg-blue-500' : 'bg-emerald-500'}`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${isArchived ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-500'} rounded-2xl flex items-center justify-center`}>
              <Calendar size={22} />
            </div>
            <div>
              <h4 className="text-xl font-black italic tracking-tighter text-slate-800 dark:text-white leading-none mb-1">
                {year} SEZONU
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isArchived ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                  {isArchived ? 'ARŞİV' : 'AKTİF'}
                </span>
                {isArchived && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                    <Lock size={10} /> SALT OKUNUR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isArchived && (
              <button 
                onClick={handleArchive}
                className="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" 
                title="Arşivle"
              >
                <Archive size={14} />
              </button>
            )}
            <button 
              onClick={handleDelete}
              className={`p-2 rounded-xl transition-all ${hasKayit ? 'bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
              title={hasKayit ? `${kayitSayisi} kayıt mevcut - Silinemez` : "Sil"}
            >
              {hasKayit ? <Lock size={14} /> : <Trash2 size={14} />}
            </button>
          </div>
        </div>

        {/* 🛡️ Kayıt Durumu */}
        <div className={`flex items-center gap-3 p-3 rounded-2xl ${
          isLoadingCount ? 'bg-slate-50 dark:bg-white/5' :
          hasKayit ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20' : 
          'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20'
        }`}>
          {isLoadingCount ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest">KONTROL EDİLİYOR...</span>
            </div>
          ) : hasKayit ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">KAYITLAR MEVCUT</p>
                <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">{kayitSayisi?.toLocaleString('tr-TR')} adet dağıtım kaydı</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">KAYIT YOK</p>
                <p className="text-xs font-black text-amber-700 dark:text-amber-300">Henüz kayıt girilmemiş</p>
              </div>
            </>
          )}
        </div>

        {/* Personel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignedPersonel.length > 0 ? (
              <>
                <Users size={12} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest" title="Sorumlu Saha Görevlisi">
                  {assignedPersonel[0].Ad_Soyad}
                </span>
              </>
            ) : (
              <>
                <FileWarning size={12} className="text-amber-400" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest" title="Atama Bekleniyor">
                  SORUMLU ATANMAMIŞ
                </span>
              </>
            )}
          </div>
        </div>

        {/* Detay Butonu */}
        <button 
          onClick={() => onOpen(ledger)}
          className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            isArchived 
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20' 
            : 'bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700 text-white'
          }`}
        >
          {isArchived ? <><Lock size={12} /> SALT OKUNUR GÖRÜNTÜLE</> : <>KAYITLARA GİR <ArrowRight size={14} /></>}
        </button>
      </div>

      {/* Watermark */}
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <LayoutGrid size={100} />
      </div>
    </motion.div>
  );
};
