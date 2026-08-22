import React, { useState, useEffect, useMemo } from 'react';
import { ElectronService } from '../../../services/ElectronService';
import { useAppStore } from '../../../store/useAppStore';
import { ModernAlert } from '../../../components/ui/ModernAlert';
import { DistributionHeader } from './DistributionHeader';
import { DistributionTable } from './DistributionTable';
import { DistributionCardView } from './DistributionCardView';
import { DistributionFormModal } from './DistributionFormModal';
import { DistributionDetailModal } from './DistributionDetailModal';

interface DistributionGridProps {
  ledgerId: string; 
  mahalleId: string;
  mahalleName: string;
  yil: string | number;
  isArchived?: boolean;
  onOpenMakbuzTab?: () => void;
  externalSearchTerm?: string;
  pricing?: any;
  receiptBooks?: any[];
}

export const DistributionGrid: React.FC<DistributionGridProps> = ({ 
  ledgerId, 
  mahalleId, 
  mahalleName, 
  yil, 
  isArchived = false, 
  onOpenMakbuzTab,
  externalSearchTerm,
  pricing: propsPricing,
  receiptBooks: propsReceiptBooks
}) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<any | null>(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info' as any, title: '', message: '' });

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const [citizens, setCitizens] = useState<any[]>([]);
  const [selectedCitizenProperties, setSelectedCitizenProperties] = useState<any[]>([]);
  const [internalPricing, setInternalPricing] = useState<any>(null);
  const [internalReceiptBooks, setInternalReceiptBooks] = useState<any[]>([]);
  
  const pricing = propsPricing || internalPricing;
  const receiptBooks = propsReceiptBooks || internalReceiptBooks;
  const [personel, setPersonel] = useState<any[]>([]);
  const { profile } = useAppStore();
  
  // 🛡️ PAGINATION & LIMITS
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedPropertySuHakki, setSelectedPropertySuHakki] = useState<number | null>(null);
  const [usedMinutesForSelected, setUsedMinutesForSelected] = useState<number>(0);

  // 🛡️ FORM VERİLERİ
  const [newEntry, setNewEntry] = useState<any>({
    id: '',
    TCKN: '',
    Ad_Soyad: '',
    Tasinmaz_id: '',
    Ada_Parsel: '',
    Sure_Saat: 0,
    Tutar: 0,
    Tarife_Modu: 'SUN',
    Makbuz_Defter_id: '',
    Makbuz_Defter_Adi: '',
    Makbuz_No: '',
    Odeme_Durumu: 'Beklemede',
    Tahsildar_id: '',
    Aciklama: '',
    Tarih: '',
    Son_Odeme_Tarihi: '',
    vatandas_id: ''
  });

  // 🛡️ PERSONEL YÜKLENDİĞİNDE VARSA İLKİNİ SEÇ
  useEffect(() => {
    if (personel.length > 0 && !newEntry.Tahsildar_id) {
      setNewEntry((prev: any) => ({ ...prev, Tahsildar_id: personel[0].merav_id }));
    }
  }, [personel]);

  // 🛡️ AKILLI MAKBUZ DEFTERİ EŞLEŞTİRMESİ
  useEffect(() => {
    if (newEntry.Tahsildar_id && receiptBooks.length > 0) {
      const activeBook = receiptBooks.find(b => b.Sorumlu_Merav_id === newEntry.Tahsildar_id && b.aktif === 1);
      if (activeBook) {
        const nextNo = String((activeBook.son_no || 0) + 1).padStart(4, '0');
        setNewEntry((prev: any) => ({ 
          ...prev, 
          Makbuz_Defter_id: activeBook.id,
          Makbuz_Defter_Adi: activeBook.defter_adi,
          Makbuz_No: nextNo
        }));
      }
    }
  }, [newEntry.Tahsildar_id, receiptBooks]);

  const loadData = async () => {
    if (!ledgerId) return;
    setIsLoading(true);
    try {
      const sql = `
        SELECT 
          t.*, 
          (v.Ad || ' ' || v.Soyad) as Full_Name,
          v.TCKN as Vatandas_TCKN,
          v.Sicil_No as Vatandas_Sicil_No,
          (p.Ada || ' / ' || p.Parsel) as Ada_Parsel,
          m.Mevki_Adi as Mevki,
          m.id as Mevki_id,
          th.Durum as Gercek_Durum,
          k.defter_adi as Kocan_Adi,
          (SELECT GROUP_CONCAT(v_s.Ad || ' ' || v_s.Soyad, ', ') 
           FROM REL_TASINMAZ_VATANDAS ts 
           JOIN DATA_Vatandas v_s ON ts.Vatandas_Id = v_s.id 
           WHERE ts.Tasinmaz_id = t.Tasinmaz_id) as Hissedarlar,
          (SELECT (v_m.Ad || ' ' || v_m.Soyad) 
           FROM TANIM_Meravlar m_inner 
           JOIN DATA_Vatandas v_m ON m_inner.Vatandas_Id = v_m.id 
           WHERE m_inner.id = t.Merav_id) as Merav_Ad_Soyad
        FROM DATA_Dagitim_Kayitlar t
        LEFT JOIN DATA_Vatandas v ON (t.Vatandas_Id = v.id OR t.Vatandas_Id = v.TCKN)
        LEFT JOIN DATA_Tapu_Verisi p ON t.Tasinmaz_id = p.id
        LEFT JOIN DATA_Tasinmaz_Mevkileri m ON p.Mevki_id = m.id
        LEFT JOIN MUHASEBE_Tahakkuk th ON t.id = th.Fis_id
        LEFT JOIN TANIM_Sulama_Fis_Kocanlari k ON t.Makbuz_Defter_id = k.id
        WHERE t.Donem_id = ?
        GROUP BY t.id
        ORDER BY t.Tarih DESC
      `;
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', sql, [ledgerId]);
      
      if (res.success && res.data) {
        const mappedData = res.data.map((r: any) => ({
          ...r,
          TCKN: r.Vatandas_TCKN || r.TCKN || '',
          Sicil_No: r.Vatandas_Sicil_No || '',
          Ad_Soyad: r.Full_Name || r.Ad_Soyad || r.Vatandas_Ad_Soyad || 'Bilinmeyen Mükellef',
          Ada_Parsel: r.Ada_Parsel || r.Ada_Parsel_Text || 'Tanımsız Taşınmaz',
          Mevki: r.Mevki || r.Mevki_Text || '',
          Sure_Saat: r.Sure_Saat || r.Kullanim_Saati || 0,
          Tutar: r.Tutar || r.Toplam_Tutar || 0,
          Odeme_Durumu: r.Gercek_Durum || r.Odeme_Durumu || r.Durum || 'Beklemede',
          Tahsildar_id: r.Tahsildar_id || r.Merav_id || '',
          Makbuz_Defter_Adi: r.Kocan_Adi || r.Makbuz_Defter_Adi || '',
          Makbuz_No: r.Makbuz_No || r.Makbuz_Sira_No || '',
          Tahsildar_Adi: r.Merav_Ad_Soyad || 'Atanmamış',
          Tarife_Modu: r.Tarife_Modu || 'SUN'
        }));
        setData(mappedData);
        console.log(`🛡️ SARSILMAZ VERİ YÜKLENDİ: ${mappedData.length} kayıt (Defter ID: ${ledgerId})`);
      } else {
        console.error("❌ SARSILMAZ VERİ HATASI:", res.error);
      }

      const priceRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT u.*, v.vergi_orani, v.vergi_adi 
        FROM TANIM_Su_Ucretleri u
        LEFT JOIN TANIM_Vergi_Oranlari v ON u.vergi_id = v.id
        WHERE u.is_active = 1
        LIMIT 1
      `);
      if (priceRes.success && priceRes.data?.length > 0) setInternalPricing(priceRes.data[0]);

      const bookRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Sulama_Fis_Kocanlari', { Donem_id: ledgerId });
      if (bookRes.success) setInternalReceiptBooks(bookRes.data || []);

      const pRes = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
        SELECT m.id as merav_id, m.*, (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
        FROM REL_Defter_Merav r
        JOIN TANIM_Meravlar m ON r.Merav_id = m.id
        JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id
        WHERE r.Defter_id = ? AND (r.deleted_at IS NULL OR r.deleted_at = '')
      `, [ledgerId]);
      if (pRes.success) setPersonel(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [ledgerId]);

  // 🛡️ Yan Menü Arama Senkronizasyonu
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
      setCurrentPage(1);
    }
  }, [externalSearchTerm]);

  const searchCitizens = async (term: string) => {
    if (term.length < 2) {
      setCitizens([]);
      return;
    }
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      `SELECT id, Ad, Soyad, TCKN, Sicil_No, Baba_Adi, Mahalle_Koy, Unvan FROM DATA_Vatandas 
       WHERE (deleted_at IS NULL OR deleted_at = '') 
       AND (TR_SEARCH(Ad) LIKE TR_SEARCH(?) OR TR_SEARCH(Soyad) LIKE TR_SEARCH(?) OR TR_SEARCH(Unvan) LIKE TR_SEARCH(?) OR TCKN LIKE ? OR Sicil_No LIKE ?) 
       LIMIT 10`, 
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
    );
    if (res.success) setCitizens(res.data || []);
  };

  const loadProperties = async (vatandasId: string) => {
    // 🛡️ Sarsılmaz Mülkiyet Taraması: Hem malik hem zilyet kayıtlarını getir
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
      SELECT t.*, m.Mevki_Adi as Mevki
      FROM DATA_Tapu_Verisi t
      LEFT JOIN DATA_Tasinmaz_Mevkileri m ON t.Mevki_id = m.id
      LEFT JOIN REL_TASINMAZ_VATANDAS s ON t.id = s.Tasinmaz_id
      LEFT JOIN REL_TASINMAZ_ZILYET z ON t.id = z.Tasinmaz_id
      WHERE (s.Vatandas_Id = ? OR z.Vatandas_Id = ?)
      AND (t.deleted_at IS NULL OR t.deleted_at = '')
      GROUP BY t.id
    `, [vatandasId, vatandasId]);
    
    if (res.success) setSelectedCitizenProperties(res.data || []);
  };

  const fetchUsedMinutes = async (tasinmazId: string, excludeId?: string) => {
    if (!tasinmazId) return;
    const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      `SELECT * FROM DATA_Dagitim_Kayitlar WHERE Tasinmaz_id = ? AND Donem_id = ? AND (deleted_at IS NULL OR deleted_at = '')`, 
      [tasinmazId, ledgerId]
    );
    if (res.success && res.data) {
      let total = res.data.reduce((sum: number, r: any) => sum + (Number((r.Sure_Saat || 0) * 60) || 0), 0);
      if (excludeId) {
        const currentRec = res.data.find((r: any) => r.id === excludeId);
        if (currentRec) total -= (Number((currentRec.Sure_Saat || 0) * 60) || 0);
      }
      setUsedMinutesForSelected(total);
    }
  };

  const handleCalculateTutar = (hours: number, tarife: string) => {
    if (!pricing) return 0;
    const birimFiyat = tarife === 'SUN' ? pricing.gunduz_fiyat : pricing.gece_fiyat;
    const baseAmount = hours * (birimFiyat || 0);
    
    // 🛡️ KDV Hesaplama Mantığı
    if (pricing.vergi_orani) {
      if (pricing.kdv_dahil === 1) {
        return baseAmount; // Zaten dahil
      } else {
        return baseAmount * (1 + pricing.vergi_orani); // Hariçse ekle
      }
    }
    return baseAmount;
  };

  const handleSaveEntry = async () => {
    if (isArchived) return;
    if (!newEntry.TCKN || !newEntry.Tasinmaz_id) {
      ElectronService.showAlert({ message: "Lütfen tüm zorunlu alanları doldurunuz.", type: 'error' });
      return;
    }

    try {
      const selectedBook = receiptBooks.find(b => b.defter_adi === newEntry.Makbuz_Defter_Adi);
      const entryId = newEntry.id || window.crypto.randomUUID();
      const entry: any = {
        id: entryId,
        Donem_id: ledgerId,
        Mahalle_id: mahalleId,
        Tasinmaz_id: newEntry.Tasinmaz_id,
        Vatandas_Id: newEntry.vatandas_id || newEntry.TCKN || '',
        Merav_id: newEntry.Tahsildar_id,
        Tarih: newEntry.Tarih || new Date().toISOString(),
        Kullanim_Saati: newEntry.Sure_Saat,
        Sure_Saat: newEntry.Sure_Saat,
        Tarife_Modu: newEntry.Tarife_Modu === 'NIGHT' ? 'NIGHT' : 'SUN',
        Birim_Fiyat: newEntry.Tarife_Modu === 'NIGHT' ? (pricing?.gece_fiyat || 0) : (pricing?.gunduz_fiyat || 0),
        Toplam_Tutar: newEntry.Tutar,
        Makbuz_Defter_id: selectedBook?.id || '',
        Makbuz_No: newEntry.Makbuz_No || '',
        Aciklama: newEntry.Aciklama || ''
      };

      if (isOverLimit) {
        const confirmLimit = await ElectronService.showConfirm({
          title: 'KRİTİK LİMİT AŞIMI!',
          message: `Bu parselin aylık su hakkı (${selectedPropertySuHakki} Saat) dolmuştur. Yine de devam etmek istiyor musunuz?`,
          type: 'warning'
        });
        if (!confirmLimit) return;
      }

      const res = await ElectronService.saveRecord('DATA_Dagitim_Kayitlar', entry);
      if (res.success) {
        // 🛡️ Sarsılmaz Tahakkuk: Otomatik olarak AccountingService.saveWaterBill tarafından oluşturulur.
        
        if (selectedBook) {
          await ElectronService.saveRecord('TANIM_Sulama_Fis_Kocanlari', {
            ...selectedBook,
            son_no: parseInt(entry.Makbuz_No) || selectedBook.son_no
          });
        }
        ElectronService.showAlert({ message: "Kayıt ve Tahakkuk başarıyla mühürlendi.", type: 'success' });
        setIsAddModalOpen(false);
        setNewEntry({ id: '', TCKN: '', Ad_Soyad: '', Tasinmaz_id: '', Ada_Parsel: '', Sure_Saat: 0, Tutar: 0, Tarife_Modu: 'SUN', Makbuz_Defter_Adi: '', Makbuz_No: '', Odeme_Durumu: 'Beklemede', Tahsildar_id: '', Aciklama: '', Tarih: '', vatandas_id: '' });
        setSelectedPropertySuHakki(null);
        setUsedMinutesForSelected(0);
        loadData();
      }
    } catch (err: any) {
      ElectronService.showAlert({ message: `Sistem Hatası: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isArchived) return;

    // 🛡️ Sarsılmaz Mali Kontrol: Tahsilat var mı bak
    const paymentCheck = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
      "SELECT COUNT(*) as sayi FROM MUHASEBE_Tahsilat WHERE Tahakkuk_id = (SELECT id FROM MUHASEBE_Tahakkuk WHERE Fis_id = ?)", 
      [id]
    );

    if (paymentCheck.success && paymentCheck.data[0].sayi > 0) {
      await (window as any).electron.ipcRenderer.invoke('show-alert', {
        title: "SİLEMEZSİNİZ!",
        message: `Bu kayda ait ${paymentCheck.data[0].sayi} adet tahsilat (ödeme) bulunmaktadır. Ödemesi olan kayıtlar silinemez! Önce tahsilatı iptal etmelisiniz.`,
        type: 'error'
      });
      return;
    }

    const confirm = await ElectronService.showConfirm({
      title: "Kayıt Silinecek",
      message: "Bu sulama kaydını silmek istediğinizden emin misiniz? Bağlı borç kaydı da silinecektir.",
      type: 'warning'
    });
    if (confirm) {
      const now = new Date().toISOString();
      const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
        `UPDATE DATA_Dagitim_Kayitlar SET deleted_at = ? WHERE id = ?`, 
        [now, id]
      );
      if (res.success) {
        // 🛡️ Sarsılmaz Tahakkuk İmhası: Bağlı borç kaydını da sarsılmaz bir hızla temizle
        await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', 
          `UPDATE MUHASEBE_Tahakkuk SET deleted_at = ? WHERE Fis_id = ?`, 
          [now, id]
        );
        ElectronService.showAlert({ message: "Kayıt 'İPTAL' edildi. Muhasebe kayıtlarında 'SİLİNDİ' olarak korunacaktır.", type: 'success' });
        loadData();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLocaleUpperCase('tr-TR');
    return data.filter(item =>
      (item.Ad_Soyad || "").toLocaleUpperCase('tr-TR').includes(term) ||
      (item.TCKN || "").includes(term) ||
      (item.Ada_Parsel || "").includes(term)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const isOverLimit = useMemo(() => {
    if (!selectedPropertySuHakki) return false;
    return (usedMinutesForSelected + ((newEntry.Sure_Saat || 0) * 60)) > (selectedPropertySuHakki * 60);
  }, [newEntry.Sure_Saat, usedMinutesForSelected, selectedPropertySuHakki]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <DistributionHeader 
        mahalleName={mahalleName}
        yil={yil}
        isArchived={isArchived}
        searchTerm={searchTerm}
        setSearchTerm={(term) => { setSearchTerm(term); setCurrentPage(1); }}
        pricing={pricing}
        onRefresh={loadData}
        onAddNew={async () => {
          if (isArchived) return;
          if (!pricing || receiptBooks.length === 0) {
            setAlertConfig({
              isOpen: true,
              type: 'error',
              title: 'KONFİGÜRASYON EKSİK',
              message: !pricing 
                ? 'Sistemde aktif birim fiyat bulunamadı! Lütfen "Ücret Tarifeleri" menüsünden aktif bir tarife tanımlayın.' 
                : 'Bu mahalle/dönem için koçan tescil edilmemiş! Lütfen "Fiş Koçanları" sekmesinden yeni koçan tescil edin.'
            });
            return;
          }
          await loadData();
          setIsAddModalOpen(true);
        }}
      />

      <div className="flex-1 overflow-auto p-6 flex flex-col">
        <DistributionTable 
          data={paginatedData}
          isArchived={isArchived}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onEdit={(row) => { setNewEntry({ ...row }); setIsAddModalOpen(true); }}
          onDelete={handleDeleteEntry}
          onDetail={setSelectedDetailRecord}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          meravCount={personel.length}
          receiptBookCount={receiptBooks.length}
        />
      </div>

      <DistributionFormModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewEntry({ id: '', TCKN: '', Ad_Soyad: '', Tasinmaz_id: '', Ada_Parsel: '', Sure_Saat: 0, Tutar: 0, Tarife_Modu: 'SUN', Makbuz_Defter_Adi: '', Makbuz_No: '', Odeme_Durumu: 'Beklemede', Tahsildar_id: '', Aciklama: '', Tarih: '' });
          setSelectedPropertySuHakki(null);
          setUsedMinutesForSelected(0);
        }}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        citizens={citizens}
        searchCitizens={searchCitizens}
        setCitizens={setCitizens}
        selectedCitizenProperties={selectedCitizenProperties}
        loadProperties={loadProperties}
        receiptBooks={receiptBooks}
        selectedPropertySuHakki={selectedPropertySuHakki}
        setSelectedPropertySuHakki={setSelectedPropertySuHakki}
        usedMinutesForSelected={usedMinutesForSelected}
        isOverLimit={isOverLimit}
        handleCalculateTutar={handleCalculateTutar}
        fetchUsedMinutes={fetchUsedMinutes}
        handleSaveEntry={handleSaveEntry}
        formatCurrency={formatCurrency}
      />

      <DistributionDetailModal 
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
        onEdit={async (record) => {
          setSelectedDetailRecord(null);
          setNewEntry({ ...record });
          const propRes = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'DATA_Tapu_Verisi', { id: record.Tasinmaz_id });
          if (propRes.success && propRes.data.length > 0) setSelectedPropertySuHakki(propRes.data[0].Aylik_Su_Hakki || 0);
          fetchUsedMinutes(record.Tasinmaz_id, record.id);
          setIsAddModalOpen(true);
        }}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
      />
      {alertConfig.isOpen && (
        <ModernAlert 
          config={alertConfig} 
          onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
        />
      )}
    </div>
  );
};
