import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'

import manifest from '../package.json' with { type: 'json' }
import {
  checkCompilerOptions,
  checkCoverageConfig,
  checkGateCommands,
  checkMutationConfig,
  readCompilerOptions,
  runEffectiveQuality,
} from '../scripts/check-effective-quality'

const root = process.cwd()
const criticalFile = 'src/critical.ts'
const ordinaryFile = 'scripts/check.mjs'
const files = [criticalFile, ordinaryFile]
const expected: Parameters<typeof checkCoverageConfig>[2] = {
  sources: ['src', 'data', 'scripts'],
  coverage: {
    global: { lines: 95, statements: 95, functions: 95, branches: 90 },
    perFile: { lines: 90, statements: 90, functions: 90, branches: 85 },
    critical: {
      [criticalFile]: {
        lines: 95,
        statements: 95,
        functions: 100,
        branches: 95,
      },
    },
  },
  mutation: { targets: [criticalFile], global: 90 },
}
const temporaryRoots: string[] = []

afterEach(() => {
  for (const temporary of temporaryRoots.splice(0)) {
    rmSync(temporary, { recursive: true, force: true })
  }
})

function thresholds() {
  return {
    ...expected.coverage.global,
    [criticalFile]: expected.coverage.critical[criticalFile],
    [ordinaryFile]: expected.coverage.perFile,
  }
}

function coverageConfig(): Parameters<typeof checkCoverageConfig>[0] & {
  coverage: NonNullable<Parameters<typeof checkCoverageConfig>[0]['coverage']>
} {
  return {
    allowOnly: false,
    passWithNoTests: false,
    retry: 0,
    expect: { requireAssertions: true },
    coverage: {
      provider: 'v8',
      include: expected.sources.map((source) =>
        resolve(root, `${source}/**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}`),
      ),
      exclude: ['**/*.d.ts'],
      thresholds: thresholds(),
    },
  }
}

function mutationConfig(): Parameters<typeof checkMutationConfig>[0] {
  return {
    mutate: [...expected.mutation.targets],
    incremental: false,
    allowEmpty: false,
    thresholds: { break: 90 },
  }
}

test('accepts effective coverage for every current and future executable', () => {
  expect(() =>
    checkCoverageConfig(coverageConfig(), files, expected, root),
  ).not.toThrow()
})

test.each([
  ['allowOnly', true],
  ['passWithNoTests', true],
  ['retry', 1],
  ['dangerouslyIgnoreUnhandledErrors', true],
] as const)('rejects weaker Vitest option %s', (option, value) => {
  const config = coverageConfig()
  Reflect.set(config, option, value)
  expect(() => checkCoverageConfig(config, files, expected)).toThrow()
})

test('rejects disabled assertion requirements and absent coverage', () => {
  const config = coverageConfig()
  delete config.expect
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'require assertions',
  )
  const missing: Parameters<typeof checkCoverageConfig>[0] = coverageConfig()
  delete missing.coverage
  expect(() => checkCoverageConfig(missing, files, expected)).toThrow(
    'coverage configuration',
  )
})

test('rejects a different coverage provider and missing includes', () => {
  const config = coverageConfig()
  config.coverage.provider = 'istanbul'
  expect(() => checkCoverageConfig(config, files, expected)).toThrow('provider')
  config.coverage.provider = 'v8'
  delete config.coverage.include
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'include patterns',
  )
})

test('rejects a filter that suppresses unhandled errors', () => {
  const config = coverageConfig()
  config.onUnhandledError = () => false
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'filter unhandled errors',
  )
})

test.each([
  ['src/**/*.ts'],
  [resolve(root, '**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}')],
  [resolve(root, 'src/**/*.ts'), '!src/critical.ts'],
])('rejects unanchored, out-of-scope or negated coverage patterns: %j', (...include) => {
  const config = coverageConfig()
  config.coverage.include = include
  expect(() => checkCoverageConfig(config, files, expected)).toThrow()
})

test('rejects an explicit source exclusion', () => {
  const config = coverageConfig()
  config.coverage.exclude = ['**/src/critical.ts']
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'exclusions',
  )
})

test('allows automatic exclusions outside sources but rejects effective source omissions', () => {
  const config = coverageConfig()
  config.coverage.exclude = ['test/setup.ts', '**/node_modules/**']
  expect(() =>
    checkCoverageConfig(config, files, expected, root, []),
  ).not.toThrow()
  config.coverage.exclude = [criticalFile]
  expect(() => checkCoverageConfig(config, files, expected, root, [])).toThrow(
    'excludes executable',
  )
  config.coverage.exclude = [resolve(root, criticalFile)]
  expect(() => checkCoverageConfig(config, files, expected, root, [])).toThrow(
    'excludes executable',
  )
  config.coverage.exclude = ['src/future.js']
  expect(() => checkCoverageConfig(config, files, expected, root, [])).toThrow(
    'excludes future executable',
  )
  delete config.coverage.exclude
  expect(() =>
    checkCoverageConfig(config, files, expected, root, []),
  ).not.toThrow()
})

test('rejects narrowed future extensions and an omitted current executable', () => {
  const config = coverageConfig()
  config.coverage.include = expected.sources.map((source) =>
    resolve(root, `${source}/**/*.{ts,tsx}`),
  )
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'future executable',
  )
  expect(() =>
    checkCoverageConfig(coverageConfig(), ['outside.ts'], expected),
  ).toThrow('omits executable')
})

test.each(
  [undefined, null, [], 42].map((value) => ({ value })),
)('rejects malformed threshold objects: %j', ({ value }) => {
  const config = coverageConfig()
  Reflect.set(config.coverage, 'thresholds', value)
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'must be an object',
  )
})

