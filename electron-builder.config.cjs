/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.gkurumsi.arazi-su-takibi',
  npmRebuild: true,
  productName: 'Kurum Başkanlığı Arazi Su Takip Programı',
  directories: {
    output: 'dist-release',
    buildResources: 'resources'
  },
  files: [
    'electronjs-out/**/*',
    'resources/**/*',
    '!node_modules/.cache',
    '!node_modules/.vite'
  ],
  extraResources: [
    {
      from: 'resources/logo.png',
      to: 'logo.png'
    },
    {
      from: 'resources/excel/excel_advanced_mapping.json',
      to: 'excel_advanced_mapping.json'
    }
  ],
  asar: true,
  asarUnpack: [
    '**/node_modules/better-sqlite3/**',
    '**/node_modules/bindings/**',
    '**/node_modules/file-uri-to-path/**',
    '**/node_modules/prebuild-install/**'
  ],
  win: {
    icon: 'logo.png',
    executableName: 'arazi-su-takibi',
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: false,
    createDesktopShortcut: true,
    guid: 'A8B9C0D3-E2F3-4G5H-6I7J-8K9L0M1N2O3P',
    shortcutName: 'Kurum Başkanlığı Arazi Su Takibi',
    artifactName: `Kurum-Baskanligi-Arazi-Su-Takibi-\${version}-\${arch}.exe`
  }
};
