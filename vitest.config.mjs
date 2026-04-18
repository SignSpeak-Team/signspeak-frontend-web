import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['e2e/**']
  }
})
