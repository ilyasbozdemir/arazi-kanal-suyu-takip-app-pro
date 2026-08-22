export interface AppFlagSwitch {
  switch: string;
  value?: string;
}

export const APP_FLAGS = {
  // 🚀 DONANIM HIZLANDIRMA (GPU DESTEĞİ) AKTİF
  disableHardwareAcceleration: false,
  
  commandLineSwitches: [
    { switch: 'ignore-gpu-blocklist' },        // 🛡️ Ekran kartı kısıtlamalarını görmezden gel
    { switch: 'enable-gpu-rasterization' },    // GPU tabanlı çizim desteği
    { switch: 'enable-zero-copy' },            // Performans için bellek kopyalamayı optimize et
    { switch: 'disable-gpu-shader-disk-cache' }, // 🛡️ Windows GPU cache kilit hatasını önle
    { switch: 'js-flags', value: '--max-old-space-size=4096' }, // 🚀 RAM limitini 4GB'a çıkar
    { switch: 'disable-backgrounding-occluded-windows', value: 'false' }
  ] as AppFlagSwitch[],

  // 🛡️ DevTools Kontrolü
  devToolsOnStart: false,
  devToolsShortcut: true
} as const
