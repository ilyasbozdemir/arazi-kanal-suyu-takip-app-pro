import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Lock, RefreshCw, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ElectronService } from '../../services/ElectronService';
import { getExcelColumnName } from '../../utils/numberUtils';
import { ReceiptSettings } from '../settings/ReceiptSettings';
import { GunSonuKapanisi } from '../accounting/GunSonuKapanisi';

// 🛡️ MODÜLER BİLEŞENLER
import { AccountingSidebar } from '../accounting/AccountingSidebar';
import { AccountingInsights } from '../accounting/AccountingInsights';
import { AccountingKasaTable } from '../accounting/AccountingKasaTable';
import { AccountingPersonelTable } from '../accounting/AccountingPersonelTable';
import { AccountingFisTable } from '../accounting/AccountingFisTable';
import { AccountingTransferForm } from '../accounting/AccountingTransferForm';
import { AccountingModals } from '../accounting/AccountingModals';
import { AccountingMovementModal } from '../accounting/AccountingMovementModal';
import { AccountingZTable } from '../accounting/AccountingZTable';

interface AccountingScreenProps {
  addTab?: (tab: any) => void;
  initialSubTab?: 'kasa' | 'personel' | 'transfer' | 'fisler' | 'gunsonu' | 'zraporu';
}

export const AccountingScreen: React.FC<AccountingScreenProps> = ({ addTab, initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'kasa' | 'personel' | 'transfer' | 'tahakkuklar' | 'fisler' | 'hareketler' | 'gunsonu' | 'zraporu'>(initialSubTab || 'kasa');
  const { refreshAll } = useAppStore();
  
  const [kasalar, setKasalar] = useState<any[]>([]);
  const [personel, setPersonel] = useState<any[]>([]);
  const [fisler, setFisler] = useState<any[]>([]);
  const [tahakkuklar, setTahakkuklar] = useState<any[]>([]);
  const [zRaporlari, setZRaporlari] = useState<any[]>([]);
  const [vatandaslar, setVatandaslar] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedKasaForMovements, setSelectedKasaForMovements] = useState<any>(null);
  const [kasaMovements, setKasaMovements] = useState<any[]>([]);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [thkFilter, setThkFilter] = useState<{ status: string, search: string }>({ status: 'Bekliyor', search: '' });
  
  const [newKasa, setNewKasa] = useState({ Kasa_Adi: '', Bakiye: 0, Konum: '', Zimmet_id: '' });
  const [newPersonel, setNewPersonel] = useState({ Unvan: 'Tahsildar', Vatandas_Id: '', Ad_Soyad: '' });
  const [newTahakkuk, setNewTahakkuk] = useState({ Vatandas_Id: '', Ad_Soyad: '', Miktar: 0, Tarih: new Date().toISOString().split('T')[0], Aciklama: '', Donem_Yili: new Date().getFullYear().toString() });
  const [transfer, setTransfer] = useState({ sourceId: '', targetId: '', amount: 0, description: '', method: 'NAKİT' });
  const [isTahsilatModalOpen, setIsTahsilatModalOpen] = useState(false);
  const [tahsilatItem, setTahsilatItem] = useState<any>(null);
  const [tahsilatForm, setTahsilatForm] = useState({ kasaId: '', method: 'NAKİT' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const kRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Kasalar');
      if (kRes.success) setKasalar(kRes.data || []);
      
      const pRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT p.*, v.Ad, v.Soyad, v.TCKN, v.Telefon as Vatandas_Telefon, v.Sicil_No,
               (COALESCE(v.Ad, '') || ' ' || COALESCE(v.Soyad, '')) as Ad_Soyad
        FROM TANIM_Personel p
        LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
        WHERE p.Aktif = 1
      `);
      if (pRes.success) setPersonel(pRes.data || []);

      const fRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT f.*, v.Ad, v.Soyad, v.TCKN, v.Sicil_No
        FROM MUHASEBE_Fisler f
        LEFT JOIN MUHASEBE_Tahsilat t ON t.Fis_id = f.id
        LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
        WHERE (f.deleted_at IS NULL OR f.deleted_at = '')
        GROUP BY f.id
        ORDER BY f.Tarih DESC
      `);
      if (fRes.success) setFisler(fRes.data || []);

      const sRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT 
          t.*, 
          v.Ad, 
          v.Soyad, 
          v.TCKN, 
          v.Sicil_No,
          (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0)) as Kalan_Borc,
          CASE 
            WHEN (t.Miktar - COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0)) <= 0 THEN 'Ödendi'
            WHEN COALESCE((SELECT SUM(ts.Miktar) FROM MUHASEBE_Tahsilat ts WHERE ts.Tahakkuk_id = t.id AND ts.deleted_at IS NULL), 0) > 0 THEN 'Kısmi'
            ELSE 'Bekliyor'
          END as Dinamik_Durum
        FROM MUHASEBE_Tahakkuk t
        LEFT JOIN DATA_Vatandas v ON t.Vatandas_Id = v.id
        WHERE (t.deleted_at IS NULL OR t.deleted_at = '')
        ORDER BY t.Tarih DESC
      `);
      
      if (sRes.success && sRes.data) {
        const mappedSuFisleri = sRes.data.map((s: any, idx: number) => ({
          ...s,
          Fis_No: s.Fis_No || `THK-${s.id?.substring(0,8).toUpperCase()}`,
          Tarih: s.Tarih,
          Aciklama: s.Aciklama || `SULAMA GELİRİ: ${s.Ad || ''} ${s.Soyad || ''}`,
          Tutar: s.Miktar || 0,
          Tur: 'GELİR',
          Kategori: 'SULAMA',
          Durum: s.Dinamik_Durum,
          Kalan_Borc: s.Kalan_Borc,
          Odeme_Yontemi: 'NAKİT',
          isSuFisi: true,
          Fis_id: s.Fis_id
        }));
        setTahakkuklar(mappedSuFisleri);
      }

      const vRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'DATA_Vatandas');
      if (vRes.success) setVatandaslar(vRes.data || []);

      const zRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT z.*, k.Kasa_Adi, v.Ad as Veznedar_Ad, v.Soyad as Veznedar_Soyad
        FROM MUHASEBE_Z_Raporu z
        LEFT JOIN TANIM_Kasalar k ON z.Kasa_id = k.id
        LEFT JOIN TANIM_Personel p ON z.Veznedar_id = p.id
        LEFT JOIN DATA_Vatandas v ON p.Vatandas_Id = v.id
        ORDER BY z.Tarih DESC
      `);
      if (zRes.success) setZRaporlari(zRes.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const loadKasaMovements = async (kasa: any) => {
    setSelectedKasaForMovements(kasa);
    setIsMovementsLoading(true);
    try {
      const sql = `
        SELECT * FROM (
          SELECT id, Tarih, Aciklama, Tutar, Tur, Odeme_Yontemi 
          FROM MUHASEBE_Fisler
          WHERE Kasa_id = ? AND (deleted_at IS NULL OR deleted_at = '')
          UNION ALL
          SELECT id, Tarih, Aciklama, Miktar as Tutar, 'GELİR' as Tur, Odeme_Yontemi 
          FROM MUHASEBE_Tahsilat
          WHERE Kasa_id = ? AND (deleted_at IS NULL OR deleted_at = '')
        ) 
        ORDER BY Tarih DESC
      `;
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql, [kasa.id, kasa.id]);
      if (res.success) setKasaMovements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMovementsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🛡️ KURUM ANINDA GÜNCELLEME: Kasa veya fiş eklendiğinde, hareketler sekmesi açıksa anında güncelleyin.
  useEffect(() => {
    if (selectedKasaForMovements) {
      loadKasaMovements(selectedKasaForMovements);
    }
  }, [kasalar]);

  const handleSaveKasa = async () => {
    if (!newKasa.Kasa_Adi) {
       ElectronService.showAlert({ message: 'Lütfen kasa adını giriniz.', type: 'warning' });
       return;
    }
    
    setIsLoading(true);
    try {
      // 🛡️ VERİ ARINDIRMA (Sarsılmaz POJO Garanti)
      const cleanData = {
        id: editingItem?.id || window.crypto.randomUUID(),
        Kasa_Adi: newKasa.Kasa_Adi.trim().toLocaleUpperCase('tr-TR'),
        Bakiye: Number(newKasa.Bakiye) || 0,
        Konum: newKasa.Konum ? newKasa.Konum.trim().toLocaleUpperCase('tr-TR') : '',
        Zimmet_id: newKasa.Zimmet_id && newKasa.Zimmet_id !== "" ? newKasa.Zimmet_id : null,
        Durum: 'AKTİF'
      };

      const res = await ElectronService.saveRecord('TANIM_Kasalar', cleanData);
      
      if (res.success) {
        setNewKasa({ Kasa_Adi: '', Bakiye: 0, Konum: '', Zimmet_id: '' });
        setEditingItem(null);
        setIsModalOpen(false);
        await loadData();
        ElectronService.showAlert({ 
          message: 'Kasa kayıtları kurumsal bütçe disiplini çerçevesinde mühürlendi.', 
          type: 'success' 
        });
      } else {
        ElectronService.showAlert({ 
          message: 'KAYIT HATASI: ' + (res.error || 'Veritabanı tescil işlemi reddetti.'), 
          type: 'error' 
        });
      }
    } catch (err: any) {
      console.error('[KASA_SAVE_ERROR]', err);
      ElectronService.showAlert({ message: 'Sistemsel bir hata oluştu: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKasa = async (id: string) => {
    const confirm = await ElectronService.showConfirm({
      title: 'KASA SİLME',
      message: 'Bu kasayı silmek istediğinizden emin misiniz?',
      type: 'warning'
    });
    if (confirm) {
      const res = await ElectronService.deleteRecord('TANIM_Kasalar', id);
      if (res.success) { loadData(); ElectronService.showAlert({ message: 'Kasa silindi.', type: 'success' }); }
    }
  };

  const handleRepairKasalar = async () => {
    setIsLoading(true);
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('repair-financial-seeds');
      if (res.success) {
        await loadData();
        ElectronService.showAlert({ 
          message: 'Varsayılan kasalar ve sistem operatörü başarıyla mühürlendi.', 
          type: 'success' 
        });
      } else {
        ElectronService.showAlert({ message: 'Onarım hatası: ' + res.error, type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersonel = async () => {
    if (!newPersonel.Vatandas_Id) {
       ElectronService.showAlert({ message: 'Lütfen geçerli bir TCKN giriniz.', type: 'warning' });
       return;
    }

    const cleanData = JSON.parse(JSON.stringify({
      id: editingItem?.id || window.crypto.randomUUID(),
      Vatandas_Id: newPersonel.Vatandas_Id,
      Unvan: newPersonel.Unvan || 'Tahsildar',
      Aktif: 1
    }));

    const res = await ElectronService.saveRecord('TANIM_Personel', cleanData);
    if (res.success) {
      setNewPersonel({ Unvan: 'Tahsildar', Vatandas_Id: '', Ad_Soyad: '' });
      setEditingItem(null);
      setIsModalOpen(false);
      await loadData();
      ElectronService.showAlert({ message: 'Personel kaydı resmi mevzuat çerçevesinde onaylandı.', type: 'success' });
    }
  };

  const handleSaveTahakkuk = async () => {
    if (!newTahakkuk.Vatandas_Id || !newTahakkuk.Miktar) {
       ElectronService.showAlert({ message: 'Lütfen TCKN ve Miktar alanlarını doldurunuz.', type: 'warning' });
       return;
    }

    const cleanData = JSON.parse(JSON.stringify({
      id: editingItem?.id || window.crypto.randomUUID(),
      Vatandas_Id: newTahakkuk.Vatandas_Id,
      Miktar: Number(newTahakkuk.Miktar),
      Tarih: newTahakkuk.Tarih,
      Donem_Yili: newTahakkuk.Donem_Yili || new Date().getFullYear().toString(),
      Durum: 'Bekliyor',
      Aciklama: newTahakkuk.Aciklama || 'MANUEL TAHAKKUK'
    }));

    const res = await ElectronService.saveRecord('MUHASEBE_Tahakkuk', cleanData);
    if (res.success) {
      setNewTahakkuk({ Vatandas_Id: '', Ad_Soyad: '', Miktar: 0, Tarih: new Date().toISOString().split('T')[0], Aciklama: '', Donem_Yili: new Date().getFullYear().toString() });
      setIsModalOpen(false);
      await loadData();
      ElectronService.showAlert({ message: 'Manuel tahakkuk kaydı oluşturuldu.', type: 'success' });
    }
  };

  const handleTransfer = async () => {
    if (!transfer.sourceId || !transfer.targetId || transfer.amount <= 0) return;
    const sourceKasa = kasalar.find(k => k.id === transfer.sourceId);
    if (transfer.method === 'NAKİT' && sourceKasa && sourceKasa.Bakiye < transfer.amount) {
      ElectronService.showAlert({ message: 'Kaynak kasada yeterli NAKİT bakiye yok!', type: 'error' });
      return;
    }
    const res = await (window as any).electron.ipcRenderer.invoke('transfer-cash', transfer);
    if (res.success) {
      setTransfer({ sourceId: '', targetId: '', amount: 0, description: '', method: 'NAKİT' });
      loadData();
      ElectronService.showAlert({ message: 'Transfer işlemi başarıyla kaydedildi.', type: 'success' });
    }
  };

  const handleSaveTahsilat = async () => {
    if (!tahsilatItem || !tahsilatForm.kasaId) {
      ElectronService.showAlert({ message: 'Lütfen bir kasa seçiniz.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      // 🛡️ Sarsılmaz Tahsilat Tescili (Domain Service Üzerinden)
      const res = await ElectronService.accounting.saveCollection({
        Vatandas_Id: tahsilatItem.Vatandas_Id || tahsilatItem.TCKN, 
        Miktar: tahsilatItem.Tutar || tahsilatItem.Miktar,
        Tahakkuk_id: tahsilatItem.isSuFisi ? tahsilatItem.id : null, // 🛡️ ONLY link if it's a real accrual
        Kasa_id: tahsilatForm.kasaId,
        Odeme_Yontemi: tahsilatForm.method,
        Tarih: new Date().toISOString(),
        Aciklama: `SULAMA TAHSİLATI: ${tahsilatItem.Ad || ''} ${tahsilatItem.Soyad || ''}`
      });

      if (res.success) {
        // 🛡️ SARSILMAZ SENKRONİZASYON: Kasa mağazasını uyandır
        try {
          const { useKasaStore } = await import('../../stores/kasaStore');
          useKasaStore.getState().invalidate();
          // useKasaStore.getState().fetchKasaHareketleri(true);
        } catch (e) { console.warn("Kasa Store Sync Skipped"); }

        setIsTahsilatModalOpen(false);
        setTahsilatItem(null);
        await loadData();
        ElectronService.showAlert({ message: 'Tahsilat işlemi, resmi fiş ve kasa bakiyesi kurumsal nizamla tescil edildi.', type: 'success' });
      }
    } catch (err: any) {
      ElectronService.showAlert({ message: 'HATA: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonName = (id: string) => {
    const p = personel.find(x => x.id === id);
    return p ? `${p.Ad || ''} ${p.Soyad || ''}` : 'ZİMMET YOK';
  };

  const handleOpenTahsilatModal = (fis: any) => {
    setTahsilatItem(fis);
    
    // 🛡️ OTOMATİK KASA TAYİNİ (Sarsılmaz Algoritma)
    // Önce aktif personeli bulalım
    const { profile } = useAppStore.getState();
    const currentP = personel.find(p => p.Vatandas_Id === profile?.id || p.Vatandas_Id === profile?.citizenId);
    
    // Eğer NAKİT ise personelin zimmetli nakit kasasını bul
    let defaultKasa = kasalar.find(k => k.Zimmet_id === currentP?.id && k.Kasa_Adi.includes('NAKİT'))?.id;
    
    // Bulamadıysa ilk kasayı seç (fallback)
    if (!defaultKasa) defaultKasa = kasalar[0]?.id || '';

    setTahsilatForm({ kasaId: defaultKasa, method: 'NAKİT' });
    setIsTahsilatModalOpen(true);
  };

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 🛡️ MODÜLER SIDEBAR */}
      <div className="flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm">
        <AccountingSidebar 
          activeSubTab={activeSubTab} 
          setActiveSubTab={setActiveSubTab} 
          kasalar={kasalar} 
          fisler={fisler}
          loadData={loadData} 
          refreshAll={refreshAll} 
        />
        <div className="p-4 border-t border-slate-100 dark:border-white/5">
          <button 
            title="GÜNÜ KAPAT"
            onClick={() => setActiveSubTab('gunsonu')}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Lock size={14} /> GÜNÜ KAPAT
          </button>
        </div>
      </div>

      {/* 🛡️ ANA İÇERİK */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🧠 SMART INSIGHTS */}
        <div className="px-8 pt-8 no-print">
           <AccountingInsights 
              kasalar={kasalar} 
              onAddKasa={handleRepairKasalar}
           />
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeSubTab === 'transfer' && (
              <AccountingTransferForm 
                transfer={transfer} 
                setTransfer={setTransfer} 
                kasalar={kasalar} 
                handleTransfer={handleTransfer} 
              />
            )}

            {['kasa','personel','tahakkuklar','fisler','zraporu'].includes(activeSubTab) && (
              <motion.div 
                key="list" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm"
              >
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase italic">{activeSubTab.toUpperCase()} LİSTESİ</h3>
                    <button 
                      title="Listeyi Yenile"
                      onClick={loadData}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-all active:scale-95"
                    >
                      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {activeSubTab === 'tahakkuklar' && (
                      <div className="flex items-center gap-3 ml-4">
                        <select 
                          value={thkFilter.status}
                          onChange={(e) => setThkFilter({ ...thkFilter, status: e.target.value })}
                          className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="HEPSİ">TÜM DURUMLAR</option>
                          <option value="Bekliyor">BEKLEYENLER</option>
                          <option value="Kısmi">KISMİ ÖDENENLER</option>
                          <option value="Ödendi">TAMAMLANANLAR</option>
                        </select>
                        <input 
                          type="text"
                          placeholder="TCKN VEYA AD SOYAD..."
                          value={thkFilter.search}
                          onChange={(e) => setThkFilter({ ...thkFilter, search: e.target.value })}
                          className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500 w-48"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {activeSubTab === 'kasa' && (
                      <button 
                        title="Yeni Kasa Ekle"
                        onClick={() => { setEditingItem(null); setNewKasa({ Kasa_Adi: '', Bakiye: 0, Konum: '', Zimmet_id: '' }); setIsModalOpen(true); }} 
                        className="px-4 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-primary-500/20"
                      >
                        Yeni Kasa
                      </button>
                    )}
                    {activeSubTab === 'personel' && (
                      <button 
                        title="Yeni Personel Ekle"
                        onClick={() => { setEditingItem(null); setNewPersonel({ Unvan: '', Vatandas_Id: '', Ad_Soyad: '' }); setIsModalOpen(true); }} 
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        Yeni Personel
                      </button>
                    )}
                    {activeSubTab === 'tahakkuklar' && (
                      <button 
                        title="Yeni Tahakkuk Ekle"
                        onClick={() => { setEditingItem(null); setNewTahakkuk({ Vatandas_Id: '', Ad_Soyad: '', Miktar: 0, Tarih: new Date().toISOString().split('T')[0], Aciklama: '', Donem_Yili: new Date().getFullYear().toString() }); setIsModalOpen(true); }} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        MANUEL BORÇ EKLE
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                   {activeSubTab === 'kasa' && (
                     <AccountingKasaTable 
                        kasalar={kasalar} 
                        personel={personel}
                        addTab={addTab}
                        loadKasaMovements={loadKasaMovements} 
                        setActiveSubTab={setActiveSubTab}
                        setEditingItem={setEditingItem} 
                        setNewKasa={setNewKasa} 
                        setIsModalOpen={setIsModalOpen} 
                        handleDeleteKasa={handleDeleteKasa} 
                     />
                   )}
                   {activeSubTab === 'personel' && (
                     <AccountingPersonelTable 
                        personel={personel} 
                        setEditingItem={setEditingItem} 
                        setNewPersonel={setNewPersonel} 
                        setIsModalOpen={setIsModalOpen} 
                     />
                   )}
                    {activeSubTab === 'tahakkuklar' && (
                      <AccountingFisTable 
                        fisler={tahakkuklar.filter(t => {
                          const statusMatch = thkFilter.status === 'HEPSİ' || t.Durum === thkFilter.status;
                          const searchMatch = !thkFilter.search || 
                            t.TCKN?.includes(thkFilter.search) || 
                            t.Ad?.toLocaleUpperCase('tr-TR').includes(thkFilter.search.toLocaleUpperCase('tr-TR')) || 
                            t.Soyad?.toLocaleUpperCase('tr-TR').includes(thkFilter.search.toLocaleUpperCase('tr-TR'));
                          return statusMatch && searchMatch;
                        })} 
                        onMutabakat={handleOpenTahsilatModal} 
                      />
                    )}
                    {activeSubTab === 'fisler' && (
                      <AccountingFisTable 
                        fisler={fisler} 
                      />
                    )}
                    {activeSubTab === 'zraporu' && (
                      <AccountingZTable 
                        reports={zRaporlari} 
                      />
                    )}
                </div>
              </motion.div>
            )}


            {activeSubTab === 'hareketler' && (
              <motion.div key="hareketler" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">KASA HAREKET İZLEYİCİ</h3>
                  </div>
                  <select 
                    title="İzlenecek Kasayı Seçin"
                    value={selectedKasaForMovements?.id || ''}
                    onChange={(e) => {
                       const k = kasalar.find(x => x.id === e.target.value);
                       if (k) loadKasaMovements(k);
                    }}
                    className="px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary-500"
                  >
                    <option value="">Kasa Seçiniz...</option>
                    {kasalar.map(k => <option key={k.id} value={k.id}>{k.Kasa_Adi} ({new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(k.Bakiye || 0)})</option>)}
                  </select>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-8">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5">
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Açıklama</th>
                          <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yöntem</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutar</th>
                          <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Kasa Bakiye</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {(() => {
                          let currentRunning = (selectedKasaForMovements?.Bakiye || 0) + (selectedKasaForMovements?.Pos_Bakiye || 0);
                          return kasaMovements.map(m => {
                            const bakiyeAtThisPoint = currentRunning;
                            if (m.Tur === 'GELİR') {
                               currentRunning -= (m.Tutar || 0);
                            } else {
                               currentRunning += (m.Tutar || 0);
                            }
                            return (
                              <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all group">
                                <td className="py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                  {new Date(m.Tarih).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="py-4">
                                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">{m.Aciklama}</span>
                                </td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${m.Odeme_Yontemi === 'KREDİ KARTI' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {m.Odeme_Yontemi || 'NAKİT'}
                                  </span>
                                </td>
                                <td className={`py-4 text-right font-black text-sm tabular-nums ${m.Tur === 'GELİR' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {m.Tur === 'GELİR' ? '+' : '-'} {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(m.Tutar || 0)}
                                </td>
                                <td className="py-4 text-right font-black text-sm tabular-nums text-slate-600 dark:text-slate-300">
                                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bakiyeAtThisPoint)}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                        {kasaMovements.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-40">
                              {selectedKasaForMovements ? 'BU KASADA HENÜZ BİR HAREKET KAYDEDİLMEMİŞ.' : 'HAREKETLERİ GÖRMEK İÇİN BİR KASA SEÇİN.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'gunsonu' && (
              <motion.div key="gunsonu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GunSonuKapanisi kasalar={kasalar} personel={personel} onDone={() => { loadData(); setActiveSubTab('zraporu'); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 🛡️ MODÜLER MODALLAR */}
      <AccountingModals 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        activeSubTab={activeSubTab} 
        editingItem={editingItem} 
        newKasa={newKasa} 
        setNewKasa={setNewKasa} 
        newPersonel={newPersonel} 
        setNewPersonel={setNewPersonel} 
        newTahakkuk={newTahakkuk}
        setNewTahakkuk={setNewTahakkuk}
        personel={personel} 
        handleSaveKasa={handleSaveKasa} 
        handleSavePersonel={handleSavePersonel} 
        handleSaveTahakkuk={handleSaveTahakkuk}
        isTahsilatModalOpen={isTahsilatModalOpen}
        setIsTahsilatModalOpen={setIsTahsilatModalOpen}
        tahsilatItem={tahsilatItem}
        tahsilatForm={tahsilatForm}
        setTahsilatForm={setTahsilatForm}
        kasalar={kasalar}
        handleSaveTahsilat={handleSaveTahsilat}
      />

      {/* Hareketler Modal'ı kaldırıldı, sekme (inline) gösterimi kullanılıyor. */}

    </div>
  );
};
