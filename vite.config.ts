/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type PluginOption } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/shortype/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [tailwindcss(), process.env.VITEST ? undefined : preact()].filter(
    Boolean,
  ) as PluginOption[],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
  },
})
