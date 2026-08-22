import L from 'leaflet';

export interface MapViewProps {
  onOpenDetail: (table: string, id: any) => void;
  onOpenCreate: (table: string) => void;
  citizens: any[];
  allTapus: any[];
  setDraftGeometry: (val: any) => void;
  activeDraft: boolean;
}

export interface ImportedLayer {
  id: string;
  name: string;
  type: 'kml' | 'dxf' | 'geojson';
  data: any;
  visible: boolean;
  color: string;
  isPersistent?: boolean;
  Tasinmaz_id?: string;
}

export interface MapState {
  tapular: any[];
  parselData: any[];
  importedLayers: ImportedLayer[];
  depoPoints: any[];
  altyapiLayers: any[];
  exploredParsels: any[];
  reqLimitCount: number;
  isLoading: boolean;
  isMapReady: boolean;
  isQueryMode: boolean;
  isSabitlemeMode: boolean;
  sabitlemeTarget: any;
  selectedTapu: any;
  mapCenter: [number, number];
  hoverCoords: [number, number];
}
export interface MapSettings {
  showPointers: boolean;
  showWaterInfra: boolean;
  clipOutside: boolean;
  showLabels: boolean;
  baseMap: string;
  layerVisibility: Record<string, boolean>;
  importedVisibility?: Record<string, boolean>;
  preferCanvas?: boolean;
  zoomAnimation?: boolean;
  fadeAnimation?: boolean;
}
