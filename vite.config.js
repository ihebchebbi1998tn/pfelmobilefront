import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lottie } from 'vite-plugin-lottie';

export default defineConfig({
  plugins: [
    react(),
    lottie(),
  ],
  assetsInclude: ['**/*.lottie'],
});
