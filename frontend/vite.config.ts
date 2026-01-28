import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
