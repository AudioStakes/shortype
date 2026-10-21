/// <reference types="vitest" />

import { globSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import preact from '@preact/preset-vite'
import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vitest/config'
import policy from './quality-policy.json' with { type: 'json' }

const sourceFilePatterns = policy.sources.map(
  (source) => `${source}/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}`,
)
// Vitest matches globs inside absolute paths, so anchor the covered sources.
const coverageFiles = sourceFilePatterns.map((pattern) =>
  fileURLToPath(new URL(pattern, import.meta.url)),
)
const criticalThresholds: Record<string, typeof policy.coverage.perFile> =
  policy.coverage.critical

const fileThresholds = Object.fromEntries(
  [...globSync(sourceFilePatterns)]
    .filter((file) => !/\.d\.[cm]?ts$/.test(file))
    .map((file) => [file, criticalThresholds[file] ?? policy.coverage.perFile]),
)

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [UnoCSS(), process.env['VITEST'] ? undefined : preact()].filter(
    Boolean,
  ) as PluginOption[],
  test: {
    include: ['test/**/*.test.{ts,tsx,js,mjs}'],
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    allowOnly: false,
    passWithNoTests: false,
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
      include: coverageFiles,
      exclude: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
      excludeAfterRemap: true,
      reporter: ['text', 'html', 'json', 'json-summary'],
      reportOnFailure: true,
      thresholds: {
        ...policy.coverage.global,
        ...fileThresholds,
      },
    },
  },
})
