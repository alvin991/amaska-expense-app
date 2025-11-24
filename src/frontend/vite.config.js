import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/amaska-app/',
  server: {
    host: '0.0.0.0',
    port: 5173,           // dev port
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // backend dev port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})