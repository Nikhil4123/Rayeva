import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':   ['framer-motion'],
          'vendor-charts':   ['recharts'],
          'vendor-ui':       ['lucide-react', 'clsx', 'react-countup'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/support': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
