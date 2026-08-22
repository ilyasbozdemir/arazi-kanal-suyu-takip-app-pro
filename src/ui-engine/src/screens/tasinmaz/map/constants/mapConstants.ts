/**
 * 🗺️ HARİTA KATMANLARI VE SABİTLERİ (GOOGLE MAPS & OSM)
 */
export const MAP_BASE_LAYERS = {
  google_satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  google_hybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  yandex_satellite: 'https://sat01.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}',
  esri_world: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  none: 'none'
};

export const DEFAULT_MAP_CENTER: [number, number] = [37.1812, 33.2223]; // Merkez İl / Kurum Civarı
export const DEFAULT_ZOOM = 13;