test.each([
  'wrong',
  Number.NaN,
  Number.POSITIVE_INFINITY,
  94,
])('rejects invalid or lowered global floors: %s', (value) => {
  const config = coverageConfig()
  assert.ok(config.coverage.thresholds)
  Reflect.set(config.coverage.thresholds, 'lines', value)
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'global.lines',
  )
})

test('rejects automatic threshold changes and lower file floors', () => {
  const config = coverageConfig()
  config.coverage.thresholds = { ...thresholds(), autoUpdate: true }
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    'auto-update',
  )
  config.coverage.thresholds = {
    ...thresholds(),
    [ordinaryFile]: { ...expected.coverage.perFile, branches: 84 },
  }
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    `${ordinaryFile}.branches`,
  )
  config.coverage.thresholds = {
    ...thresholds(),
    [criticalFile]: expected.coverage.perFile,
  }
  expect(() => checkCoverageConfig(config, files, expected)).toThrow(
    `coverage.${criticalFile}`,
  )
})

test('accepts complete nonincremental mutation configuration', () => {
  expect(() => checkMutationConfig(mutationConfig(), expected)).not.toThrow()
  expect(() =>
    checkMutationConfig(
      { ...mutationConfig(), excludedMutations: [], ignorePatterns: [] },
      expected,
    ),
  ).not.toThrow()
})

test.each([
  { mutate: [] },
  { mutate: [`${criticalFile}:1:2`] },
  { mutate: [criticalFile, `!${criticalFile}`] },
  { incremental: true },
  { allowEmpty: true },
  { excludedMutations: ['BooleanLiteral'] },
  { ignorePatterns: ['src/**'] },
  { thresholds: { break: 89 } },
  { thresholds: {} },
])('rejects weaker mutation configuration: %j', (change) => {
  expect(() =>
    checkMutationConfig({ ...mutationConfig(), ...change }, expected),
  ).toThrow()
})

test('accepts effective compiler inheritance and explicit strict subflags', () => {
  const projects = readCompilerOptions(root)
  expect(() => checkCompilerOptions(projects)).not.toThrow()
  const browser = projects['tsconfig.json']
  assert.ok(browser)
  browser.noImplicitAny = true
  expect(() => checkCompilerOptions(projects)).not.toThrow()
})

test.each([
  'strict',
  'noEmit',
  'allowJs',
  'checkJs',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noImplicitAny',
])('rejects a lowered effective TypeScript flag: %s', (flag) => {
  const projects = readCompilerOptions(root)
  const browser = projects['tsconfig.json']
  assert.ok(browser)
  Reflect.set(browser, flag, false)
  expect(() => checkCompilerOptions(projects)).toThrow(flag)
})

test.each([
  'skipLibCheck',
  'allowUnreachableCode',
  'allowUnusedLabels',
])('rejects a loosened false TypeScript flag: %s', (flag) => {
  const projects = readCompilerOptions(root)
  const node = projects['tsconfig.node.json']
  assert.ok(node)
  Reflect.set(node, flag, true)
  expect(() => checkCompilerOptions(projects)).toThrow(flag)
})

test('rejects missing projects and browser ambient type additions', () => {
  const projects = readCompilerOptions(root)
  const browser = projects['tsconfig.json']
  assert.ok(browser)
  browser.types = ['vite/client', 'node']
  expect(() => checkCompilerOptions(projects)).toThrow('ambient types')
  delete projects['tsconfig.json']
  expect(() => checkCompilerOptions(projects)).toThrow(
    'Missing TypeScript project',
  )
})

test('reports missing and malformed TypeScript configuration', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'shortype-effective-quality-'))
  temporaryRoots.push(temporary)
  expect(() => readCompilerOptions(temporary)).toThrow(
    'Cannot read TypeScript project',
  )
  mkdirSync(join(temporary, 'src'))
  writeFileSync(join(temporary, 'src', 'main.ts'), '')
  writeFileSync(
    join(temporary, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { strict: 'invalid' },
      include: ['src/**/*'],
    }),
  )
  expect(() => readCompilerOptions(temporary)).toThrow(
    'Invalid TypeScript project',
  )
})

test('accepts the canonical command chain and rejects no-op replacements', () => {
  expect(() => checkGateCommands(manifest.scripts)).not.toThrow()
  expect(() =>
    checkGateCommands({ ...manifest.scripts, 'test:coverage': 'echo bypass' }),
  ).toThrow('test:coverage')
  expect(() =>
    checkGateCommands({
      ...manifest.scripts,
      'test:mutation': `${manifest.scripts['test:mutation']} || true`,
    }),
  ).toThrow('test:mutation')
})

test('rejects missing gate commands', () => {
  const scripts: Record<string, string> = { ...manifest.scripts }
  delete scripts['check:runtime']
  expect(() => checkGateCommands(scripts)).toThrow('check:runtime')
})

test('checks actual resolved project configuration', async () => {
  expect(await runEffectiveQuality(root)).toMatch(
    /Effective quality verified for \d+ executables and 4 TypeScript projects/,
  )
})

test('runs the CLI and remains silent without an entry argument', async () => {
  const previous = process.argv
  const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  try {
    process.argv = ['node', resolve(root, 'scripts/check-effective-quality.ts')]
    vi.resetModules()
    await import('../scripts/check-effective-quality')
    expect(stdout).toHaveBeenCalledWith(
      expect.stringContaining('Effective quality verified'),
    )
    stdout.mockClear()
    process.argv = ['node']
    vi.resetModules()
    await import('../scripts/check-effective-quality')
    expect(stdout).not.toHaveBeenCalled()
  } finally {
    stdout.mockRestore()
    process.argv = previous
  }
})
