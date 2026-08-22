/**
 * 🛡️ KURUM BAŞKANLIĞI - MERKEZİ HARİTA OPTİMİZASYON AYARLARI
 * Donanım hızlandırmalı (GPU-Accelerated) ve yüksek performanslı GIS ayarları.
 */
export const MAP_PERFORMANCE_CONFIG = {
  preferCanvas: true,         // 🚀 GPU Üzerinden (Canvas) render - Binlerce parselde kasmaz!
  zoomAnimation: true,        // Akıcı yakınlaştırma
  fadeAnimation: true,        // Akıcı katman geçişleri
  markerZoomAnimation: true,  // Markerlar için akıcı geçiş
  
  // React-Leaflet MapContainer için spread edilebilir obje
  performanceProps: {
    preferCanvas: true,
    zoomAnimation: true,
    fadeAnimation: true,
    markerZoomAnimation: true,
    updateWhenIdle: true,     // Harita durunca render et (CPU dostu)
    updateWhenZooming: false, // Zoom yaparken gereksiz renderi kes
  }
} as const;
