import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const isPreview = process.env.PREVIEW === 'true'
  console.log('Command:', command)
  console.log('Command:', command)
  console.log('Mode:', mode)
  console.log('isPreview:', isPreview)
  console.log('isPreview:', isPreview)
  console.log('serve and ispreview', command === 'serve' && isPreview)
  console.log('serve', command === 'serve')
  // let base
  // if (command === 'serve' && isPreview) {
  //   base = '/piotereks/docs/html/parking/'
  // } else if (command === 'serve' && !isPreview) {
  //   base = '/piotereks/html/parking/'
  // } else {
  //   base = '/'
  // }

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