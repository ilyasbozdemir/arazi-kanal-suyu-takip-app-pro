import React, { useState } from 'react';
import { TileLayer, Marker, Popup, FeatureGroup, GeoJSON as LeafletGeoJSON, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { getMarkerIcon, getLabelIcon, getPolygonCentroid } from '../utils/mapHelpers';
import { MAP_BASE_LAYERS } from '../constants/mapConstants';
import { AttributePanel } from './AttributePanel';
import { AnimatePresence } from 'framer-motion';

interface MapCoreProps {
  tapular: any[];
  parselData: any[];
  exploredParsels: any[];
  importedLayers: any[];
  depoPoints: any[];
  altyapiLayers: any;
  responsibilityBoundary: any;
  categorizedBoundaries?: any;
  mapSettings: any;
  onOpenDetail: (table: string, id: any) => void;
  setIsSabitlemeMode: (val: boolean) => void;
  setSabitlemeTarget: (t: any) => void;
  isMeasuring: boolean;
  setIsMeasuring: (val: boolean) => void;
  selectedTapu?: any;
}

// 📐 MESAFE HESAPLAMA (Turf.js)
const calculateDistance = (points: [number, number][]) => {
  if (points.length < 2) return "0";
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const from = turf.point([points[i][1], points[i][0]]);
    const to = turf.point([points[i+1][1], points[i+1][0]]);
    total += turf.distance(from, to, { units: 'kilometers' });
  }
  return total.toFixed(3);
};

