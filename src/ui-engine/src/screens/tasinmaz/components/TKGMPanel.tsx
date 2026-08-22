import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl, ScaleControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  Map as MapIcon, 
  Search, 
  Layers, 
  RefreshCw,
  MapPin,
  ExternalLink,
  Database,
  Info
} from 'lucide-react'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_PERFORMANCE_CONFIG } from '../../../config/mapConfig'

// Fix Leaflet marker icon issue
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface TKGMPanelProps {
  initialAda?: string
  initialParsel?: string
  initialMevkii?: string
}

export const TKGMPanel: React.FC<TKGMPanelProps> = ({ initialAda, initialParsel, initialMevkii }) => {
  const [loading, setLoading] = useState(false)
  const [provinceId] = useState(92) 
  const [districts, setDistricts] = useState<any[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(null)
  const [ada, setAda] = useState(initialAda || '')
  const [parsel, setParsel] = useState(initialParsel || '')
  const [parcelData, setParcelData] = useState<any>(null)
  const [activeLayer, setActiveLayer] = useState<'osm' | 'google' | 'tkgm' | 'hgm'>('osm')
  const [showLayerMenu, setShowLayerMenu] = useState(false)
  const [dataSource, setDataSource] = useState<'api' | 'cache' | null>(null)

  // Auto-fit bounds
  function ChangeView({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap();
    useEffect(() => {
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [100, 100], animate: true });
      }
    }, [bounds]);
    return null;
  }

  useEffect(() => {
    const init = async () => {
      if (!(window as any).api?.tkgm) return;
      setLoading(true)
      const res = await (window as any).api.tkgm.getDistricts(provinceId)
      if (res?.success) {
        setDistricts(res.data || [])
        const merkez-ilce = (res.data || []).find((d: any) => (d.ad || '').toLocaleUpperCase('tr-TR').includes('MERKEZ İLÇE'))
        if (merkez-ilce) {
          setSelectedDistrict(merkez-ilce.id)
          const mRes = await (window as any).api.tkgm.getNeighborhoods(merkez-ilce.id)
          if (mRes?.success) {
            setNeighborhoods(mRes.data || [])
            const gy = (mRes.data || []).find((n: any) => 
               (n.ad || '').toLocaleUpperCase('tr-TR').includes('KURUM') || (n.ad || '').toLocaleUpperCase('tr-TR').includes('KURUM')
            )
            if (gy) setSelectedNeighborhood(gy.id)
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSearch = async () => {
    if (!selectedNeighborhood || !ada.trim() || !parsel.trim()) return
    setLoading(true)
    try {
      const res = await (window as any).api.tkgm.getParcel({
        mahalleId: selectedNeighborhood,
        ada: ada.trim(),
        parsel: parsel.trim()
      })

      if (res?.success) {
        setParcelData(res.data)
        setDataSource(res.source || 'api')
      } else {
        (window as any).showAlert('TKGM HATA', 'Parsel bulunamadı.', 'error')
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const getBounds = () => {
    if (!parcelData?.geometry) return null;
    try {
       return L.geoJSON(parcelData.geometry).getBounds();
    } catch (e) {
       return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 rounded-[48px] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative">
      {/* Header Panel */}
      <div className="z-30 absolute top-8 left-8 right-8 pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 dark:border-white/5 shadow-2xl pointer-events-auto max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="items-center gap-4 border-r border-slate-100 dark:border-white/5 pr-6 hidden lg:flex">
                <MapIcon size={20} className="text-primary-500" />
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">TKGM SORGULAMA</h4>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <select 
                value={selectedDistrict || ''} 
                title="İlçe Seçin"
                aria-label="İlçe Seçin"
                onChange={(e) => {
                  const id = Number(e.target.value)
                  setSelectedDistrict(id)
                }}
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl px-4 text-xs font-bold outline-none"
              >
                <option value="">İlçe Seçin...</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}
              </select>

              <select 
                value={selectedNeighborhood || ''} 
                title="Mahalle Seçin"
                aria-label="Mahalle Seçin"
                onChange={(e) => setSelectedNeighborhood(Number(e.target.value))}
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl px-4 text-xs font-bold outline-none"
              >
                <option value="">Mahalle Seçin...</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.ad}</option>)}
              </select>

              <input value={ada} onChange={(e) => setAda(e.target.value)} placeholder="Ada" title="Ada Numarası" aria-label="Ada Numarası" className="h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-2xl px-4 text-xs outline-none" />
              
              <div className="flex gap-2">
                <input value={parsel} onChange={(e) => setParsel(e.target.value)} placeholder="Parsel" title="Parsel Numarası" aria-label="Parsel Numarası" className="flex-1 h-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-2xl px-4 text-xs outline-none" />
                <button onClick={handleSearch} disabled={loading} title="Parsel Sorgula" aria-label="Parsel Sorgula" className="px-6 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all">
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : <Search size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 w-full h-full relative z-10">
        <MapContainer 
          center={[37.181, 33.222]} 
          zoom={13} 
          className="w-full h-full" 
          zoomControl={false}
          {...MAP_PERFORMANCE_CONFIG.performanceProps}
        >
          {activeLayer === 'osm' && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
          {activeLayer === 'google' && <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />}
          {activeLayer === 'tkgm' && <TileLayer url="https://tkgm-tiles.tkgm.gov.tr/mapserver/tms/1.0.0/ortofoto@EPSG:900913/{z}/{x}/{-y}.png" tms={true} />}
          {activeLayer === 'hgm' && <TileLayer url="https://atlastile.harita.gov.tr/atlastiles/vector/basemap/{z}/{x}/{y}.png" />}
          {parcelData?.geometry && <GeoJSON data={parcelData.geometry} style={{ color: '#4f46e5', weight: 4, fillColor: '#6366f1', fillOpacity: 0.3 }} />}
          <ChangeView bounds={getBounds()} />
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" />
        </MapContainer>

        {/* Floating Detail Panel */}
        <AnimatePresence>
          {parcelData && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              className="absolute left-8 bottom-8 z-30 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase">{ada}/{parsel}</h4>
                {dataSource === 'cache' && <Database size={16} className="text-emerald-500" />}
              </div>
              <div className="space-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <p>Alan: <span className="text-slate-800 dark:text-white">{parcelData.detay?.alan} m²</span></p>
                <p>Nitelik: <span className="text-slate-800 dark:text-white">{parcelData.detay?.nitelik}</span></p>
                <p>Mevkii: <span className="text-slate-800 dark:text-white">{parcelData.detay?.mevki || '---'}</span></p>
              </div>
              <button 
                onClick={() => window.open(`https://parselsorgu.tkgm.gov.tr/#tip=ada&ada=${ada}&parsel=${parsel}`)}
                className="w-full py-3 bg-primary-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> Resmi Sisteme Git
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer Toggle */}
        <div className="absolute top-[170px] right-8 z-30 flex flex-col gap-2">
           <button onClick={() => setShowLayerMenu(!showLayerMenu)} title="Katman Seçimi" aria-label="Katman Seçimi" className="w-12 h-12 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center text-slate-500 hover:text-primary-500"><Layers size={22} /></button>
           {showLayerMenu && (
             <div className="absolute right-14 top-0 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl border flex flex-col gap-1 w-32">
                <button onClick={() => {setActiveLayer('osm'); setShowLayerMenu(false)}} className="px-3 py-2 text-[9px] font-black uppercase text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Standart</button>
                <button onClick={() => {setActiveLayer('google'); setShowLayerMenu(false)}} className="px-3 py-2 text-[9px] font-black uppercase text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Uydu</button>
                <button onClick={() => {setActiveLayer('tkgm'); setShowLayerMenu(false)}} className="px-3 py-2 text-[9px] font-black uppercase text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">TKGM Orto</button>
             </div>
           )}
        </div>

        {/* Attribution Bar */}
        <div className="absolute bottom-4 left-24 z-20 px-4 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-2">
           <Info size={12} className="text-primary-400" />
           <p className="text-[7px] font-black text-white/70 uppercase tracking-widest">© HGM, TKGM Megsis Servisi © 2026</p>
        </div>
      </div>
    </div>
  )
}

