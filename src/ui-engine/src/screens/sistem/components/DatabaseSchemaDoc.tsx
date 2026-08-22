import React, { useState, useEffect } from 'react';
import { Database, Users, Code, Activity, ArrowUpRight } from 'lucide-react';

interface DatabaseSchemaDocProps {
    onRefresh?: () => void;
}

export const DatabaseSchemaDoc: React.FC<DatabaseSchemaDocProps> = () => {
    const [schema, setSchema] = useState<any[]>([])

    useEffect(() => {
        const fetchSchema = async () => {
            const res = await (window as any).api.getDbSchema()
            if (res.success) setSchema(res.schema)
        }
        fetchSchema()
    }, [])

    return (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-primary-500 text-white rounded-3xl"><Database size={24} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Veritabanı Mimarisi (Schema)</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md uppercase">Standard Webhook Format v1.0</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-80 italic">Olgu YBS ve Harici Entegrasyonlar İçin Evrensel Veri Yapısı</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {schema.map(table => (
                    <TableCard key={table.name} table={table} />
                ))}
            </div>
        </div>
    )
}

const TableCard: React.FC<{ table: any }> = ({ table }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        setLoading(true)
        setResponse(null)
        const testData = {
            event: 'SCHEMA_TEST',
            table: table.name,
            payload: (table.columns || []).reduce((acc: any, c: any) => ({ ...acc, [c.name]: c.pk ? 1 : (c.type === 'REAL' ? 99.9 : 'TEST_DATA') }), {})
        };
        const res = await (window as any).api.sendWebhook(testData);
        setResponse(res)
        setLoading(false)
    }

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-700/50 space-y-6 flex flex-col h-full hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h4 className="text-lg font-black text-primary-600 uppercase tracking-tighter leading-none mb-1">{table.name}</h4>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">{(table.columns || []).length} KOLON</span>
                        {(table.foreignKeys || []).length > 0 && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest italic">{(table.foreignKeys || []).length} İLİŞKİ</span>}
                    </div>
                </div>
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 ${loading ? 'opacity-50' : response?.success ? 'bg-emerald-50 text-white shadow-emerald-500/20' : response?.error ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-primary-600 text-white shadow-primary-500/20'}`}
                >
                    {loading ? 'GÖNDERİLİYOR...' : response?.success ? 'BAŞARILI!' : response?.error ? 'HATA!' : 'TEST GÖNDER'}
                    {!loading && <ArrowUpRight size={14} />}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-grow">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={12} className="text-primary-500" /> TABLO KOLONLARI
                        </p>
                        <span className="text-[10px] font-bold text-primary-500 group-hover:underline">{isOpen ? 'Daralt' : 'Tümünü Gör'}</span>
                    </div>

                    <div className={`space-y-3 transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-60'}`}>
                        {(table.columns || []).map((c: any) => (
                            <div key={c.name} className="flex items-center justify-between text-[11px] font-bold py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 dark:text-slate-300">{c.name}</span>
                                    {c.isUnique && <span className="text-[7px] bg-cyan-500/10 text-cyan-500 px-1.5 py-0.5 rounded-md font-black italic">BENZERSIZ</span>}
                                </div>
                                <span className="text-slate-400 italic text-[10px]">{c.type} {c.pk ? '🔑' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Code size={12} className="text-emerald-500" /> Örnek Webhook Paketi
                        </p>
                    </div>
                    <pre className="text-[9px] font-mono text-emerald-400 bg-slate-950 p-4 rounded-2xl border border-white/5 overflow-x-auto leading-relaxed max-h-40 custom-scrollbar shadow-inner">
                        {JSON.stringify({
                            event: 'DATA_CHANGE',
                            table: table.name,
                            payload: (table.columns || []).reduce((acc: any, c: any) => ({ ...acc, [c.name]: c.pk ? 123 : (c.type === 'REAL' ? 450.50 : '...') }), {})
                        }, null, 2)}
                    </pre>
                </div>
            </div>

            {response && (
                <div className={`p-4 rounded-2xl text-[10px] font-bold animate-in slide-in-from-top-2 duration-300 border ${response.success ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30'}`}>
                    <div className="flex justify-between items-center mb-2 uppercase tracking-widest text-[8px] font-black opacity-60">
                        <span>SUNUCU YANITI (HTTP {response.status || 'ERR'})</span>
                        <Activity size={10} />
                    </div>
                    <p className="truncate font-mono">{JSON.stringify(response.data || response.error || 'No body')}</p>
                </div>
            )}

            {(table.foreignKeys || []).length > 0 && isOpen && (
                <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">İlişkiler (Schema Map)</p>
                    {(table.foreignKeys || []).map((fk: any, i: number) => (
                        <div key={i} className="text-[10px] font-bold text-slate-400 bg-blue-500/5 p-2 rounded-xl">
                            {fk.from} → <span className="text-primary-500">{fk.table}({fk.to})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

