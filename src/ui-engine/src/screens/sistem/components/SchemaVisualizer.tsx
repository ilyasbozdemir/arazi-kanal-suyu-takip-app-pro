import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Table, Link2, Hash, Type, 
  ShieldCheck, Layers, Settings, Map, 
  DollarSign, Users, ChevronRight, Info,
  Download, Smartphone, Share2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

// UI İçin Kısa Etiketler
const UI_LABELS: any = {
  DATA: 'OPERASYONEL',
  MAP: 'CBS / HARİTA',
  TANIM: 'SİSTEM',
  TASINMAZ: 'MÜLKİYET',
  MUHASEBE: 'FİNANSAL',
  OTHER: 'DİĞER'
};

export const SchemaVisualizer: React.FC = () => {
  const [schema, setSchema] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSchema = async () => {
      const res = await (window as any).electron.ipcRenderer.invoke('get-db-schema');
      if (res.success) setSchema(res.data);
    };
    loadSchema();
  }, []);

  const handleExportZip = async () => {
    if (!captureRef.current || !schema) return;
    setIsExporting(true);
    setExportProgress(0);
    
    const zip = new JSZip();
    const groups = Object.keys(schema.prefixLogic || {});
    const originalGroup = activeGroup;

    try {
      // 🛡️ BATCH ZIP EXPORT PROTOCOL
      const originalStyle = captureRef.current.style.cssText;
      const originalOverflow = captureRef.current.style.overflow;
      
      // Temporary style for high-quality capture
      captureRef.current.style.width = '1000px'; 
      captureRef.current.style.height = 'auto';
      captureRef.current.style.overflow = 'visible';
      captureRef.current.style.backgroundColor = '#f8fafc';
      captureRef.current.style.padding = '80px';
      captureRef.current.style.display = 'block';

      for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        setExportProgress(Math.round(((i + 1) / groups.length) * 100));
        
        // 🔄 Switch Group and Wait for Render
        setActiveGroup(g);
        await new Promise(resolve => setTimeout(resolve, 500));

        const dataUrl = await toPng(captureRef.current, {
          quality: 1.0,
          pixelRatio: 2.5, // Even higher for "Super Readable" mode
          skipFonts: true,
          cacheBust: true,
          style: { borderRadius: '0', overflow: 'visible' }
        });

        const base64Data = dataUrl.split(',')[1];
        const groupLabel = UI_LABELS[g] || g;
        zip.file(`${i+1}-${groupLabel}-MIMARI.png`, base64Data, { base64: true });
      }

      // Restore original state
      setActiveGroup(originalGroup);
      captureRef.current.style.cssText = originalStyle;
      captureRef.current.style.overflow = originalOverflow;

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.download = `G-KURUMU-MIMARI-PAKETI.zip`;
      link.href = URL.createObjectURL(blob);
      link.click();
      
      (window as any).api.showAlert({
        title: 'BATCH EXPORT TAMAMLANDI',
        message: 'Tüm modüller ayrı ayrı yüksek çözünürlüklü görseller olarak ZIP paketinde indirildi. Tam okunabilirlik sağlandı.',
        type: 'success'
      });
    } catch (err) {
      console.error('Export failed:', err);
      (window as any).api.showAlert({ title: 'HATA', message: 'Paket oluşturulurken hata oluştu.', type: 'error' });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getGroup = (tableName: string) => {
    const prefix = tableName.split('_')[0];
    const logic = schema?.prefixLogic?.[prefix];
    
    const config: any = {
      DATA: { color: 'blue', icon: Database },
      MAP: { color: 'emerald', icon: Map },
      TANIM: { color: 'amber', icon: Settings },
      MUHASEBE: { color: 'rose', icon: DollarSign },
      TASINMAZ: { color: 'purple', icon: Layers },
      OTHER: { color: 'slate', icon: Table }
    };

    const item = config[prefix] || config.OTHER;
    return { 
      id: prefix, 
      label: UI_LABELS[prefix] || UI_LABELS.OTHER, 
      fullLabel: logic || 'DİĞER BİLGİLER',
      color: item.color, 
      icon: item.icon 
    };
  };

  const getRelations = (tableName: string) => {
    const relations: any[] = [];
    const table = schema.tables.find((t: any) => t.name === tableName);
    if (!table) return relations;

    table.columns.forEach((col: any) => {
      if (col.constraints) {
        col.constraints.forEach((c: string) => {
          if (c.includes('REFERENCES')) {
            const targetTable = c.match(/REFERENCES\s+(\w+)/)?.[1];
            if (targetTable) relations.push({ column: col.name, targetTable });
          }
        });
      }
    });
    return relations;
  };

  if (!schema) return (
    <div className="flex items-center justify-center h-full">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-primary-500">
        <Database size={48} />
      </motion.div>
    </div>
  );

  const groups = schema ? Object.keys(schema.prefixLogic || {}) : [];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden font-sans">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shadow-inner">
            <Database size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic leading-none">MİMARİ HARİTA</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">v{schema.version} • {schema.database}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-white/10 pr-4 mr-2">
            {groups.map(g => {
              const groupInfo = getGroup(`${g}_`);
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  title={groupInfo.fullLabel}
                  onClick={() => setActiveGroup(isActive ? null : g)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                    isActive ? `bg-${groupInfo.color}-500 border-${groupInfo.color}-500 text-white shadow-md` : `border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10`
                  }`}
                >
                  {groupInfo.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 min-w-[180px] justify-center"
          >
            {isExporting ? (
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Share2 size={16} />
               </motion.div>
            ) : (
               <Smartphone size={16} />
            )}
            {isExporting ? `HAZIRLANIYOR %${exportProgress}` : 'MOBİL PAKET (ZIP)'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={captureRef} className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#f8fafc] dark:bg-[#020617]">
        <div className="flex flex-wrap gap-6 items-start pb-20">
          {schema.tables
            .filter((t: any) => !activeGroup || t.name.startsWith(activeGroup))
            .map((table: any) => {
            const group = getGroup(table.name);
            const isSelected = selectedTable === table.name;
            const relations = getRelations(table.name);

            return (
              <motion.div
                key={table.name}
                layout
                onClick={() => setSelectedTable(isSelected ? null : table.name)}
                className={`group relative bg-white dark:bg-slate-900/40 border rounded-2xl transition-all cursor-pointer w-fit min-w-[200px] max-w-[350px] shadow-sm ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/10 z-10 shadow-lg' : 'border-slate-200 dark:border-white/5 hover:border-indigo-400'
                }`}
              >
                <div className={`px-4 py-3 border-b whitespace-nowrap ${isSelected ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-slate-50/30 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg bg-${group.color}-500/10 text-${group.color}-500`}>
                      <group.icon size={16} />
                    </div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                        {table.name.replace(/DATA_|MAP_|TANIM_|MUHASEBE_|TASINMAZ_/g, '')}
                    </h3>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-50">{table.name}</p>
                </div>

                <div className="p-2 space-y-0.5">
                  {table.columns.map((col: any, idx: number) => {
                    const isPK = col.constraints?.includes('PRIMARY KEY');
                    const isFK = col.constraints?.some((c: string) => c.includes('REFERENCES'));
                    
                    return (
                      <div key={`${col.name}-${idx}`} className="flex items-center justify-between gap-4 px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isPK ? <Hash size={12} className="text-amber-500" /> : isFK ? <Link2 size={12} className="text-indigo-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />}
                          <span className={`text-[11px] font-bold ${isPK ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{col.type}</span>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {isSelected && relations.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20"
                    >
                      <div className="space-y-1.5">
                        {relations.map((rel: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                            <span className="text-indigo-500">{rel.column}</span>
                            <ChevronRight size={8} />
                            <span className="bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-100 dark:border-white/5">{rel.targetTable}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] z-20">
        <div className="flex items-center gap-2">
          <Database size={10} /> TOPLAM {schema.tables.length} TABLO MİMARİSİ
        </div>
        <div className="flex items-center gap-4">
          <span>KURUM BAŞKANLIĞI</span>
          <span className="opacity-40">MİMARİ V1.6</span>
        </div>
      </div>
    </div>
  );
};
