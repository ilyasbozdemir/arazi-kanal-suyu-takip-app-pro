import { BrowserWindowConstructorOptions } from 'electron'
import { join } from 'path'

export const WINDOW_CONFIG: BrowserWindowConstructorOptions = {
  width: 1280,
  height: 800,
  minWidth: 1024,
  minHeight: 600,
  show: false,
  autoHideMenuBar: true,
  frame: false,
  backgroundColor: '#ffffff',
  webPreferences: {
    // Note: __dirname is the output directory (electronjs-out/main)
    preload: join(__dirname, '../preload/index.mjs'),
    sandbox: false,
    contextIsolation: true,
    webgl: false,
    spellcheck: false,
    nodeIntegration: false,     // zaten default false ama explicit olsun
    devTools: true,             // production build'de false yapabilirsin
  }
}
