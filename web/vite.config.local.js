import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command: _command, mode: _mode }) => {

  const base = '/free-parking/'

  console.log('Using base:', base)

  return {
    plugins: [react()],

    // Ensure single React instance and avoid pulling deps from shared/node_modules
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        zustand: path.resolve(__dirname, 'node_modules/zustand')
      }
    },

    base,

    build: {
      emptyOutDir: true,
      outDir: path.resolve(__dirname, '../parking-deploy/docs/html/parking'),
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
