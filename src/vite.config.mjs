import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',  // Use current dir as root
  build: {
    outDir: 'dist'  // Output build to /dist (update your Dockerfile accordingly)
  }
});