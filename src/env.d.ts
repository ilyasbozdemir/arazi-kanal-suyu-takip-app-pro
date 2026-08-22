/// <reference types="vite/client" />
/// <reference types="electron-vite/node" />

interface Window {
  api: {
    windowControls: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
    }
    [key: string]: any
  }
}

declare module '*?asset' {
  const content: string
  export default content
}

