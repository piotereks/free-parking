import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      zustand: path.resolve(__dirname, 'node_modules/zustand')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true,
    coverage: {
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: ['node_modules/', 'test/'],
    },
    // exclude: ['src/test/**'],
  },
});
