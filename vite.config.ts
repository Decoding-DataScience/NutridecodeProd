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
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ai': ['openai'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    modulePreload: {
      polyfill: true,
    },
    cssCodeSplit: true,
    sourcemap: true,
    chunkSizeWarningLimit: 800,
    minify: 'esbuild',
    target: 'esnext',
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