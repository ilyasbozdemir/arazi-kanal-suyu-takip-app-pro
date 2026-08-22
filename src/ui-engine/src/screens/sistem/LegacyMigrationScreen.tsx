import { useState, useEffect } from 'react'
import {
  Database,
  ArrowRight,
  AlertCircle,
  Trash2,
  RefreshCcw,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MigrationMappingSidebar } from '../../components/migration/MigrationMappingSidebar'
import { MigrationRecordCard } from '../../components/migration/MigrationRecordCard'

export const LegacyMigrationScreen = () => {
  const [legacyRows, setLegacyRows] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [targetCols, setTargetCols] = useState<string[]>([])
  const [migratedIds, setMigratedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [foundTableName, setFoundTableName] = useState('')
  const [allTables, setAllTables] = useState<string[]>([])
  const [targetCount, setTargetCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    fetchLegacyData()
    fetchTargetSchema()
  }, [])

  const fetchLegacyData = async (targetTable?: string) => {
    setIsLoading(true)
    const res = await (window as any).api.getLegacyTableData({ tableName: targetTable || foundTableName })
    if (res.success) {
      setLegacyRows(res.rows)
      setColumns(res.columns)
      setFoundTableName(res.tableName)
      setAllTables(res.allTables || [])
      setTargetCount(res.targetCount || 0)
      autoMap(res.columns)
      setError(null)
    } else {
      setError(res.error)
      if (res.tables) setAllTables(res.tables)
    }
    setIsLoading(false)
  }

  const fetchTargetSchema = async () => {
    const res = await (window as any).api.getDbSchema()
    if (res.success) {
      const vatandasTable = res.schema.find((t: any) => t.name === 'VatandasTBL' || t.name === 'DATA_Vatandas')
      if (vatandasTable) setTargetCols(['SKIP', ...vatandasTable.columns.map((c: any) => c.name)])
    }
  }

  const autoMap = (oldCols: any[]) => {
    const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[\s_]/g, '')
    const newMapping: Record<string, string> = {}
    const targets = ['TCKN', 'Ad', 'Soyad', 'Baba_Adi', 'Ana_Adi', 'Telefon', 'Adres', 'Sicil_No', 'Eposta', 'Lakap', 'Unvan', 'Cinsiyet', 'Dogum_Tarihi', 'Il', 'Ilce', 'Mahalle_Koy']
    oldCols.forEach(col => {
      const name = normalize(col.name)
      const match = targets.find(t => normalize(t) === name || name.includes(normalize(t)))
      if (match) newMapping[col.name] = match
      else if (name.includes('tc')) newMapping[col.name] = 'TCKN'
      else if (name.includes('koy') || name.includes('mahalle')) newMapping[col.name] = 'Mahalle_Koy'
      else newMapping[col.name] = 'SKIP'
    })
    setMapping(newMapping)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredRows.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredRows.map(r => r.id)))
  }

  const handleMigrate = async () => {
    if (selectedIds.size === 0) return
    setIsLoading(true)
    let successCount = 0
    let failCount = 0
    for (const id of Array.from(selectedIds)) {
      if (migratedIds.has(id)) continue
      const res = await (window as any).api.executeMigrationStep({ rowId: id, mapping })
      if (res.success) { successCount++; setMigratedIds(prev => new Set(prev).add(id)) }
      else { failCount++; setLastError(res.error) }
    }
    if (successCount > 0) {
      (window as any).showAlert('BAŞARILI', `${successCount} kayıt başarıyla aktarıldı.`, 'success')
      setSelectedIds(new Set())
      if (window.dispatchEvent) window.dispatchEvent(new CustomEvent('db-updated', { detail: { table: 'DATA_Vatandas' } }))
    }
    if (failCount > 0) (window as any).showAlert('KISMİ HATA', `${failCount} kayıt aktarılamadı.`, 'error')
    setIsLoading(false)
  }

  const handleClearTarget = async () => {
    const ok = await (window as any).api.showConfirm({ title: 'DİKKAT: KAYITLAR SİLİNECEK', message: 'DATA_Vatandas tablosundaki TÜM mevcut kayıtları silmek istediğinize emin misiniz?' })
    if (ok.confirmed) {
      setIsLoading(true)
      const res = await (window as any).api.clearTable('DATA_Vatandas')
      if (res.success) { (window as any).showAlert('BAŞARILI', 'Üretim tablosu temizlendi.', 'success'); fetchLegacyData() }
      setIsLoading(false)
    }
  }

  const filteredRows = legacyRows.filter(r => Object.values(r).some(val => String(val || '').toLowerCase().includes(searchTerm.toLowerCase())))

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-4">
      <AlertCircle size={48} className="text-red-500/50" />
      <h3 className="text-xl font-semibold text-slate-200">Hata Oluştu</h3>
      <p className="text-center max-w-md">{error}</p>
      <button onClick={() => fetchLegacyData()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
        <RefreshCcw size={16} /> Tekrar Dene
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0c10]">
      <div className="p-6 bg-[#0f1218] border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl"><Database className="text-blue-500" size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Legacy Veri Aktarıcı</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-widest">Kaynak: </span><select title="Kaynak Tablo Seçin" value={foundTableName} onChange={(e) => { setFoundTableName(e.target.value); fetchLegacyData(e.target.value) }} className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-2 py-0.5 text-xs text-blue-400 font-bold cursor-pointer">{allTables.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="h-4 w-[1px] bg-slate-800" /><div className="flex items-center gap-2"><span className="text-slate-400 text-xs uppercase font-bold tracking-widest">Sistemde Mevcut: </span><span className="text-white text-xs font-black px-2 py-0.5 bg-slate-800 rounded-md">{targetCount} Kayıt</span>{targetCount > 0 && <button title="Tabloyu Temizle" onClick={handleClearTarget} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={14} /></button>}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={selectAll} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium text-slate-300">{selectedIds.size === filteredRows.length && filteredRows.length > 0 ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />} Tümünü Seç ({filteredRows.length})</button>
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleMigrate} disabled={selectedIds.size === 0 || isLoading} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg ${selectedIds.size > 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}><ArrowRight size={18} /> {selectedIds.size} Kaydı Aktar</motion.button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" placeholder="Eski tablodan kayıt ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#161a23] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" /></div>
            <button onClick={() => fetchLegacyData()} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border border-slate-700"><RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} /> Tabloyu Yeniden Tara</button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-4"><Filter size={14} /> Otomatik Eşleşme Aktif</div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <MigrationMappingSidebar columns={columns} mapping={mapping} setMapping={setMapping} targetCols={targetCols} />
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredRows.map((row) => <MigrationRecordCard key={row.id} row={row} isSelected={selectedIds.has(row.id)} isMigrated={migratedIds.has(row.id)} toggleSelect={toggleSelect} />)}
            </AnimatePresence>
          </div>
          {filteredRows.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-slate-500"><AlertCircle size={40} className="mb-4 opacity-20" /><p className="font-medium text-lg">Eşleşen kayıt bulunamadı.</p></div>}
        </div>
      </div>
      <div className="p-4 bg-[#0f1218] border-t border-slate-800/50 text-slate-500 text-xs flex flex-col gap-2">
         {lastError && <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2"><AlertCircle size={14} /><b>SON HATA DETAYI:</b> {lastError}</div>}
         <div className="flex justify-between items-center w-full"><div>Toplam <b>{legacyRows.length}</b> kayıt tarandı. <b>{migratedIds.size}</b> kayıt aktarıldı.</div><div className="flex items-center gap-4"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Seçili</span><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Aktarıldı</span><span className="flex items-center gap-1.5 font-bold text-slate-400">YBS Mv.v1.0</span></div></div>
      </div>
    </div>
  )
}

