import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@financesarthi/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@financesarthi/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
