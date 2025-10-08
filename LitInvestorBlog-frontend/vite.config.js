// RioCapitalBlog-frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- 1. AGGIUNGI QUESTO IMPORT

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // --- 2. USA QUESTA SINTASSI CORRETTA ---
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
