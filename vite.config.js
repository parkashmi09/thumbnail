import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Optional: Agar koi aur module resolve issues aaye
    },
  },
  optimizeDeps: {
    include: ['ag-psd'],
  },
  server: {
    proxy: {
      // Proxy for API requests
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy for static files (JSON, PNG)
      '/templates': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});