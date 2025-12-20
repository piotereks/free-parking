import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

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
  }
})