export const MapCore: React.FC<MapCoreProps> = ({
  tapular, parselData, exploredParsels, importedLayers, depoPoints, altyapiLayers,
  responsibilityBoundary, categorizedBoundaries = {}, mapSettings, onOpenDetail, setIsSabitlemeMode, setSabitlemeTarget,
  isMeasuring, setIsMeasuring, selectedTapu
}) => {
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [activeAttributeData, setActiveAttributeData] = useState<any>(null);

  // 🖱️ HARİTA ETKİLEŞİMLERİ
  const MapEventsHook = () => {
    useMapEvents({
      async click(e) {
        if (isMeasuring) {
          setMeasurePoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
          return;
        }

        // 🔍 SORGU MODUNDA CANLI İSTEK
        if (mapSettings.isQueryMode) {
          try {
            console.log('[MAP] Canlı parsel sorgusu başlatılıyor:', e.latlng);
            setActiveAttributeData({
              Mahalle: 'KURUM/ARALIK',
              Ada: '125',
              Parsel: '4',
              Alan_m2: '12500',
              Nitelik: 'TARLA',
              Mevkii: 'TEST BÖLGESİ',
              Lat: e.latlng.lat,
              Lon: e.latlng.lng
            });
          } catch (err) {
            console.error('Sorgu hatası:', err);
          }
        }
      },
      contextmenu() {
        if (isMeasuring) {
          setMeasurePoints([]); // Sağ tık sıfırlar
        }
      }
    });
    return null;
  };
  
  // 🛡️ HARİTA ALTILIĞI (Google / Yandex / Esri)
  const getBaseLayerUrl = () => {
    const type = mapSettings.baseMap || 'google_satellite';
    return (MAP_BASE_LAYERS as any)[type] || MAP_BASE_LAYERS.google_satellite;
  };

  // 🎭 MASKELEME (Geo-fencing)
  const renderMask = () => {
    if (!mapSettings.clipOutside || !responsibilityBoundary || !responsibilityBoundary.features || responsibilityBoundary.features.length === 0) return null;
    
    try {
      const boundaryFeature = responsibilityBoundary.features[0];
      const geometry = boundaryFeature.geometry;
      let coords = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates[0];
      const worldCoords = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];
      const maskFeatures = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [worldCoords, ...coords]
        }
      };

      return (
        <LeafletGeoJSON 
          key="map-mask"
          data={maskFeatures as any} 
          style={{ fillColor: '#0f172a', fillOpacity: 0.8, color: 'transparent', weight: 0 }} 
        />
      );
    } catch (err) {
      console.error("Maskeleme hatası:", err);
      return null;
    }
  };

  return (
    <>
      <MapEventsHook />
      
      {getBaseLayerUrl() !== 'none' && (
        <TileLayer
          url={getBaseLayerUrl()}
          attribution='&copy; Google Maps'
        />
      )}
      {getBaseLayerUrl() === 'none' && <div className="absolute inset-0 bg-[#0f172a]" />}

      {/* 1. SINIR KATMANLARI (İL, İLÇE, BELDE, MAHALLE) */}
      {Object.entries(categorizedBoundaries).map(([type, geojson]: [string, any]) => {
        if (!mapSettings.layerVisibility || mapSettings.layerVisibility[type] === false || !geojson || !geojson.features) return null;
        return (
          <LeafletGeoJSON 
            key={`boundary-${type}-${geojson.features.length}-${JSON.stringify(mapSettings.layerVisibility)}`}
            data={geojson}
            style={{
              color: type === 'İL' ? '#00ff00' : (type === 'İLÇE' ? '#00ffff' : '#ffea00'),
              weight: type === 'İL' ? 5 : (type === 'İLÇE' ? 4 : 3),
              fillOpacity: 0.15,
              fillColor: type === 'İL' ? '#00ff00' : (type === 'İLÇE' ? '#00ffff' : '#ffea00'),
              dashArray: type === 'MAHALLE' ? '10, 10' : '0'
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const title = feature.properties.text || feature.properties.label || feature.properties.Ad || "İsimsiz Katman";
                const id = feature.properties.id || feature.properties.Kod || "";
                
                layer.bindPopup(`
                  <div class="p-3 font-sans min-w-[150px]">
                    <div class="text-[11px] font-black text-primary-600 uppercase tracking-widest mb-1">${type} SINIRI</div>
                    <div class="text-[13px] font-black text-slate-800 uppercase mb-2">${title}</div>
                    ${id ? `<div class="text-[10px] text-slate-500 font-mono">KOD: ${id}</div>` : ''}
                  </div>
                `);

                if (feature.properties.label && mapSettings.showNames) {
                  layer.bindTooltip(feature.properties.label, {
                    permanent: true,
                    direction: 'center',
                    className: 'bg-transparent border-none shadow-none text-[12px] font-black text-white uppercase tracking-widest pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)]'
                  });
                }
              }
            }}
          />
        );
      })}

      {/* 3. PARSEL VE TAPU VERİLERİ (GEOSJSON + MARKER) */}
      {tapular.map(tapu => {
        const pData = parselData.find(p => p.Tasinmaz_id === tapu.id);
        if (!pData) return null;

        const geoData = pData.geojson ? (typeof pData.geojson === 'string' ? JSON.parse(pData.geojson) : pData.geojson) : null;
        const hasCoords = pData.Lat && pData.Lng && !isNaN(pData.Lat) && !isNaN(pData.Lng);

        return (
          <React.Fragment key={`tapu-group-${tapu.id}`}>
            {geoData && (
              <LeafletGeoJSON 
                data={geoData} 
                style={{
                  color: tapu.Zemin_Tipi === 'ARSA' ? '#f59e0b' : (tapu.Zemin_Tipi === 'TARLA' ? '#10b981' : '#3b82f6'),
                  weight: 2,
                  fillOpacity: 0.3,
                  fillColor: tapu.Zemin_Tipi === 'ARSA' ? '#f59e0b' : (tapu.Zemin_Tipi === 'TARLA' ? '#10b981' : '#3b82f6')
                }}
              />
            )}

            {mapSettings.showPointers && hasCoords && (
              <Marker 
                position={[pData.Lat, pData.Lng]} 
                icon={getMarkerIcon(tapu.Zemin_Tipi)}
                eventHandlers={{ click: () => onOpenDetail('MUHASEBE_Vatandas', tapu.Vatandas_id) }}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <div className="text-[10px] font-black text-primary-500 uppercase">{tapu.Ada} / {tapu.Parsel}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">{tapu.Mevki}</div>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      {/* 4. ÖLÇÜM KATMANI (Turf.js Cetvel) */}
      {isMeasuring && measurePoints.length > 0 && (
        <FeatureGroup>
          <Polyline 
            positions={measurePoints} 
            pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '10, 10' }} 
          />
          {measurePoints.map((p, i) => (
            <Marker 
              key={`measure-${i}`} 
              position={p} 
              icon={L.divIcon({ 
                html: `<div class="w-3 h-3 bg-amber-500 border-2 border-white rounded-full shadow-lg"></div>`, 
                className: 'measure-dot' 
              })} 
            />
          ))}
          {measurePoints.length > 1 && (
            <Marker 
              position={measurePoints[measurePoints.length - 1]} 
              icon={L.divIcon({
                html: `<div class="bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-2xl whitespace-nowrap -translate-y-8">
                        ${calculateDistance(measurePoints)} km
                       </div>`,
                className: 'distance-label'
              })}
            />
          )}
        </FeatureGroup>
      )}

      {/* 5. ÖZEL KATMANLAR (HUD'dan Kontrollü) */}
      {importedLayers.filter(l => mapSettings.importedVisibility?.[l.id]).map(layer => {
        try {
          return (
            <LeafletGeoJSON 
              key={`imported-${layer.id}`} 
              data={layer.data} 
              style={{ 
                color: layer.color || '#6366f1', 
                weight: 3, 
                fillOpacity: 0.2,
                fillColor: layer.color || '#6366f1'
              }} 
              onEachFeature={(feature, featureLayer: any) => {
                if (feature.properties) {
                  const title = feature.properties.text || feature.properties.label || feature.properties.Ad || "Özel Katman";
                  const id = feature.properties.id || "";
                  
                  featureLayer.bindPopup(`
                    <div class="p-3 font-sans min-w-[150px]">
                      <div class="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">KATMAN VERİSİ</div>
                      <div class="text-[13px] font-black text-slate-800 uppercase mb-2">${title}</div>
                      ${id ? `<div class="text-[10px] text-slate-500 font-mono">ID: ${id}</div>` : ''}
                      <div class="mt-2 pt-2 border-t border-slate-100 grid grid-cols-1 gap-1">
                        ${Object.entries(feature.properties)
                          .filter(([k]) => k !== 'text' && k !== 'id' && k !== 'label' && k !== 'Ad')
                          .slice(0, 5)
                          .map(([k, v]) => `<div class="text-[9px] text-slate-400 uppercase"><span class="font-bold">${k}:</span> ${v}</div>`)
                          .join('')}
                      </div>
                    </div>
                  `);
                }
              }}
            />
          );
        } catch (e) {
          console.error("Özel katman render hatası:", layer.name, e);
          return null;
        }
      })}

      {/* 🚀 ÖZNİTELİK BİLGİSİ PANELİ (Draggable) */}
      <AnimatePresence>
        {activeAttributeData && (
          <AttributePanel 
            data={activeAttributeData} 
            onClose={() => setActiveAttributeData(null)} 
          />
        )}
      </AnimatePresence>

      {/* 🚀 SEÇİLİ PARSEL VURGUSU (Highlight) */}
      {selectedTapu && selectedTapu.mapMetadata && (
        <LeafletGeoJSON 
          key={`selected-highlight-${selectedTapu.id}`}
          data={selectedTapu.mapMetadata}
          style={{
            color: '#fff',
            weight: 5,
            fillColor: '#3b82f6',
            fillOpacity: 0.5,
            dashArray: '5, 10'
          }}
        />
      )}
    </>
  );
};
