import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ command: _command, mode: _mode }) => {

  // Allow overriding base path via env like the main config
  const base = process.env.VITE_BASE_PATH || '/free-parking/'

  console.log('Using base:', base)

  // Build output path: compute relative to this config file (which lives in `web/`)
  // This resolves to <repo-root>/parking-deploy/docs/html/parking
  const outDir = path.resolve(__dirname, '..', 'parking-deploy', 'docs', 'html', 'parking')

  return {
    plugins: [react()],

    // Ensure single React instance and prefer workspace zustand
    // Resolve `free-parking` to built `dist` when available, otherwise use `src` for dev.
    resolve: (() => {
      const sharedDist = path.resolve(__dirname, '..', 'shared', 'dist', 'index.js')
      const sharedSrc = path.resolve(__dirname, '..', 'shared', 'src', 'index.js')
      const entry = fs.existsSync(sharedDist) ? sharedDist : sharedSrc
      return {
        alias: {
          'free-parking': entry
        },
        dedupe: ['react', 'react-dom', 'zustand']
      }
    })(),

    // Ensure vite pre-bundles zustand so imports from shared/src resolve
    optimizeDeps: {
      include: ['zustand']
    },

    base,

    build: {
      emptyOutDir: true,
      outDir,
      chunkSizeWarningLimit: 2000,
      // Allow CommonJS resolution for files inside shared source during dev/build
      commonjsOptions: {
        include: [/node_modules/, /shared/]
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-echarts': ['echarts', 'echarts-for-react'],
            'vendor-react': ['react', 'react-dom'],
            'vendor-utils': ['papaparse', 'lucide-react']
          }
        }
      }
    },

    preview: {
      port: 4173
      // Preview will automatically use base: '/free-parking/'
      // Access at: http://localhost:4173/free-parking/
    }
  }
})
