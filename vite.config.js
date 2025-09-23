import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lottie } from 'vite-plugin-lottie';
import { componentTagger } from "lovable-tagger";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    lottie(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  assetsInclude: ['**/*.lottie'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
