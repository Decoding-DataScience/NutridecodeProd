import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    modulePreload: {
      polyfill: true,
    },
  },
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/javascript',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});