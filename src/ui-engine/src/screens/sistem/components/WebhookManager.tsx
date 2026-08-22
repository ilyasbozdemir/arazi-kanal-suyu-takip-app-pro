import React, { useState, useEffect } from 'react';
import { Globe, Eye, EyeOff, Activity } from 'lucide-react';

export const WebhookManager: React.FC = () => {
    const [url, setUrl] = useState('')
    const [secret, setSecret] = useState('')
    const [showSecret, setShowSecret] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [lastResponse, setLastResponse] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const res = await (window as any).api.getSettings()
            if (res.success) {
                if (res.settings.webhook_url) setUrl(res.settings.webhook_url)
                if (res.settings.webhook_secret) setSecret(res.settings.webhook_secret)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        await (window as any).api.updateSetting('webhook_url', url)
        await (window as any).api.updateSetting('webhook_secret', secret)
        if ((window as any).showAlert) {
          (window as any).showAlert('BAŞARILI', 'Ayarlar Kaydedildi.', 'success')
        } else {
          alert('Ayarlar Kaydedildi.');
        }
    }

    const handleTest = async () => {
        setStatus('idle')
        setLastResponse(null)
        const testData = {
            event: 'SYSTEM_TEST',
            table: 'DATA_Test_Tablosu',
            timestamp: new Date().toISOString(),
            payload: {
                id: Math.floor(Math.random() * 1000),
                ornek_alan: 'Bu bir test verisidir.',
                crm_versiyon: '1.0.0-beta',
                test_tipi: 'Full Payload Handshake',
                simule_edilen_olaylar: ['INSERT', 'UPDATE', 'DELETE']
            }
        }
        const res = await (window as any).api.sendWebhook(testData)
        setLastResponse(res)
        setStatus(res.success ? 'success' : 'error')
        setTimeout(() => setStatus('idle'), 3000)
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-500 text-white rounded-3xl"><Globe size={24} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">API & Webhook Entegrasyonu</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Dış Sistem Senkronizasyonu</p>
                </div>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BİLDİRİM URL (Webhook Endpoint)</label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 transition-all font-mono text-sm"
                        placeholder="https://api.domain.com/webhook"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WEBHOOK GİZLİ ANAHTAR (X-Webhook-Secret)</label>
                    <div className="relative">
                        <input
                            type={showSecret ? "text" : "password"}
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 transition-all font-mono text-sm pr-32"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button type="button" onClick={() => setShowSecret(!showSecret)} className="p-2 text-slate-400 hover:text-emerald-500 transition-all">
                                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button onClick={() => setSecret(Math.random().toString(36).substring(2, 12).toUpperCase())} className="p-2 bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl text-[9px] font-black transition-all uppercase">YENİLE</button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSave} className="flex-1 py-4 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl hover:bg-slate-700 transition-all text-xs uppercase tracking-widest">AYARLARI KAYDET</button>
                    <button onClick={handleTest} className={`flex-1 py-4 font-black rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg ${status === 'success' ? 'bg-emerald-500 text-white' : status === 'error' ? 'bg-rose-500 text-white' : 'bg-primary-600 text-white'}`}>
                        {status === 'success' ? 'BAŞARILI!' : status === 'error' ? 'HATA!' : 'BAGLANTI TESTİ'}
                    </button>
                </div>
                {lastResponse && (
                   <div className="p-4 bg-slate-950 rounded-2xl font-mono text-[10px] text-slate-400 border border-slate-800 overflow-x-auto">
                     <div className="flex justify-between items-center mb-2 uppercase text-[8px] font-black text-slate-500">
                        <span>SUNUCU YANITI</span>
                        <Activity size={12} />
                     </div>
                     <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
                   </div>
                )}
            </div>
        </div>
    )
}

