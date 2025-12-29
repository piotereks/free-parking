import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ command: _command, mode: _mode }) => {

  // Support dynamic base path from environment variable (used in branch-specific deployments)
  // Falls back to default for main branch deployment
  const base = process.env.VITE_BASE_PATH || '/piotereks/html/parking/'

  console.log('Using base:', base)

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
      // Emit build output into repo root to keep gh-pages path unchanged
      outDir: path.resolve(__dirname, '../parking-deploy/docs/html/parking'),
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
      // Preview will automatically use base: '/piotereks/docs/html/parking/'
      // Access at: http://localhost:4173/piotereks/docs/html/parking/
    }
  }
})