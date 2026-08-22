import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ElectronService } from '../../services/ElectronService';

// Refactored Components
import { MapSidebar } from './map/components/MapSidebar';
import { MapCore } from './map/components/MapCore';
import { MapOverlays } from './map/components/MapOverlays';
import { MapViewProps, ImportedLayer, MapSettings } from './map/types';
import { parseKML } from './map/utils/mapHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { MapFloatingPanel } from './map/components/MapFloatingPanel';
import { MAP_PERFORMANCE_CONFIG } from '../../config/mapConfig';
import { isPointInPolygon, getPolygonCentroid } from './map/utils/mapHelpers';

const MapController = ({ center, isSidebarOpen }: { center: [number, number], isSidebarOpen: boolean }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && map) {
      try {
        map.setView(center, map.getZoom() || 14, { animate: true });
      } catch (e) {
        console.warn("Map scroll error ignored:", e);
      }
    }
  }, [center, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (map) {
        try {
          map.invalidateSize({ animate: true });
        } catch (e) {}
      }
    }, 400); // Sidebar animasyonu bittikten sonra
    return () => clearTimeout(timer);
  }, [isSidebarOpen, map]);

  return null;
};

const MapEvents = ({ onMouseMove, onMapClick }: { onMouseMove: (lat: number, lng: number) => void, onMapClick: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    mousemove(e: L.LeafletMouseEvent) { 
       if (onMouseMove) onMouseMove(e.latlng.lat, e.latlng.lng); 
    },
    click(e: L.LeafletMouseEvent) { 
       if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng); 
    }
  });
  return null;
};

