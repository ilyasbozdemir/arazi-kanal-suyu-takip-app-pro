import { FC, useCallback, useEffect, useMemo, useState } from "react";
/* Kurum_SYNC_FORCE_V3 */
import { 
  AnimatePresence, 
  motion 
} from "framer-motion";
import { 
  LucideIcon, RefreshCw, Activity, Trash2, Lock, 
  RotateCcw, Users, Phone, MapPin, Layers, TrendingUp, User 
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { TableHeader } from "./table/TableHeader";
import { TableContent } from "./table/TableContent";
import { TableFooter } from "./table/TableFooter";
import { TableSelectionBar } from "./table/TableSelectionBar";
import { ElectronService } from "@renderer/services/ElectronService";
import { MevkiService } from '@renderer/services/domain/MevkiService';
import { container } from '@renderer/core/di/container';
import { ColumnRenderer } from "./table/ColumnRenderer";
import { getTableConfig } from "@renderer/config/TableConfig";
import { DeleteConfirmModal } from "@renderer/components/modals/DeleteConfirmModal";
import { SorumluAtamaModal } from "@renderer/components/modals/SorumluAtamaModal";
import { ProcessingOverlay } from "@renderer/components/modals/ProcessingOverlay";
import { useAppStore } from "@renderer/store/useAppStore";
import { translateHeader as globalTranslate } from "@renderer/utils/translations";

import { RECORD_CONFIGS } from "@renderer/config/recordConfig";
import { BulkAddModal } from "./modals/BulkAddModal";

interface TableViewProps {
  title: string;
  description: string;
  tableName: string;
  icon: LucideIcon;
  onRowClick?: (table: string, id: any) => void;
  onCreateClick?: (table: string) => void;
  initialData?: any[];
  onCacheUpdate?: (table: string, data: any[]) => void;
  searchTerm?: string;
}

export const TableView: FC<TableViewProps> = ({
  title, description, tableName, icon: Icon, onRowClick, onCreateClick, initialData, onCacheUpdate, searchTerm = "",
}) => {
  const [data, setData] = useState<any[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData || initialData.length === 0);
  const [showDeleted, setShowDeleted] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [limit, setLimit] = useState(50); // 🛡️ Infinite Scroll Limit
  
  // 🛡️ Sarsılmaz Sorumlu Atama State'leri
  const [isSorumluDialogOpen, setIsSorumluDialogOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<any>(null);
  const [meravs, setMeravs] = useState<any[]>([]);

  // Bulk Entry Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // kurum Akıllı Yenileme Mekanizması
  const { dataVersions, cachedData } = useAppStore();
  const currentTableVersion = dataVersions[tableName] || 0;
  const [lastProcessedVersion, setLastProcessedVersion] = useState(currentTableVersion);

  useEffect(() => { 
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300); 
    return () => clearTimeout(timer); 
  }, [searchInput]);

  const combinedFilter = useMemo(() => {
    const s1 = searchTerm && typeof searchTerm === 'string' ? searchTerm.trim() : "";
    const s2 = debouncedSearch && typeof debouncedSearch === 'string' ? debouncedSearch.trim() : "";
    return (s1 + " " + s2).trim();
  }, [searchTerm, debouncedSearch]);

  const performLoad = useCallback(async (isForced: boolean = false) => {
    if (!tableName) return;
    if (!data.length || isForced) setIsLoading(true);
    try {
      const res = showDeleted 
        ? await ElectronService.getDeletedRecords(tableName)
        : await ElectronService.getRecords(tableName, combinedFilter);

      if (res.success) { 
        let result = res.data || []; 

        // 🛡️ KURUM DATA ENRICHMENT: Eğer tabloda özel zenginleştirme varsa çalıştır
        const config = RECORD_CONFIGS[tableName];
        if (config && config.enrichData) {
           try {
             result = await config.enrichData(result, ElectronService);
           } catch (enrichErr) {
             console.error(`[ENRICH_ERROR_${tableName}]`, enrichErr);
           }
        }

        setData(result); 
        if (onCacheUpdate) onCacheUpdate(tableName, result); 
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, [tableName, onCacheUpdate, combinedFilter, showDeleted]);

  useEffect(() => { performLoad(); }, [tableName, combinedFilter, showDeleted]);

  // 🛡️ Load More for Infinite Scroll
  const loadMore = useCallback(() => {
    if (limit < data.length) {
      setLimit(prev => prev + 50);
    }
  }, [limit, data.length]);

  const handleRestore = async (id: string) => {
    const confirm = await ElectronService.showConfirm({
      title: 'GERİ YÜKLEME ONAYI',
      message: 'Bu kaydı kesin ve kalıcı bir şekilde geri yüklemek istediğinize emin misiniz?',
      type: 'question'
    });
    if (!confirm) return;

    setIsProcessing(true);
    try {
      const res = await ElectronService.restoreRecord(tableName, id);
      if (res.success) {
        ElectronService.showAlert({ message: "Kayıt resmi mevzuat çerçevesinde geri yüklendi. ✓", type: 'success' });
        performLoad(true);
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      ElectronService.showAlert({ message: "GERİ YÜKLEME HATASI: " + e.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetSorumlu = async (meravId: string) => {
    if (!targetItem) return;
    setIsProcessing(true);
    try {
      const res = await (window as any).electron.ipcRenderer.invoke('save-record', tableName, {
        id: targetItem.id,
        Sorumlu_Merav_id: meravId
      });
      if (res.success) {
        ElectronService.showAlert({ message: "Mahalle sorumlusu sarsılmaz bir nizamla güncellendi. ✓", type: 'success' });
        setIsSorumluDialogOpen(false);
        performLoad(true);
      }
    } catch (e: any) {
      ElectronService.showAlert({ message: "GÜNCELLEME HATASI: " + e.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSpecialAction = async (action: string, item: any) => {
    if (action === 'SET_SORUMLU') {
      setTargetItem(item);
      setIsProcessing(true);
      try {
        const res = await (window as any).electron.ipcRenderer.invoke('execute-raw-sql', `
          SELECT m.id, (v.Ad || ' ' || v.Soyad) as Ad_Soyad 
          FROM TANIM_Meravlar m 
          JOIN DATA_Vatandas v ON m.Vatandas_Id = v.id 
          WHERE m.deleted_at IS NULL
        `);
        if (res.success) {
          setMeravs(res.data || []);
          setIsSorumluDialogOpen(true);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Sayfaya geri dönüldüğünde veya veri değiştiğinde otomatik yenile
  useEffect(() => {
    if (currentTableVersion > lastProcessedVersion) {
      setLastProcessedVersion(currentTableVersion);
      performLoad(true);
    }
  }, [currentTableVersion, performLoad, lastProcessedVersion]);

  useEffect(() => {
    const cleanup = ElectronService.onUpdate((payload: any) => { 
      if (payload.table === tableName && !isLoading) performLoad(true); 
    });
    return () => cleanup && cleanup();
  }, [tableName, performLoad, isLoading]);

  const translateHeader = (h: string) => {
    const config = getTableConfig(tableName);
    const overrides = config.labelOverrides || {};
    if (overrides[h]) return overrides[h];
    return globalTranslate(h);
  };

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const firstRow = data?.[0] || {};
    const dbColumns = Object.keys(firstRow);
    const config = getTableConfig(tableName);
    
    if (dbColumns.length === 0 && !isLoading) {
      // Veri yoksa en azından başlıkları veya boş durum kolonunu göster
      return [{
        id: "empty",
        header: "BİLGİ",
        cell: () => <span className="text-slate-400 italic">Bu kütükte henüz kayıtlı veri bulunmamaktadır.</span>
      }];
    }
    
    const baseCols: ColumnDef<any>[] = [{ 
      id: "select", 
      header: ({ table }) => <div className="flex justify-center p-3"><input type="checkbox" title="Tümünü Seç" aria-label="Tüm satırları seç" className="w-5 h-5 rounded-lg border-2 border-slate-200 accent-primary-500 cursor-pointer" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} /></div>, 
      cell: ({ row }) => <div className="flex justify-center p-3"><input type="checkbox" title="Seç" aria-label="Satırı seç" className="w-5 h-5 rounded-lg border-2 border-slate-200 accent-primary-500 cursor-pointer" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} onClick={e => e.stopPropagation()} /></div>, 
      enableSorting: false 
    }];

    const mappedCols: ColumnDef<any>[] = dbColumns
      .filter(h => !config.hiddenColumns.includes(h))
      .sort((a, b) => {
        const priority = config.priorityColumns || [];
        const idxA = priority.indexOf(a); const idxB = priority.indexOf(b);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      })
      .map(h => ({
        accessorKey: h, 
        header: translateHeader(h).toLocaleUpperCase("tr-TR"), 
        cell: (info: any) => {
          let val = info.getValue();
          const key = h.toLowerCase();
          if (val === null || val === undefined || val === "") return <span className="text-slate-300 italic opacity-40">---</span>;
          
          // 🛡️ KURUM ID RESOLVER (Bölge & Personel)
          if (key === 'mahalle_id') {
             const locName = (cachedData.TANIM_Konumlar || []).find(l => String(l.id) === String(val))?.Ad || val;
             return <span className="text-[12px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-tighter italic bg-primary-500/5 px-3 py-1 rounded-lg border border-primary-500/10 shadow-sm">{locName}</span>;
          }
          if (key === 'merav_id' || key === 'sorumlu_merav_id' || key === 'tahsildar_id') {
             const staff = (cachedData.TANIM_Personel || []).find(p => String(p.id) === String(val));
             if (staff) return <span className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10">{staff.Ad_Soyad}</span>;
          }

          if (key === 'aktif' && tableName === 'TANIM_Personel') {
             const isAktif = Number(val) === 1;
             return (
               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center w-fit mx-auto shadow-sm ${isAktif ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                 {isAktif ? 'AKTİF' : 'PASİF'}
               </div>
             );
          }

          if (tableName === 'DATA_Vatandas' && (key.includes('tc') || key.includes('kimlik'))) return ColumnRenderer.renderStatusBadge(val);
          if (key === 'sicil_no' || key === 'sira_no') return ColumnRenderer.renderNumberBadge(val);
          if (tableName === 'DATA_Tapu_Verisi' && (key === 'ada' || key === 'parsel')) return <span className="text-[14px] font-black text-slate-800 dark:text-white bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 italic">{val}</span>;
          const isHighlightable = key.includes('ad') || key.includes('soyad') || key.includes('sahip');
          return <span className={`text-[13px] ${isHighlightable ? 'font-black text-slate-800 dark:text-white uppercase tracking-tighter' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{ColumnRenderer.highlightText(String(val), searchInput)}</span>;
        }
      }));

    const actionCol: ColumnDef<any> = {
      id: "actions",
      header: "İŞLEMLER",
      cell: ({ row }) => {
        const item = row.original;
        const isDeleted = !!item.deleted_at;
        const isImmutable = ['MUHASEBE_Kasa_Hareketleri'].includes(tableName);

        if (isDeleted) {
          return (
            <div className="flex items-center gap-1 justify-end px-2" onClick={e => e.stopPropagation()}>
               <button 
                 onClick={() => handleRestore(item.id)} 
                 className="px-4 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                 title="Kaydı Geri Yükle"
               >
                 <RotateCcw size={14} /> GERİ AL
               </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1 justify-end px-2" onClick={e => e.stopPropagation()}>
             <button onClick={() => onRowClick?.(tableName, item.id)} className="p-2.5 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all" title="Detay"><Activity size={18} /></button>
             
             {!isImmutable && (
               <button onClick={() => { localStorage.setItem('CLONE_DATA', JSON.stringify(item)); onCreateClick?.(tableName); ElectronService.showAlert({ message: "Kayıt verileri referans alınarak yeni form hazırlanmaktadır...", type: 'info' }); }} className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all" title="Kopyala"><RefreshCw size={18} /></button>
             )}

             <button 
                onClick={() => { if (!isImmutable) { setItemToDelete(item); setIsDeleteModalOpen(true); } }} 
                disabled={item._isLocked || isImmutable}
                className={`p-2.5 rounded-xl transition-all ${ (item._isLocked || isImmutable) ? 'text-slate-200 cursor-not-allowed opacity-30 shadow-none' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'}`} 
                title={isImmutable ? "BU KAYIT RESMİ ARŞİV NİTELİĞİNDEDİR VE DEĞİŞTİRİLEMEZ" : (item._isLocked ? "SİLEMEZSİNİZ: BAĞLI VERİLER MEVCUT" : "Sil")}
             >
                {(item._isLocked || isImmutable) ? <Lock size={18} /> : <Trash2 size={18} />}
             </button>
          </div>
        );
      }
    };
    return [...baseCols, ...mappedCols, actionCol];
  }, [data, searchInput, tableName, isLoading]);

  const [dependencyWarning, setDependencyWarning] = useState<string | null>(null);

  useEffect(() => {
    const checkDependencies = async () => {
      if (!isDeleteModalOpen || tableName !== 'DATA_Tasinmaz_Mevkileri') {
        setDependencyWarning(null);
        return;
      }

      const rowsToCheck = itemToDelete 
        ? [itemToDelete] 
        : table.getSelectedRowModel().rows.map(r => r.original);

      if (rowsToCheck.length === 0) return;

      try {
        let totalTapu = 0;
        let totalUsage = 0;
        let blockedNames: string[] = [];

        for (const item of rowsToCheck) {
           try {
             // 🛡️ Resolve service from container (DI)
             const mevkiService = container.resolve(MevkiService);
             const res = await mevkiService.getDetails(item.id);
             
             const stats = res.usageStats || {};
             const tapuCount = res.tapular?.length || 0;
             const hasDep = tapuCount > 0 || (res.sulamaHatlari?.length || 0) > 0 || stats.islemCount > 0 || stats.defterCount > 0 || stats.vatandasCount > 0;
             
             if (hasDep) {
               blockedNames.push(item.Mevki_Adi || item.id);
               totalTapu += tapuCount;
               totalUsage += (stats.islemCount || 0) + (stats.vatandasCount || 0);
             }
           } catch (e) {
             console.error('Mevki check error:', e);
           }
        }

        if (blockedNames.length > 0) {
           setDependencyWarning(
             `KORUMA: Seçili ${rowsToCheck.length} kayıttan ${blockedNames.length} tanesinin (${blockedNames.slice(0, 2).join(", ")}${blockedNames.length > 2 ? '...' : ''}) bağlı verileri (Toplam ${totalTapu} Taşınmaz, ${totalUsage} İşlem vb.) bulunduğu için işlem ENGELLENDİ.`
           );
        } else {
           setDependencyWarning(null);
        }
      } catch (err) {
        console.error("Dependency check failed:", err);
      }
    };

    checkDependencies();
  }, [isDeleteModalOpen, tableName, itemToDelete, rowSelection]);

  const table = useReactTable({
    data, columns, state: { sorting, rowSelection, globalFilter: combinedFilter, columnFilters, pagination: { pageIndex: 0, pageSize: limit } },
    onSortingChange: setSorting, onRowSelectionChange: setRowSelection, onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const nextState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
      setLimit(nextState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), 
    getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), 
    manualPagination: false
  });

  const handleConfirmedDelete = async (note: string) => {
    setIsProcessing(true);
    try {
      if (itemToDelete) {
        // 🛡️ Individual delete (Hard if in trash, Soft if normal)
        const res = showDeleted 
          ? await ElectronService.hardDeleteRecord(tableName, itemToDelete.id)
          : await ElectronService.deleteRecord(tableName, itemToDelete.id, note);

        if (res.success) {
          ElectronService.showAlert({ 
            message: showDeleted ? "Kayıt resmi mevzuat gereği sistemden tamamen silindi. (Kalıcı Silme)" : "Kayıt başarıyla arşive sevk edildi.", 
            type: 'success' 
          });
        } else {
          throw new Error(res.error);
        }
      } else {
        // 🛡️ Bulk delete
        const selectedRows = table.getSelectedRowModel().rows;
        let successCount = 0;
        let errors: string[] = [];

        for (const row of selectedRows) {
          try {
            const res = showDeleted
              ? await ElectronService.hardDeleteRecord(tableName, row.original.id)
              : await ElectronService.deleteRecord(tableName, row.original.id, note);

            if (res.success) {
              successCount++;
            } else {
              const name = row.original.Ad ? `${row.original.Ad} ${row.original.Soyad || ""}` : (row.original.Mevki_Adi || row.original.id);
              errors.push(`${name}: ${res.error}`);
            }
          } catch (err: any) {
            errors.push(`${row.original.id}: ${err.message}`);
          }
        }

        if (errors.length > 0) {
          const detailMessage = errors.slice(0, 3).join("\n") + (errors.length > 3 ? `\n...ve ${errors.length - 3} hata daha.` : "");
          ElectronService.showAlert({ 
            message: `${successCount} adet kayıt ${showDeleted ? 'KALICI OLARAK İMHA EDİLDİ' : 'silindi'}. ${errors.length} KAYIT SİLENEMEDİ!\n\nHATALAR:\n${detailMessage}`, 
            type: successCount > 0 ? 'warning' : 'error' 
          });
        } else if (successCount > 0) {
          ElectronService.showAlert({ 
            message: `${successCount} adet kayıt ${showDeleted ? 'resmi mevzuat gereği sistemden tamamen silindi.' : 'başarıyla arşive sevk edildi.'}`, 
            type: 'success' 
          });
        }
      }
      setRowSelection({});
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
      performLoad(true);
    } catch (e: any) {
      ElectronService.showAlert({ message: "İMHA HATASI: " + e.message, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const config = getTableConfig(tableName);
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'grid'>('grid'); // Varsayılan: KART GÖRÜNÜM (kurum Standard)
  const displayTitle = config.tableName || globalTranslate(tableName) || title;

  // 🛡️ Ayarlardan Görünüm Tercihini Yükle
  useEffect(() => {
    const loadPref = async () => {
      try {
        const res = await (window as any).electron.ipcRenderer.invoke('get-settings');
        if (res.success && res.settings && res.settings.LIST_VIEW_MODE) {
           const savedMode = res.settings.LIST_VIEW_MODE as any;
           if (['table', 'list', 'grid'].includes(savedMode)) {
              setViewMode(savedMode);
           }
        } else if (config.defaultView) {
           setViewMode(config.defaultView);
        }
      } catch (e) { console.error("PREF_LOAD_ERROR", e); }
    };
    loadPref();
  }, [tableName, config.defaultView]);

  // 🛡️ Görünüm Tercihini Kaydet
  const handleViewModeChange = async (newMode: 'table' | 'list' | 'grid') => {
    setViewMode(newMode);
    try {
      await (window as any).electron.ipcRenderer.invoke('update-setting', 'LIST_VIEW_MODE', newMode);
    } catch (e) { console.error("PREF_SAVE_ERROR", e); }
  };

  const stats = useMemo(() => {
    if (tableName === 'DATA_Vatandas') {
      return [
        { label: 'TOPLAM VATANDAŞ', value: `${data.length} Kişi`, icon: Users, color: 'primary' },
        { label: 'AKTİF KAYITLAR', value: `${data.filter(v => v.Durum === 'Aktif' || !v.deleted_at).length} Kişi`, icon: Activity, color: 'emerald' },
        { label: 'TELEFON KAYITLI', value: `${data.filter(v => v.Telefon || v.Cep_Telefonu).length} Adet`, icon: Phone, color: 'violet' }
      ];
    }
    if (tableName === 'DATA_Dagitim_Bolgeleri') {
      return [
        { label: 'TOPLAM BÖLGE', value: `${data.length} Bölge`, icon: MapPin, color: 'primary' },
        { label: 'AKTİF SEZONLAR', value: `${new Set(data.map(v => v.Durum)).size} Durum`, icon: Layers, color: 'emerald' }
      ];
    }
    if (tableName === 'DATA_Tapu_Verisi') {
       return [
        { label: 'TOPLAM PARSEL', value: `${data.length} Adet`, icon: Layers, color: 'primary' },
        { label: 'TOPLAM ALAN', value: `${data.reduce((sum, t) => sum + (Number(t.Alan_m2) || 0), 0).toLocaleString('tr-TR')} m²`, icon: TrendingUp, color: 'emerald' },
        { label: 'AKTİF MEVKİ', value: `${new Set(data.map(t => t.Mevki)).size} Bölge`, icon: MapPin, color: 'violet' }
      ];
    }
    return null;
  }, [data, tableName]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-6 h-full flex flex-col">
      {/* 🛡️ Premium Stats Dashboard Header */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-8 group">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 ${
                stat.color === 'primary' ? 'bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white' :
                stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' :
                'bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white'
              }`}>
                <stat.icon size={32} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>
      )}

      <TableHeader 
        title={displayTitle} 
        description={showDeleted ? `Silinen ${displayTitle} kayıtları.` : `${displayTitle} resmi veri kütüğü ve arşiv kayıtları.`} 
        icon={Icon} 
        searchInput={searchInput} setSearchInput={setSearchInput} 
        tableName={tableName} onCreateClick={onCreateClick}
        onBulkAddClick={() => setIsBulkModalOpen(true)}
        onRefresh={() => performLoad(true)} 
        showDeleted={showDeleted}
        onToggleDeleted={() => setShowDeleted(!showDeleted)}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        onExport={async () => { 
          setIsProcessing(true); 
          const exportData = JSON.parse(JSON.stringify(table.getFilteredRowModel().rows.map(r => r.original)));
          const res = await (window as any).api.exportExcel({ 
            table: tableName, 
            data: exportData, 
            fileName: `${displayTitle}_Listesi.xlsx` 
          }); 
          if (res.success) ElectronService.showAlert({ message: "Excel başarıyla kaydedildi.", type: "success" });
          setIsProcessing(false); 
        }} 
      />
      
      <TableContent table={table} loading={isLoading} columns={columns} combinedFilter={combinedFilter} onRowClick={onRowClick} onSpecialAction={onSpecialAction} tableName={tableName} viewMode={viewMode} loadMore={loadMore} hasMore={limit < data.length} />
      <TableFooter table={table} dataCount={data.length} />
      <TableSelectionBar rowSelection={rowSelection} handleBulkDelete={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }} setRowSelection={setRowSelection} />
      
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} 
        onConfirm={handleConfirmedDelete}
        isProcessing={isProcessing}
        alertMode={!!dependencyWarning || showDeleted}
        title={dependencyWarning ? "SİLME ENGELLENDİ" : (itemToDelete ? (showDeleted ? "KALICI İMHA (GERİ DÖNÜŞSÜZ)" : "KAYDI SİL") : (showDeleted ? "TOPLU KALICI İMHA" : "TOPLU KAYIT SİLME"))}
        message={dependencyWarning || (itemToDelete 
          ? (showDeleted ? "BU KAYIT SİSTEMDEN TAMAMEN VE KALICI OLARAK SİLİNECEK! ONAYLIYOR MUSUNUZ?" : "Seçili kaydı ve bağlı tüm veriler sistemden çöp kutusuna taşımayı onaylıyor musunuz?") 
          : (showDeleted ? `${Object.keys(rowSelection).length} ADET KAYIT SİSTEMDEN TAMAMEN VE KALICI OLARAK SİLİNECEK! GERİ DÖNÜŞÜ YOKTUR.` : `${Object.keys(rowSelection).length} adet kaydı sistemden çöp kutusuna taşımayı onaylıyor musunuz?`))}
      />

      <SorumluAtamaModal 
        isOpen={isSorumluDialogOpen}
        onClose={() => setIsSorumluDialogOpen(false)}
        targetItem={targetItem}
        meravs={meravs}
        onSelect={handleSetSorumlu}
        isProcessing={isProcessing}
      />

      <BulkAddModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        tableName={tableName} 
        onSuccess={() => performLoad(true)} 
      />

      <ProcessingOverlay isProcessing={isProcessing} />
    </motion.div>
  );
};

