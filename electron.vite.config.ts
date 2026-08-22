import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      outDir: 'electronjs-out/main'
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@turf/turf', 'exceljs', 'jszip']
      })
    ],
    resolve: {
      alias: {
        '@infrastructure': resolve(__dirname, 'src/main/infrastructure'),
        '@core': resolve(__dirname, 'src/main/core'),
        '@application': resolve(__dirname, 'src/main/application'),
        '@domain': resolve(__dirname, 'src/main/domain'),
      }
    },
    server: {
      watch: {
        ignored: [
          '**/data/**',
          '**/*.db*',
          '**/*.log',
          resolve(__dirname, 'data')
        ]
      }
    }
  },
  preload: {
    build: {
      outDir: 'electronjs-out/preload'
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@turf/turf', 'exceljs', 'jszip']
      })
    ]
  },
  renderer: {
    root: resolve(__dirname, 'src/ui-engine'),
    build: {
      outDir: 'electronjs-out/ui-engine',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/ui-engine/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/ui-engine/src')
      }
    },
    plugins: [react()],
    server: {
      watch: {
        ignored: [
          '**/data/**',
          '**/*.db*',
          '**/*.log',
          resolve(__dirname, 'data')
        ]
      }
    }
  }
})