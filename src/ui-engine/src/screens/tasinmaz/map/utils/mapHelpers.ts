import L from 'leaflet';
import { kml } from '@tmcw/togeojson';
import * as turf from '@turf/turf';

export const getNitelikColor = (nitelik: string = "") => {
  const n = (nitelik || "").toLocaleUpperCase('tr-TR');
  if (n.includes("ARSA") || n.includes("KONUT") || n.includes("MESKEN") || n.includes("BİNA")) return '#f59e0b';
  if (n.includes("TARLA") || n.includes("ARAZİ") || n.includes("HAM TOPRAK")) return '#10b981';
  if (n.includes("BAĞ") || n.includes("BAHÇE") || n.includes("MEYVE") || n.includes("ELMA")) return '#84cc16';
  if (n.includes("TİCARİ") || n.includes("DÜKKAN") || n.includes("İŞYERİ")) return '#8b5cf6';
  return '#64748b';
};

export const getMarkerIcon = (tapu: any) => {
  const color = getNitelikColor(tapu.Nitelik);
  return L.divIcon({
    html: `
      <div class="relative group">
        <div class="w-10 h-10 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white transform transition-transform group-hover:scale-125" style="background-color: ${color}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
           <span class="text-[10px] font-black uppercase text-slate-800 dark:text-white">${tapu.Ada} / ${tapu.Parsel}</span>
        </div>
      </div>
    `,
    className: 'custom-div-icon', iconSize: [40, 40], iconAnchor: [20, 20]
  });
};

export const getLabelIcon = (ada: string, parsel: string) => {
  return L.divIcon({
    html: `<div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 shadow-sm"><span class="text-[9px] font-black text-slate-800 dark:text-white">${ada}/${parsel}</span></div>`,
    className: 'label-div-icon',
    iconSize: [60, 20],
    iconAnchor: [30, 10]
  });
};

export const renderRichPopup = (feature: any) => {
  const p = feature.properties || {};
  const isSaved = feature.isSaved;
  const color = getNitelikColor(p.nitelik);
  
  return `
    <div class="p-4 min-w-[300px] font-sans bg-white dark:bg-slate-900 overflow-hidden">
      <div class="flex items-start justify-between mb-4 gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background-color: ${color}"></div>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">TAPU KAYIT ÖZETİ</span>
          </div>
          <div class="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">${p.adaNo || '?'}/${p.parselNo || '?'}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
           <div class="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg border border-slate-200 dark:border-white/10 uppercase italic">
             ${p.nitelik || 'BELİRSİZ'}
           </div>
           ${isSaved ? `
             <div class="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black rounded-full border border-emerald-500/20">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
               SİSTEMDE KAYITLI
             </div>
           ` : `
             <div class="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[8px] font-black rounded-full border border-amber-500/20">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               ARŞİVDE YOK
             </div>
           `}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span class="text-[8px] font-black text-slate-400 uppercase block mb-1">MEVKİİ</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate block">${p.mevkii || '-'}</span>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span class="text-[8px] font-black text-slate-400 uppercase block mb-1">ALAN</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase block">${p.alan || '-'} m²</span>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span class="text-[8px] font-black text-slate-400 uppercase block mb-1">ZEMİN</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate block">${p.zeminKmdurum || '-'}</span>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span class="text-[8px] font-black text-slate-400 uppercase block mb-1">PAFTA</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase block">${p.pafta || '-'}</span>
        </div>
        <div class="col-span-2 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
          <span class="text-[8px] font-black text-slate-400 uppercase block mb-1">MAHALLE / BÖLGE</span>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate block">${p.mahalleAd || '-'}</span>
        </div>
      </div>

      <div class="space-y-2">
        ${!isSaved ? `
           <button 
             onclick="window.dispatchEvent(new CustomEvent('save-discovered-parcel', { detail: ${JSON.stringify(feature).replace(/"/g, '&quot;')} }))"
             class="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black uppercase rounded-2xl transition-all shadow-xl shadow-primary-600/20 active:scale-95 flex items-center justify-center gap-2"
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
             SİSTEME KAYDET (ARŞİVLE)
           </button>
        ` : `
           <button 
             onclick="window.dispatchEvent(new CustomEvent('open-parcel-technical-panel', { detail: ${JSON.stringify(feature).replace(/"/g, '&quot;')} }))"
             class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
           >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             TEKNİK DETAY & İNDİR
           </button>
        `}
      </div>
    </div>
  `;
};

export const parseKML = (content: string) => {
  try {
    const dom = new DOMParser().parseFromString(content, 'text/xml');
    return kml(dom);
  } catch (e) {
    return null;
  }
};

/**
 * 🛡️ SARSILMAZ SPATIAL CHECK: Noktanın Poligon İçinde Olup Olmadığını Kontrol Eder (Turf JS Gücüyle)
 */
export const isPointInPolygon = (point: [number, number], boundaryGeoJSON: any) => {
  if (!boundaryGeoJSON || !boundaryGeoJSON.features || boundaryGeoJSON.features.length === 0) return true;
  
  try {
    const turfPoint = turf.point([point[1], point[0]]); // [lng, lat]
    return boundaryGeoJSON.features.some((feature: any) => {
      return turf.booleanPointInPolygon(turfPoint, feature);
    });
  } catch (e) {
    console.error('[Spatial] Turf kontrol hatası:', e);
    return true;
  }
};

/**
 * 🛡️ Poligonun merkez noktasını (Centroid) hesaplar (Turf JS Gücüyle)
 */
export const getPolygonCentroid = (feature: any): [number, number] | null => {
  try {
    const center = turf.centroid(feature);
    const [lng, lat] = center.geometry.coordinates;
    return [lat, lng];
  } catch (e) {
    console.error('[Spatial] Centroid hesaplama hatası:', e);
    return null;
  }
};