export const MapViewScreen: React.FC<MapViewProps> = ({ onOpenDetail, onOpenCreate, citizens, allTapus, setDraftGeometry, activeDraft }) => {
  // --- STATE MANAGEMENT ---
  const [tapular, setTapular] = useState<any[]>(allTapus || []);
  const [parselData, setParselData] = useState<any[]>([]);
  const [importedLayers, setImportedLayers] = useState<ImportedLayer[]>([]);
  const [depoPoints, setDepoPoints] = useState<any[]>([]);
  const [altyapiLayers, setAltyapiLayers] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<'tapu' | 'import' | 'official'>('tapu');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedTapu, setSelectedTapu] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.63, 32.88]);
  const [hoverCoords, setHoverCoords] = useState<[number, number]>([0, 0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isQueryMode, setIsQueryMode] = useState(false);
  const [isSabitlemeMode, setIsSabitlemeMode] = useState(false);
  const [sabitlemeTarget, setSabitlemeTarget] = useState<any>(null);
  const [exploredParsels, setExploredParsels] = useState<any[]>([]);
  const [reqLimitCount, setReqLimitCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [responsibilityLevel, setResponsibilityLevel] = useState('BELDE');
  const [responsibilityBoundary, setResponsibilityBoundary] = useState<any>(null); // Legacy compatibility
  const [categorizedBoundaries, setCategorizedBoundaries] = useState<Record<string, any>>({});
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    showPointers: true,
    showWaterInfra: true,
    clipOutside: true,
    showLabels: true,
    baseMap: 'satellite',
    layerVisibility: { 'İL': true, 'İLÇE': true, 'BELDE': true, 'MAHALLE': true }
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await (window as any).api.getSettings();
      if (res.success) {
        setResponsibilityLevel(res.settings.responsibility_level || 'BELDE');
        
        // 🛡️ DB'den Ayarları Yükle
        const savedLayerVisibility = res.settings.map_layer_visibility ? JSON.parse(res.settings.map_layer_visibility) : {};
        
        setMapSettings({
          showPointers: res.settings.map_show_pointers !== 'false',
          showWaterInfra: res.settings.map_show_water_infra !== 'false',
          clipOutside: res.settings.map_clip_outside_boundary !== 'false',
          showLabels: res.settings.map_show_labels !== 'false',
          baseMap: res.settings.map_base_type || 'satellite',
          layerVisibility: {
             'İL': true, 'İLÇE': true, 'BELDE': true, 'MAHALLE': true,
             ...savedLayerVisibility
          }
        });
        
        // ... (existing boundary loading logic)
        const konums = await (window as any).api.getDbData('TANIM_Konumlar', {});
        if (konums.success && konums.data.length > 0) {
          const rawCat: Record<string, any[]> = {};
          const loadedFiles = new Set<string>();
          
          for (const k of konums.data) {
            if (k.Sinir_Dosya_Yolu && !loadedFiles.has(k.Sinir_Dosya_Yolu)) {
              const bRes = await (window as any).api.fetchBoundaryGeoJSON(k.Sinir_Dosya_Yolu);
              if (bRes.success && bRes.data) {
                loadedFiles.add(k.Sinir_Dosya_Yolu);
                const type = k.Tip || 'DİĞER';
                if (!rawCat[type]) rawCat[type] = [];

                const features = bRes.data.type === 'FeatureCollection' ? bRes.data.features : [bRes.data];
                const enhanced = features.map((f: any) => ({
                   ...f, 
                   properties: { ...f.properties, label: k.Ad, type: k.Tip } 
                }));
                rawCat[type].push(...enhanced);
              }
            }
          }

          // 🛡️ STANDART YAPIYA DÖNÜŞTÜR (MEVCUTLARLA BİRLEŞTİR)
          setCategorizedBoundaries(prev => {
             const newState = { ...prev };
             Object.entries(rawCat).forEach(([type, features]) => {
                newState[type] = { type: 'FeatureCollection', features };
             });
             return newState;
          });

          setLocations(konums.data);
          const allFeatures = Object.values(rawCat).flat();
          if (allFeatures.length > 0) setResponsibilityBoundary({ type: 'FeatureCollection', features: allFeatures });
        
          // 🚀 PERFORMANS MODU KONTROLÜ
          const perfRes = await (window as any).api.getDbData('TANIM_Ayarlar', { anahtar: 'app_performance_mode' });
          if (perfRes.success && perfRes.data.length > 0) {
            const isLow = perfRes.data[0].deger === 'LOW';
            setMapSettings(prev => ({
              ...prev,
              preferCanvas: !isLow,
              zoomAnimation: !isLow,
              fadeAnimation: !isLow
            }));
          }
        }
      }
    };
    fetchSettings();
 
    const today = new Date().toISOString().split('T')[0];
    const reqInfo = JSON.parse(localStorage.getItem('tkgm_req_limit') || `{"date": "${today}", "count": 0}`);
    setReqLimitCount(reqInfo.date === today ? reqInfo.count : 0);

    const handleSave = async (e: any) => {
      const parcel = e.detail;
      const confirm = await (window as any).api.showConfirm({
        title: 'SİSTEME KAYDET',
        message: `${parcel.properties.ozet} numaralı taşınmazı teknik verileriyle beraber sisteme kaydetmek istiyor musunuz?`,
        type: 'question'
      });
      
      if (confirm) {
        setIsLoading(true);
        const registerRes = await (window as any).api.autoRegisterTkgmParcel(parcel);
        if (registerRes.success) {
          (window as any).api.showAlert({ title: 'OTOMATİK KAYIT', message: `${parcel.properties.ozet} sisteme sarsılmaz bir nizamla mühürlendi!`, type: 'success' });
          refreshAll();
          setExploredParsels(prev => prev.filter(p => p.properties.ozet !== parcel.properties.ozet));
        } else {
          (window as any).api.showAlert({ title: 'HATA', message: 'Kayıt sırasında bir pürüz çıktı: ' + registerRes.error, type: 'error' });
        }
        setIsLoading(false);
      }
    };

    const handleOpenTechPanel = (e: any) => {
      const feature = e.detail;
      const tapu = tapular.find(t => String(t.Ada) === String(feature.properties.adaNo) && String(t.Parsel) === String(feature.properties.parselNo));
      if (tapu) {
        handleSelectTapu(tapu);
      } else {
        (window as any).api.showAlert({ title: 'HATA', message: 'İlgili taşınmaz kaydı sistemde bulunamadı.', type: 'error' });
      }
    };
 
    window.addEventListener('save-discovered-parcel', handleSave);
    window.addEventListener('open-parcel-technical-panel', handleOpenTechPanel);
    return () => {
      window.removeEventListener('save-discovered-parcel', handleSave);
      window.removeEventListener('open-parcel-technical-panel', handleOpenTechPanel);
    };
  }, [tapular]);

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setIsMapReady(true), 300);
    return () => clearTimeout(timer);
  }, [allTapus]);

  // --- DATA FETCHING ---
  const refreshAll = async () => {
    loadTapus();
    loadSavedLayers();
    loadParselData();
    loadInfrastructure();
  };

  const loadTapus = async () => {
    const res = await ElectronService.getRecords('DATA_Tapu_Verisi');
    if (res.success) setTapular(res.data || []);
  };

  const loadInfrastructure = async () => {
    if (!(window as any).api?.getMapInfrastructure) return;
    const res = await (window as any).api.getMapInfrastructure();
    if (res.success) {
       setDepoPoints((res.depolar || []).map((d: any) => ({ ...d, geojson: d.content ? parseKML(d.content) : null })));
       setAltyapiLayers((res.altyapi || []).map((a: any) => ({ ...a, geojson: a.content ? parseKML(a.content) : null })));
    }
  };

  const loadParselData = async () => {
    const res = await (window as any).api.getParselData();
    if (res.success) {
      setParselData(res.data.map((r: any) => {
        let geojson = null;
        if (r.content) {
          try {
            const extension = r.Dosya_Yolu?.split('.').pop()?.toLowerCase();
            geojson = extension === 'kml' ? parseKML(r.content) : JSON.parse(r.content);
          } catch (e) {}
        }
        return { ...r, geojson };
      }));
    }
  };

  const loadSavedLayers = async () => {
    const res = await (window as any).api.getMapLayers();
    if (res.success) {
      const dbImported: ImportedLayer[] = [];
      const accumulatedBoundaries: Record<string, any[]> = {};

      res.data.forEach((l: any) => {
        let geojson = null;
        try {
          geojson = l.data || (l.Tip === 'kml' ? parseKML(l.content) : JSON.parse(l.content));
        } catch (e) {
          console.error(`Layer parse error (${l.Ad}):`, e);
        }

        if (!geojson) return;

        if (l.Kategori === 'SINIR') {
          const type = l.Tip || 'MAHALLE';
          if (!accumulatedBoundaries[type]) accumulatedBoundaries[type] = [];
          
          // Mükerrer kontrolü (Hem mevcut state hem de bu döngüde eklenenler)
          const isAlreadyInState = categorizedBoundaries[type]?.features?.find((b: any) => b.id === l.id);
          const isAlreadyInNew = accumulatedBoundaries[type].find((b: any) => b.id === l.id);

          if (!isAlreadyInState && !isAlreadyInNew) {
            const feature = geojson.type === 'FeatureCollection' ? geojson.features[0] : geojson;
            accumulatedBoundaries[type].push({
              ...feature,
              id: l.id,
              properties: { 
                ...feature.properties, 
                label: l.Ad, 
                type: type 
              }
            });
          }
        } else {
          // Normal özel katman
          dbImported.push({ 
            id: l.id, 
            name: l.Ad, 
            type: l.Tip, 
            data: geojson, 
            visible: l.Gorunur === 1, 
            color: l.Renk, 
            isPersistent: true, 
            Tasinmaz_id: l.Tasinmaz_id 
          });
        }
      });

      // 🛡️ MapCore'un beklediği FeatureCollection yapısına dönüştür (MEVCUTLARLA BİRLEŞTİR)
      setCategorizedBoundaries(prev => {
        const newState = { ...prev };
        Object.entries(accumulatedBoundaries).forEach(([type, features]) => {
          const existingFeatures = newState[type]?.features || [];
          newState[type] = {
            type: 'FeatureCollection',
            features: [...existingFeatures, ...(features as any[])]
          };
        });
        return newState;
      });
      setImportedLayers(dbImported);
    }
  };

  // --- HANDLERS ---
  const handleMapClick = async (lat: number, lng: number) => {
    if (isSabitlemeMode && sabitlemeTarget) {
      setIsLoading(true);
      const res = await (window as any).api.saveParselData({ tasinmazId: sabitlemeTarget.id, lat, lng, metadata: JSON.stringify({ type: 'parcel_center' }) });
      if (res.success) {
        (window as any).api.showAlert({ title: 'BAŞARILI', message: `${sabitlemeTarget.Ada}/${sabitlemeTarget.Parsel} sabitlendi.`, type: 'success' });
        setIsSabitlemeMode(false);
        setSabitlemeTarget(null);
        loadParselData(); 
      }
      setIsLoading(false);
      return;
    }

    if (isQueryMode) {
      const threshold = 0.0005;
      const nearest = parselData.filter(p => p.Lat && p.Lng).map(p => ({ ...p, dist: Math.sqrt(Math.pow(p.Lat - lat, 2) + Math.pow(p.Lng - lng, 2)) })).filter(p => p.dist < threshold).sort((a, b) => a.dist - b.dist)[0];
      if (nearest) {
        const tapu = tapular.find(t => t.id === nearest.Tasinmaz_id);
        if (tapu) { setSelectedTapu(tapu); setIsQueryMode(false); }
        return;
      }
    }

    // TKGM ANLIK KEŞİF (Sadece Sorgu Modu Açıkken)
    if (isQueryMode) {
      const today = new Date().toISOString().split('T')[0];
      const reqInfo = JSON.parse(localStorage.getItem('tkgm_req_limit') || `{"date": "${today}", "count": 0}`);
      if (reqInfo.date !== today) { reqInfo.date = today; reqInfo.count = 0; }
      if (reqInfo.count >= 10) { (window as any).api.showAlert({ title: 'KOTA DOLDU', message: 'Yarın tekrar deneyiniz.', type: 'warning' }); return; }

      setIsLoading(true);
      try {
        const res = await (window as any).api.fetchTkgmParcel(lat, lng);
        
        if (res.success && res.data && res.data.type === "Feature") {
          const geojson = res.data;
          // Kota Güncelle
          reqInfo.count += 1;
          setReqLimitCount(reqInfo.count);
          localStorage.setItem('tkgm_req_limit', JSON.stringify(reqInfo));
          setExploredParsels(prev => [...prev, { ...geojson, id: `discovered_${Date.now()}` }]);
        } else if (!res.success) {
          console.error("TKGM Proxy Hatası:", res.error);
        }
      } catch (e) {
        console.error("TKGM Keşif Hatası:", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectTapu = (t: any) => {
    const mPoint = parselData.find(p => p.Tasinmaz_id === t.id);
    setSelectedTapu({ ...t, mapMetadata: mPoint?.geojson });
    if (mPoint && mPoint.Lat) setMapCenter([Number(mPoint.Lat), Number(mPoint.Lng)]);
  };

  const filteredTapular = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return tapular.filter(t => (t.Ada || "").toString().includes(s) || (t.Parsel || "").toString().includes(s)).slice(0, 50);
  }, [searchTerm, tapular]);
  
  const handleUpdateSetting = async (key: string, value: any) => {
    setMapSettings((prev: MapSettings) => {
      const newState = { ...prev };
      if (key === 'map_show_pointers') newState.showPointers = value;
      else if (key === 'map_show_water_infra') newState.showWaterInfra = value;
      else if (key === 'map_clip_outside_boundary') newState.clipOutside = value;
      else if (key === 'map_base_type') newState.baseMap = value;
      else if (key === 'map_show_labels') newState.showLabels = value;
      else if (key === 'layerVisibility') newState.layerVisibility = value;
      return newState;
    });
    
    // DB'ye kaydet
    const dbValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const dbKey = key === 'layerVisibility' ? 'map_layer_visibility' : (key === 'map_show_labels' ? 'map_show_labels' : key);
    await (window as any).api.updateSetting(dbKey, dbValue);
  };

  // --- CLIPPING LOGIC ---
  const clippedParselData = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return parselData;
    return parselData.filter(p => p.Lat && isPointInPolygon([p.Lat, p.Lng], responsibilityBoundary));
  }, [parselData, responsibilityBoundary, mapSettings.clipOutside]);

  const clippedExploredParsels = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return exploredParsels;
    return exploredParsels.filter(p => {
       const coords = p.geometry.type === 'Point' ? p.geometry.coordinates : null;
       if (!coords) return true; // Poligonları şimdilik tut
       return isPointInPolygon([coords[1], coords[0]], responsibilityBoundary);
    });
  }, [exploredParsels, responsibilityBoundary, mapSettings.clipOutside]);

  const clippedDepoPoints = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return depoPoints;
    return depoPoints.filter(p => p.Lat && isPointInPolygon([p.Lat, p.Lng], responsibilityBoundary));
  }, [depoPoints, responsibilityBoundary, mapSettings.clipOutside]);

  const clippedTapular = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return tapular;
    return tapular.filter(t => {
      const pItem = parselData.find(p => p.Tasinmaz_id === t.id && p.Lat);
      if (!pItem) return true; // Lokasyonu yoksa kalsın (listede görünebilir)
      return isPointInPolygon([pItem.Lat, pItem.Lng], responsibilityBoundary);
    });
  }, [tapular, parselData, responsibilityBoundary, mapSettings.clipOutside]);

  const clippedImportedLayers = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return importedLayers;
    // Basit bir filtreleme: Eğer katman ismi sınırla uyuşmuyorsa (veya genel ise) maskeleme yapabiliriz
    // Şimdilik tüm ithal katmanları gösteriyoruz ama isterseniz geometrik kontrol de eklenebilir.
    return importedLayers; 
  }, [importedLayers, responsibilityBoundary, mapSettings.clipOutside]);

  const clippedAltyapiLayers = useMemo(() => {
    if (!mapSettings.clipOutside || !responsibilityBoundary) return altyapiLayers;
    return altyapiLayers; // Altyapı hatlarını şimdilik maskelemiyoruz (genelde sınır içindedir)
  }, [altyapiLayers, responsibilityBoundary, mapSettings.clipOutside]);

  return (
    <div className="relative w-screen h-screen flex font-sans overflow-hidden bg-slate-900">
      <MapSidebar 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab}
        filteredTapular={filteredTapular} selectedTapu={selectedTapu}
        handleSelectTapu={handleSelectTapu} setSabitlemeTarget={setSabitlemeTarget}
        setIsSabitlemeMode={setIsSabitlemeMode} handleLinkGeometry={(t) => (window as any).api.importMapLayerFileDialog(t.id).then(refreshAll)}
        importedLayers={importedLayers} handleDeleteLayer={(id) => (window as any).api.deleteMapLayer(id).then(refreshAll)}
        onRefresh={refreshAll} onImportFile={() => (window as any).api.importMapLayerFileDialog(selectedTapu?.id).then(refreshAll)}
        parselData={parselData} tapular={tapular}
        mapSettings={mapSettings} onUpdateSetting={handleUpdateSetting}
        locations={locations}
        onSelectLocation={(loc) => {
          if (loc.Lat && loc.Lng) {
            setMapCenter([Number(loc.Lat), Number(loc.Lng)]);
            return;
          }

          // 🛡️ Sarsılmaz Dinamik Odaklama: Sınır dosyasından merkezi bul
          const type = loc.Tip || 'MAHALLE';
          const boundaries = categorizedBoundaries[type];
          
          if (boundaries && boundaries.features) {
             const feature = boundaries.features.find((f: any) => 
               f.properties?.label === loc.Ad || f.properties?.name === loc.Ad
             );
             
             if (feature) {
                const center = getPolygonCentroid(feature);
                if (center) {
                   setMapCenter(center);
                   // Eğer çok uzaktaysa zoom'u da ayarla
                   return;
                }
             }
          }
          
          console.warn("[MapView] Konum odaklama başarısız:", loc.Ad);
        }}
      />

      <div className="relative flex-1">
        {isMapReady ? (
          <MapContainer 
            center={mapCenter} 
            zoom={14} 
            className="w-full h-full"
            {...MAP_PERFORMANCE_CONFIG.performanceProps}
          >
            <MapController center={mapCenter} isSidebarOpen={isSidebarOpen} />
            <MapEvents onMouseMove={(lat, lng) => setHoverCoords([lat, lng])} onMapClick={handleMapClick} />
            <MapCore 
              tapular={mapSettings.showPointers ? clippedTapular : []} 
              parselData={clippedParselData} 
              exploredParsels={clippedExploredParsels}
              importedLayers={clippedImportedLayers} 
              depoPoints={mapSettings.showWaterInfra ? clippedDepoPoints : []} 
              altyapiLayers={mapSettings.showWaterInfra ? clippedAltyapiLayers : []}
              responsibilityBoundary={responsibilityBoundary}
              categorizedBoundaries={categorizedBoundaries}
              mapSettings={mapSettings}
              onOpenDetail={onOpenDetail} setIsSabitlemeMode={setIsSabitlemeMode} setSabitlemeTarget={setSabitlemeTarget}
              isMeasuring={isMeasuring}
              setIsMeasuring={setIsMeasuring}
              selectedTapu={selectedTapu}
            />
          </MapContainer>
        ) : <div className="flex-1 flex items-center justify-center bg-slate-900 animate-pulse text-white">YÜKLENİYOR...</div>}

        <MapOverlays 
          isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
          isQueryMode={isQueryMode} setIsQueryMode={setIsQueryMode}
          isSabitlemeMode={isSabitlemeMode} setIsSabitlemeMode={setIsSabitlemeMode}
          isMeasuring={isMeasuring} setIsMeasuring={setIsMeasuring}
          sabitlemeTarget={sabitlemeTarget} setSabitlemeTarget={setSabitlemeTarget}
          tapular={tapular} exploredParsels={exploredParsels} setExploredParsels={setExploredParsels}
          onRefresh={refreshAll} onGoHome={() => setMapCenter([36.63, 32.88])}
          hoverCoords={hoverCoords} reqLimitCount={reqLimitCount} isLoading={isLoading}
          mapSettings={mapSettings} onUpdateSetting={handleUpdateSetting}
          importedLayers={importedLayers} onImportFile={() => (window as any).api.importMapLayerFileDialog(selectedTapu?.id).then(refreshAll)}
        />

        <AnimatePresence>
          {selectedTapu && (
            <MapFloatingPanel 
              selectedTapu={selectedTapu} 
              onClose={() => setSelectedTapu(null)} 
              onDownload={(format: string) => {
                (window as any).api.showAlert({ title: 'İNDİRME', message: `${format.toUpperCase()} formatında hazırlık başlatıldı...`, type: 'info' });
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .leaflet-container { background: #0f172a !important; width: 100%; height: 100%; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 32px; padding: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(24px); }
        .custom-popup .leaflet-popup-content { margin: 0; }
        .custom-div-icon { background: none !important; border: none !important; }
      `}</style>
    </div>
  );
};

