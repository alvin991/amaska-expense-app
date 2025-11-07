import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // rewrite optional; keep the same path here
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    // optional helpers:
    // strictPort: true,
    // cors: true,
  },
})