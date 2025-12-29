import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command: _command, mode: _mode }) => {

  // Allow overriding base path via env like the main config
  const base = process.env.VITE_BASE_PATH || '/free-parking/'

  console.log('Using base:', base)

  // Build output path: compute relative to this config file (which lives in `web/`)
  // This resolves to <repo-root>/parking-deploy/docs/html/parking
  const outDir = path.resolve(__dirname, '..', 'parking-deploy', 'docs', 'html', 'parking')

  return {
    plugins: [react()],

    // Ensure single React instance
    resolve: {
      dedupe: ['react', 'react-dom']
    },

    base,

    build: {
      emptyOutDir: true,
      outDir,
      chunkSizeWarningLimit: 2000,
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
