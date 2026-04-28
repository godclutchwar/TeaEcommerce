import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * PURPOSE: Vite configuration for the React frontend.
 *
 * WHAT IT DOES:
 * - @vitejs/plugin-react enables Fast Refresh (hot module replacement for React).
 *   When you edit a component, only that component re-renders — no full page reload.
 * - server.proxy forwards API requests to Spring Boot during development.
 *   When React code requests /api/**, Vite proxies it to localhost:8080.
 *   This bypasses CORS entirely during dev — the browser thinks everything is on localhost:5173.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
