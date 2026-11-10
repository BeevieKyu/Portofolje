import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(
      {
      babel: {
        // Only use react-compiler in non-test environments
        plugins: [['babel-plugin-react-compiler']],
      },
    }
  ),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTest.js',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:2169',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:2169',
        changeOrigin: true,
      },
    },
  },
})
