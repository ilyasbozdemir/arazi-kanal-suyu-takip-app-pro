import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Globe, School, Home, X, Check, Building2, Trees } from 'lucide-react';
import { ElectronService } from '@renderer/services/ElectronService';

export const LocationSettings: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState({ Ad: '', Kod: '', Tip: 'MAHALLE' });
  const [kurumMerkezi, setKurumMerkezi] = useState<string | null>(null);

  const loadKurumMerkezi = async () => {
    const res = await (window as any).api.getDbData('TANIM_Ayarlar', { anahtar: 'kurum_merkez_id' });
    if (res.success && res.data.length > 0) {
      setKurumMerkezi(res.data[0].deger);
    }
  };

  const loadLocations = async () => {
    setLoading(true);
    const res = await ElectronService.getRecords('TANIM_Konumlar');
    if (res.success) setLocations(res.data);
    setLoading(false);
  };

  useEffect(() => { loadLocations(); loadKurumMerkezi(); }, []);

  const handleSetKurumMerkezi = async (id: string) => {
    const res = await (window as any).electron.ipcRenderer.invoke('update-setting', 'kurum_merkez_id', id);
    if (res.success) {
      setKurumMerkezi(id);
      ElectronService.showAlert({ message: 'Kurum merkezi güncellendi.', type: 'success' });
    }
  };

  const handleExportJson = async () => {
    const res = await (window as any).electron.ipcRenderer.invoke('export-locations-json');
    if (res.success) ElectronService.showAlert({ message: 'Şablon başarıyla indirildi.', type: 'success' });
  };

  const handleImportJson = async () => {
    const res = await (window as any).electron.ipcRenderer.invoke('import-locations-json');
    if (res.success) {
      ElectronService.showAlert({ message: 'Konumlar başarıyla yüklendi.', type: 'success' });
      loadLocations();
    } else if (res.error) {
      ElectronService.showAlert({ message: res.error, type: 'error' });
    }
  };

  const handleInlineAdd = async (parentId: string | null, tip: string) => {
    if (!inlineForm.Ad) return;
    const res = await ElectronService.saveRecord('TANIM_Konumlar', {
      Parent_id: parentId,
      Tip: tip,
      Ad: inlineForm.Ad,
      Kod: inlineForm.Kod || null,
      id: window.crypto.randomUUID()
    });
    if (res.success) {
      loadLocations();
      setAddingUnder(null);
      setInlineForm({ Ad: '', Kod: '', Tip: 'MAHALLE' });
      ElectronService.showAlert({ message: `${tip} başarıyla eklendi.`, type: 'success' });
    }
  };

  const handleInlineEdit = async (id: string, parentId: string | null, tip: string) => {
    if (!inlineForm.Ad) return;
    const res = await ElectronService.saveRecord('TANIM_Konumlar', {
      Parent_id: parentId,
      Tip: tip,
      Ad: inlineForm.Ad,
      Kod: inlineForm.Kod || null,
      id: id
    });
    if (res.success) {
      loadLocations();
      setEditingId(null);
      setInlineForm({ Ad: '', Kod: '', Tip: 'MAHALLE' });
      ElectronService.showAlert({ message: `${tip} güncellendi.`, type: 'success' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await (window as any).api.showConfirm({ message: 'Bu konumu silmek istediğinize emin misiniz? Altındaki birimler de yetim kalabilir veya silinebilir.' });
    if (!confirm) return;
    const res = await (window as any).api.hardDeleteRecord('TANIM_Konumlar', id);
    if (res.success) {
      loadLocations();
    } else {
      ElectronService.showAlert({ message: res.error, type: 'error' });
    }
  };

  const getIcon = (tip: string) => {
    switch (tip) {
      case 'İL': return <Globe size={16} className="text-blue-500" />;
      case 'İLÇE': return <School size={16} className="text-emerald-500" />;
      case 'BELDE': return <Building2 size={16} className="text-teal-500" />;
      case 'MAHALLE': return <Home size={16} className="text-orange-500" />;
      case 'KÖY': return <Trees size={16} className="text-amber-600" />;
      default: return <MapPin size={16} className="text-slate-400" />;
    }
  };

  // Build recursive tree
  const buildTree = (data: any[], parentId: string | null = null): any[] => {
    return data
      .filter(item => item.Parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(data, item.id)
      }));
  };

  const tree = buildTree(locations, null);

  const InlineAddForm = ({ parentId, defaultTip, onCancel, isEdit, editId }: { parentId: string|null, defaultTip: string, onCancel: () => void, isEdit?: boolean, editId?: string }) => {
    // 🛡️ Hiyerarşiye göre mantıklı tipleri filtrele
    const getAvailableTips = () => {
      if (!parentId || parentId === 'ROOT') return ['İL'];
      const parentNode = locations.find(l => l.id === parentId);
      if (!parentNode) return ['İL', 'İLÇE', 'BELDE', 'MAHALLE', 'KÖY'];
      
      switch (parentNode.Tip) {
        case 'İL': return ['İLÇE', 'BELDE'];
        case 'İLÇE': return ['BELDE', 'MAHALLE', 'KÖY'];
        case 'BELDE': return ['MAHALLE', 'KÖY'];
        default: return ['MAHALLE'];
      }
    };

    const availableTips = getAvailableTips();

    return (
      <div className="flex flex-col md:flex-row items-center gap-2 mt-2 mb-2 p-3 bg-primary-50/50 dark:bg-primary-500/10 rounded-xl border border-primary-100 dark:border-primary-500/20 animate-in fade-in slide-in-from-top-2">
        <select 
          title="Birim Tipi"
          value={inlineForm.Tip} 
          onChange={e => setInlineForm({...inlineForm, Tip: e.target.value})}
          className="w-full md:w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:border-primary-500 rounded-lg px-3 py-2 text-xs font-bold outline-none"
        >
          {availableTips.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input 
          autoFocus 
          placeholder={isEdit ? `ADINI GÜNCELLE` : `BİRİM ADI`} 
          value={inlineForm.Ad} 
          onChange={e => setInlineForm({...inlineForm, Ad: e.target.value.toUpperCase()})} 
          className="w-full md:w-auto flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:border-primary-500 rounded-lg px-3 py-2 text-xs font-bold outline-none"
        />
        <input 
          placeholder="KOD (OPSİYONEL)" 
          value={inlineForm.Kod} 
          onChange={e => setInlineForm({...inlineForm, Kod: e.target.value})} 
          className="w-full md:w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:border-primary-500 rounded-lg px-3 py-2 text-xs font-bold outline-none"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <button title="Kaydet" onClick={() => isEdit && editId ? handleInlineEdit(editId, parentId, inlineForm.Tip) : handleInlineAdd(parentId, inlineForm.Tip)} className="flex-1 md:flex-none bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-lg transition-all flex justify-center"><Check size={16} /></button>
          <button title="İptal" onClick={onCancel} className="flex-1 md:flex-none bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 p-2 rounded-lg transition-all flex justify-center"><X size={16} /></button>
        </div>
      </div>
    );
  };

  const LocationNode = ({ node, level }: { node: any, level: number }) => {
    const isEditing = editingId === node.id;
    const isAdding = addingUnder === node.id;

    const isMerkez = kurumMerkezi === node.id;

    const defaultChildTip = 
      node.Tip === 'İL' ? 'İLÇE' : 
      node.Tip === 'İLÇE' ? 'MAHALLE' : 
      node.Tip === 'BELDE' ? 'MAHALLE' : 'MAHALLE';

    return (
      <div className={`mt-2 ${level > 0 ? 'pl-6 border-l-2 border-slate-100 dark:border-white/10' : 'border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-transparent'}`}>
        {isEditing ? (
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
            <InlineAddForm parentId={node.Parent_id} defaultTip={node.Tip} isEdit editId={node.id} onCancel={() => setEditingId(null)} />
          </div>
        ) : (
          <div className={`group flex items-center justify-between p-3 rounded-xl transition-all ${level === 0 ? 'bg-slate-50 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
            <div className="flex items-center gap-3 cursor-pointer" onDoubleClick={() => { setEditingId(node.id); setInlineForm({Ad: node.Ad, Kod: node.Kod || '', Tip: node.Tip}); }}>
              {getIcon(node.Tip)}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`${level === 0 ? 'text-sm' : 'text-xs'} font-black ${isMerkez ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-white'} uppercase`}>{node.Ad}</span>
                  {isMerkez && <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-[8px] font-black rounded-md uppercase">KURUM MERKEZİ</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400">{node.Tip}</span>
                  {node.Kod && <span className="text-[9px] font-black text-slate-500">{node.Kod}</span>}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${level > 0 ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
              {!isMerkez && (
                <button 
                  title="Kurum Merkezi Yap"
                  onClick={() => handleSetKurumMerkezi(node.id)}
                  className="text-slate-400 hover:text-amber-500 text-[10px] font-bold uppercase transition-all hidden group-hover:block"
                >
                  MERKEZ YAP
                </button>
              )}
              <button 
                title="Düzenle"
                onClick={() => { setEditingId(node.id); setInlineForm({Ad: node.Ad, Kod: node.Kod || '', Tip: node.Tip}); }}
                className="text-slate-400 hover:text-primary-500 text-[10px] font-bold uppercase transition-all hidden group-hover:block"
              >
                DÜZENLE
              </button>
              <button 
                title="Alt Birim Ekle"
                onClick={() => { setAddingUnder(node.id); setInlineForm({Ad: '', Kod: '', Tip: defaultChildTip}); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-primary-500 hover:text-primary-500 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                <Plus size={12} /> {level === 0 ? 'ALT BİRİM' : 'EKLE'}
              </button>
              <button title="Sil" onClick={() => handleDelete(node.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        )}

        {isAdding && (
          <div className="pl-6">
            <InlineAddForm parentId={node.id} defaultTip={defaultChildTip} onCancel={() => setAddingUnder(null)} />
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div className={`${level === 0 ? 'p-4 bg-white dark:bg-transparent' : ''}`}>
            {node.children.map((child: any) => (
              <LocationNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasRoot = locations.some(l => !l.Parent_id);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/5 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <MapPin className="text-primary-500" /> BÖLGE VE KONUM TANIMLARI
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">İl, İlçe, Belde, Köy ve Mahalle hiyerarşisini sınır tanımadan yönetin.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportJson}
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-[10px] md:text-xs uppercase transition-all flex items-center gap-2"
            >
              ŞABLON İNDİR
            </button>
            <button 
              onClick={handleImportJson}
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-[10px] md:text-xs uppercase transition-all flex items-center gap-2"
            >
              İÇE AKTAR
            </button>
            {!hasRoot && (
              <button 
                onClick={() => { setAddingUnder('ROOT'); setInlineForm({Ad: '', Kod: '', Tip: 'İL'}) }}
                className="bg-primary-500 hover:bg-primary-600 text-white font-black py-2.5 px-5 rounded-xl text-xs uppercase shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 ml-2"
              >
                <Plus size={16} /> YENİ İL EKLE
              </button>
            )}
          </div>
        </div>

        {addingUnder === 'ROOT' && !hasRoot && (
          <div className="mb-6">
            <InlineAddForm parentId={null} defaultTip="İL" onCancel={() => setAddingUnder(null)} />
          </div>
        )}

        <div className="space-y-4">
          {tree.map(rootNode => (
            <LocationNode key={rootNode.id} node={rootNode} level={0} />
          ))}
          
          {locations.length === 0 && !loading && addingUnder !== 'ROOT' && (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-slate-300 dark:text-slate-600" size={24} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Henüz konum tanımı yapılmamış.</p>
              <button 
                onClick={() => { setAddingUnder('ROOT'); setInlineForm({Ad: '', Kod: '', Tip: 'İL'}) }}
                className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-bold py-2 px-6 rounded-lg text-xs uppercase transition-all"
              >
                İlk Birimi Ekleyerek Başlayın
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

