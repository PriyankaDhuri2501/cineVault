import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy only for local development (not in production)
    proxy: mode === 'development' ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
  },
  // Production build configuration
  build: {
    // Ensure no localhost references in production
    rollupOptions: {
      output: {
        // Prevent exposing internal paths
        sanitizeFileName: true,
      },
    },
    // Ensure environment variables are properly replaced
    define: {
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
    },
  },
  // Explicitly disable features that might trigger network permissions
  preview: {
    port: 4173,
    strictPort: true,
  },
}))

