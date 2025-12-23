import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command: _command, mode: _mode }) => {

  const base = '/piotereks/html/parking/'

  console.log('Using base:', base)

  return {
    plugins: [react()],

    base,

    build: {
      emptyOutDir: true,
      outDir: path.resolve(__dirname, 'parking-deploy/docs/html/parking'),
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
      // Preview will automatically use base: '/piotereks/docs/html/parking/'
      // Access at: http://localhost:4173/piotereks/docs/html/parking/
    }
  }
})