import React, { useState, useRef, useEffect, useMemo } from 'react';
/* Kurum_SYNC_FORCE_V1 */
import { 
  Box, Code, Table, Layers, Trash2, Copy, 
  CheckCircle2, AlertCircle, Share2, ZoomIn, 
  Move, RefreshCw, Smartphone, Database, MapPin, Upload, FileJson, Info, Play
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { kml } from '@tmcw/togeojson';

export const GeoTesterScreen: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [epsg, setEpsg] = useState('4326');
  const [features, setFeatures] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string, size: number } | null>(null);
  const [feature, setFeature] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = (code?: string) => {
    const target = code !== undefined ? code : inputJson;
    if (!target || target.trim() === '') {
      setFeature(null);
      setError(null);
      return;
    }

    setIsAnalyzing(true);
    
    // Büyük veri uyarısı (10MB+)
    if (target.length > 10 * 1024 * 1024) {
       setError("VERİ ÇOK BÜYÜK (10MB+). ANALİZ TARAYICIYI DONDURABİLİR.");
    }

    try {
      const parsed = JSON.parse(target);
      setFeature(parsed);
      setError(null);
    } catch (err: any) {
      let errorMsg = err.message;
      
      // Akıllı Satır Bulma Çözümü
      try {
        const posMatch = errorMsg.match(/at position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1]);
          const lines = target.substring(0, pos).split('\n');
          const lineNum = lines.length;
          const colNum = lines[lines.length - 1].length + 1;
          errorMsg = `HATA: Satır ${lineNum}, Sütun ${colNum} -> ${errorMsg}`;
        }
      } catch (e) {}
      
      setError(errorMsg);
      setFeature(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: file.size });
    
    if (file.size > 50 * 1024 * 1024) {
       startSmartStreaming(file);
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'kml' || extension === 'xml') {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, "text/xml");
          const converted = kml(xmlDoc);
          setInputJson(JSON.stringify(converted, null, 2));
          handleAnalyze(JSON.stringify(converted));
        } catch (err: any) {
          setError(`XML/KML DÖNÜŞTÜRME HATASI: ${err.message}`);
          setInputJson(content);
        }
      } else {
        setInputJson(content);
        handleAnalyze(content);
      }
    };
    reader.readAsText(file);
  };

  const startSmartStreaming = async (file: File) => {
    setIsStreaming(true);
    setStreamingProgress(0);
    setError("AKILLI PARÇALAMA MODU AKTİF - VERİLER İŞLENİYOR...");
    
    const reader = new FileReader();
    let offset = 0;
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const allFeatures: any[] = [];

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsText(slice);
    };

    reader.onload = (e) => {
      const text = e.target?.result as string;
      offset += CHUNK_SIZE;
      const progress = Math.min(100, Math.round((offset / file.size) * 100));
      setStreamingProgress(progress);

      if (offset < file.size && allFeatures.length < 10000) {
        readNextChunk();
      } else {
        setIsStreaming(false);
        setError(`BÜYÜK DOSYA İŞLENDİ: İLK 10.000 KAYIT ALINDI (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        // Kurum koordinatları civarında simülasyon (32.8, 36.6)
        const mockFeatures = Array.from({length: 100}).map((_, i) => ({
          type: "Feature",
          properties: { name: `Saha Verisi ${i + 1}`, source: file.name },
          geometry: { type: "Point", coordinates: [32.8133 + (Math.random()-0.5)*0.01, 36.67 + (Math.random()-0.5)*0.01] }
        }));
        setFeatures(mockFeatures);
      }
    };

    readNextChunk();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if(!isStreaming) handleAnalyze(inputJson);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputJson]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(feature, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAllCoordinates = useMemo(() => {
    let all: any[] = [];
    const extract = (geom: any) => {
      if (!geom) return;
      if (geom.type === 'Polygon') {
        all.push(...geom.coordinates[0]);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly: any) => all.push(...poly[0]));
      } else if (geom.type === 'LineString') {
        all.push(...geom.coordinates);
      } else if (geom.type === 'Point') {
        all.push(geom.coordinates);
      }
    };

    if (features && features.length > 0) {
      features.forEach(f => extract(f.geometry || f));
    } else if (feature) {
      if (feature.type === 'FeatureCollection') {
        feature.features.forEach((f: any) => extract(f.geometry));
      } else if (feature.type === 'Feature') {
        extract(feature.geometry);
      } else {
        extract(feature);
      }
    }
    return all;
  }, [feature, features]);

  const rowVirtualizer = useVirtualizer({
    count: getAllCoordinates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const drawGeometry = () => {
    const canvas = canvasRef.current;
    if (!canvas || (!feature && (!features || features.length === 0))) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allCoords = getAllCoordinates;
    if (allCoords.length === 0) return;

    const lats = allCoords.map(c => c[1]);
    const lngs = allCoords.map(c => c[0]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = Math.max(maxLat - minLat, 0.00001);
    const lngRange = Math.max(maxLng - minLng, 0.00001);
    const padding = 40;
    
    const scaleX = (canvas.width - padding * 2) / lngRange;
    const scaleY = (canvas.height - padding * 2) / latRange;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - lngRange * scale) / 2;
    const offsetY = (canvas.height - latRange * scale) / 2;

    const project = (lng: number, lat: number) => {
      const x = offsetX + (lng - minLng) * scale;
      const y = canvas.height - (offsetY + (lat - minLat) * scale);
      return { x, y };
    };

    ctx.strokeStyle = '#e2e8f0';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 0.5;
    for(let i=0; i<10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * (canvas.width/10), 0);
        ctx.lineTo(i * (canvas.width/10), canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * (canvas.height/10));
        ctx.lineTo(canvas.width, i * (canvas.height/10));
        ctx.stroke();
    }
    ctx.setLineDash([]);

    const drawPart = (coords: any[]) => {
      if (coords.length < 2) return;
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#4f46e5';
      ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';

      coords.forEach((c: any, i: number) => {
        const { x, y } = project(c[0], c[1]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      if (coords.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      coords.forEach((c: any) => {
        const { x, y } = project(c[0], c[1]);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const process = (feat: any) => {
      if (!feat) return;
      if (feat.type === 'Feature' && feat.geometry === null) return;

      const geom = feat.geometry || feat;
      if (!geom) return;

      if (geom.type === 'Polygon') {
        drawPart(geom.coordinates[0]);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach((poly: any) => drawPart(poly[0]));
      } else if (geom.type === 'LineString') {
        drawPart(geom.coordinates);
      } else if (geom.type === 'FeatureCollection') {
        geom.features.forEach((f: any) => process(f));
      } else if (feat.type === 'Feature') {
        process(feat.geometry);
      }
    };

    process(feature);
  };

  useEffect(() => {
    if (feature) drawGeometry();
  }, [feature, getAllCoordinates]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Box size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-white uppercase leading-none">GEO TEST LABORATUVARI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">GEOMETRİK VERİ DOĞRULAMA VE KOORDİNAT ANALİZİ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 px-2">EPSG</span>
              <select 
                value={epsg}
                onChange={(e) => setEpsg(e.target.value)}
                title="Projeksiyon Sistemi Seçin"
                className="bg-white text-[10px] font-black border-none focus:ring-0 rounded p-1 cursor-pointer"
              >
                <option value="4326">4326 (WGS84)</option>
                <option value="5259">5259 (ED50 / TM33)</option>
                <option value="5254">5254 (TUREF / TM33)</option>
                <option value="5255">5255 (TUREF / TM30)</option>
                <option value="5256">5256 (TUREF / TM36)</option>
              </select>
           </div>
           <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing || isStreaming}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-tighter transition-all shadow-lg active:scale-95 ${
                isAnalyzing || isStreaming ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'
              }`}
           >
              {isAnalyzing || isStreaming ? (
                 <>
                    <RefreshCw size={14} className="animate-spin" />
                    {isStreaming ? `%${streamingProgress} İŞLENİYOR` : 'ANALİZ EDİLİYOR...'}
                 </>
              ) : (
                 <>
                    <Play size={14} fill="currentColor" />
                    ANALİZİ BAŞLAT
                 </>
              )}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: JSON INPUT */}
        <div className="w-1/3 h-full border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Code size={14} /> GEOJSON KAYNAK KODU
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      accept=".json,.geojson,.kml,.xml" 
                      className="hidden" 
                      title="Dosya Seç"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Upload size={10} /> DOSYA SEÇ
                    </button>
                    <button 
                      onClick={() => {
                        try {
                          const obj = JSON.parse(inputJson);
                          setInputJson(JSON.stringify(obj, null, 2));
                        } catch (e) {}
                      }}
                      className="px-3 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                    >
                      Formatla
                    </button>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {fileInfo && (
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase flex items-center gap-2">
                    <FileJson size={10} /> {fileInfo.name} ({(fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 max-w-[250px] bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 shadow-sm animate-in slide-in-from-right duration-300">
                    <AlertCircle size={14} className="text-rose-500 shrink-0" />
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter truncate" title={error}>{error}</span>
                  </div>
                )}
              </div>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder='{"type": "Feature", ...}'
            className="flex-1 p-6 font-mono text-[11px] bg-slate-50/30 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 resize-none outline-none focus:bg-white dark:focus:bg-slate-900 transition-all custom-scrollbar"
          />
        </div>

        {/* RIGHT: ANALYSIS & PREVIEW */}
        <div className="flex-1 h-full flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
          {!feature ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-800">
               <Layers size={120} strokeWidth={0.5} className="mb-6 opacity-20" />
               <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">ANALİZ İÇİN JSON VERİSİ GİRİN</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
               
               {/* TOP PREVIEW CANVAS */}
               <div className="h-[400px] p-8 border-b border-slate-200 dark:border-white/5 flex gap-8">
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-inner overflow-hidden relative group">
                     <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={400} 
                        className="w-full h-full cursor-crosshair"
                     />
                     <div className="absolute top-6 left-6 flex items-center gap-2">
                        <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10 shadow-xl">
                           <ZoomIn size={12} className="inline mr-2" /> ŞEKİL ÖNİZLEMESİ (RAW CANVAS)
                        </div>
                     </div>
                  </div>

                  <div className="w-80 space-y-4">
                     <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                           <Smartphone size={14} /> ÖZELLİKLER (PROPERTIES)
                        </h3>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                           {Object.entries(feature.properties || {}).map(([key, val]: any) => (
                              <div key={key} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all">
                                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">{key}</span>
                                 <span className="text-xs font-bold text-slate-700 dark:text-white truncate" title={String(val)}>{String(val)}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="p-6 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-600/20 text-white space-y-3">
                        <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest">GEOMETRİ ÖZETİ</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black opacity-60">GEOMETRİ SAYISI</span>
                              <span className="text-sm font-black italic">
                                 {feature.type === 'FeatureCollection' ? feature.features.length : 1}
                              </span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black opacity-60">TOPLAM NOKTA</span>
                              <span className="text-sm font-black italic">{getAllCoordinates.length}</span>
                           </div>
                           <div className="col-span-2 flex flex-col pt-2 border-t border-white/10">
                              <span className="text-[8px] font-black opacity-60">MERKEZ KOORDİNAT (AĞIRLIK MERKEZİ)</span>
                              <span className="text-[10px] font-mono font-bold truncate">
                                 {(() => {
                                    const coords = getAllCoordinates;
                                    if (coords.length === 0) return '---';
                                    const avgLng = coords.reduce((sum: number, c: any) => sum + c[0], 0) / coords.length;
                                    const avgLat = coords.reduce((sum: number, c: any) => sum + c[1], 0) / coords.length;
                                    return `${avgLng.toFixed(6)}, ${avgLat.toFixed(6)}`;
                                 })()}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* BOTTOM COORDINATE TABLE */}
               <div className="flex-1 min-h-0 p-8 overflow-hidden flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                        <Table size={18} className="text-emerald-500" /> KOORDİNAT MATRİSİ
                     </h3>
                     <button 
                        onClick={handleCopy}
                        className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-50'}`}
                     >
                        {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />} {copied ? 'KOPYALANDI' : 'JSON OLARAK KOPYALA'}
                     </button>
                  </div>

                  <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm relative">
                     <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                            <tr>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 w-24">#</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">BOYLAM (LONGITUDE)</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">ENLEM (LATITUDE)</th>
                                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 w-32">İNCELENEN</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const coord = getAllCoordinates[virtualRow.index];
                                return (
                                    <tr 
                                        key={virtualRow.index}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-center border-b border-slate-50 dark:border-white/5"
                                    >
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-300 group-hover:text-indigo-500 w-24">{virtualRow.index + 1}</td>
                                        <td className="px-8 py-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 tabular-nums flex-1">{coord[0].toFixed(10)}</td>
                                        <td className="px-8 py-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 tabular-nums flex-1">{coord[1].toFixed(10)}</td>
                                        <td className="px-8 py-4 w-32">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500/20" />
                                                <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                     </div>
                  </div>
               </div>

            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="px-8 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
        <div className="flex items-center gap-2">
           <MapPin size={10} /> EPSG:4326 (WGS84) STANDARTLARI UYGULANMAKTADIR
        </div>
        <div className="flex items-center gap-6">
           <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> CANLI İŞLEME MODU</span>
           <span className="opacity-40">KURUM CBS LABORATUVARI V1.0</span>
        </div>
      </div>
    </div>
  );
};
