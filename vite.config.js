import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    manifest: true, // Génère un manifest.json pour le tracking des assets
  },
  server: {
    headers: {
      'Content-Type': 'application/javascript',
    },
  },
});