// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Qualsiasi richiesta che inizia con /api...
      '/api': {
        target: 'http://localhost:5000', // ...mandala a Flask sulla porta 5000
        changeOrigin: true,
        secure: false,
      },
      // Qualsiasi richiesta che inizia con /apiauth...
      '/apiauth': {
        target: 'http://localhost:5000', // ...mandala SEMPRE a Flask sulla porta 5000
        changeOrigin: true,
        secure: false,
      }
    }
  }
})