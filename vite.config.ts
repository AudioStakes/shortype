/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vitest/config'

const criticalCoverage = {
  lines: 95,
  statements: 95,
  functions: 100,
  branches: 95,
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  appType: 'mpa',
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [UnoCSS(), process.env['VITEST'] ? undefined : preact()].filter(
    Boolean,
  ) as PluginOption[],
  test: {
    include: ['test/**/*.test.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    allowOnly: false,
    passWithNoTests: false,
    dangerouslyIgnoreUnhandledErrors: false,
    retry: 0,
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    expect: { requireAssertions: true },
    reporters: ['default', 'json'],
    outputFile: { json: 'reports/vitest.json' },
    coverage: {
      provider: 'v8',
      include: [
        fileURLToPath(
          new URL(
            './src/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}',
            import.meta.url,
          ),
        ),
        fileURLToPath(
          new URL(
            './data/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}',
            import.meta.url,
          ),
        ),
      ],
      exclude: ['**/*.d.{ts,mts,cts}', '**/*.json'],
      excludeAfterRemap: true,
      reporter: ['text', 'html', 'json', 'json-summary'],
      reportOnFailure: true,
      thresholds: {
        perFile: true,
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 90,
        'src/utils/local-storage-core.ts': criticalCoverage,
        'src/utils/weighted-sample.ts': criticalCoverage,
        'src/models/key-combination.ts': criticalCoverage,
        'src/models/key-combinations.ts': criticalCoverage,
        'src/models/shortcut-training-session-status.ts': criticalCoverage,
        'data/parse-csv.ts': criticalCoverage,
      },
    },
  },
})
