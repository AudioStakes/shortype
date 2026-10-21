import assert from 'node:assert/strict'
import { globSync } from 'node:fs'
import { basename, isAbsolute, matchesGlob, resolve, sep } from 'node:path'
import ts from 'typescript'
import { type InlineConfig, resolveConfig } from 'vitest/node'

import manifest from '../package.json' with { type: 'json' }
import policy from '../quality-policy.json' with { type: 'json' }
import mutationConfig from '../stryker.config.mjs'

type Thresholds = {
  lines: number
  statements: number
  functions: number
  branches: number
}
type QualityPolicy = {
  sources: string[]
  coverage: {
    global: Thresholds
    perFile: Thresholds
    critical: Record<string, Thresholds>
  }
  mutation: { targets: string[]; global: number }
}
type TestConfig = Pick<
  InlineConfig,
  | 'allowOnly'
  | 'passWithNoTests'
  | 'retry'
  | 'expect'
  | 'coverage'
  | 'dangerouslyIgnoreUnhandledErrors'
  | 'onUnhandledError'
>
type MutationConfig = {
  mutate?: string[]
  excludedMutations?: string[]
  ignorePatterns?: string[]
  incremental?: boolean
  allowEmpty?: boolean
  thresholds?: { break?: number }
}

const typeProjects = [
  'tsconfig.json',
  'tsconfig.node.json',
  'tsconfig.test.json',
  'tsconfig.e2e.json',
]
const executableExtensions = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
]
const declarationExcludes = new Set([
  '**/*.d.ts',
  '**/*.d.mts',
  '**/*.d.cts',
  '**/*.d.{ts,mts,cts}',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === 'string')
  )
}

function record(value: unknown, label: string) {
  assert.ok(isRecord(value), `${label} must be an object`)
  return value
}

function checkFloors(value: unknown, floors: Thresholds, label: string) {
  const thresholds = record(value, label)
  for (const [metric, floor] of Object.entries(floors)) {
    const actual = thresholds[metric]
    assert.ok(
      typeof actual === 'number' && Number.isFinite(actual) && actual >= floor,
      `${label}.${metric} must be at least ${floor}`,
    )
  }
}

export function checkCoverageConfig(
  config: TestConfig,
  files: readonly string[],
  expected: QualityPolicy,
  root = process.cwd(),
  configuredExcludes = config.coverage?.exclude ?? [],
) {
  assert.equal(config.allowOnly, false, 'Vitest allowOnly must be false')
  assert.equal(
    config.passWithNoTests,
    false,
    'Vitest passWithNoTests must be false',
  )
  assert.equal(config.retry, 0, 'Vitest retry must be zero')
  assert.notEqual(
    config.dangerouslyIgnoreUnhandledErrors,
    true,
    'Vitest must report unhandled errors',
  )
  assert.equal(
    config.onUnhandledError,
    undefined,
    'Vitest must not filter unhandled errors',
  )
  assert.equal(
    config.expect?.requireAssertions,
    true,
    'Vitest must require assertions',
  )
  const coverage = config.coverage
  assert.ok(coverage, 'Vitest coverage configuration is required')
  assert.equal(coverage.provider, 'v8', 'Coverage provider must be v8')
  const includes = coverage.include
  assert.ok(includes?.length, 'Coverage include patterns are required')
  assert.ok(
    includes.every(isAbsolute),
    'Coverage includes must be absolute project patterns',
  )
  assert.ok(
    includes.every((pattern) =>
      expected.sources.some((source) =>
        pattern.startsWith(`${resolve(root, source)}${sep}`),
      ),
    ),
    'Coverage includes must stay within canonical source directories',
  )
  assert.ok(
    includes.every((pattern) => !pattern.startsWith('!')),
    'Coverage includes must not contain exclusions',
  )
  assert.ok(
    configuredExcludes.every((pattern) => declarationExcludes.has(pattern)),
    'Coverage exclusions must only exclude declarations',
  )
  const thresholds = record(coverage.thresholds, 'Coverage thresholds')
  assert.ok(
    !thresholds['autoUpdate'],
    'Coverage thresholds must not auto-update',
  )
  checkFloors(thresholds, expected.coverage.global, 'coverage.global')
  const isExcluded = (file: string) =>
    coverage.exclude?.some(
      (pattern) =>
        matchesGlob(file, pattern) ||
        matchesGlob(resolve(root, file), pattern) ||
        (!isAbsolute(pattern) && matchesGlob(file, `**/${pattern}`)),
    ) ?? false

  for (const source of expected.sources) {
    for (const extension of executableExtensions) {
      for (const path of [
        `${source}/future.${extension}`,
        `${source}/nested/future.${extension}`,
      ]) {
        assert.ok(
          includes.some((pattern) => matchesGlob(resolve(root, path), pattern)),
          `Coverage omits future executable: ${path}`,
        )
        assert.ok(
          !isExcluded(path),
          `Coverage excludes future executable: ${path}`,
        )
      }
    }
  }
  for (const file of files) {
    assert.ok(
      includes.some((pattern) => matchesGlob(resolve(root, file), pattern)),
      `Coverage omits executable: ${file}`,
    )
    assert.ok(!isExcluded(file), `Coverage excludes executable: ${file}`)
    checkFloors(
      thresholds[file],
      expected.coverage.critical[file] ?? expected.coverage.perFile,
      `coverage.${file}`,
    )
  }
}

export function checkMutationConfig(
  config: MutationConfig,
  expected: QualityPolicy,
) {
  assert.deepEqual(
    new Set(config.mutate),
    new Set(expected.mutation.targets),
    'Mutation must cover every complete policy target without exclusions or ranges',
  )
  assert.equal(
    config.excludedMutations?.length ?? 0,
    0,
    'Mutation exclusions are forbidden',
  )
  assert.equal(
    config.ignorePatterns?.length ?? 0,
    0,
    'Mutation ignore patterns are forbidden',
  )
  assert.equal(
    config.incremental,
    false,
    'Mutation incremental mode is forbidden',
  )
  assert.equal(config.allowEmpty, false, 'Mutation allowEmpty must be false')
  assert.ok(
    typeof config.thresholds?.break === 'number' &&
      config.thresholds.break >= expected.mutation.global,
    'Mutation break threshold must meet policy',
  )
}

export function checkCompilerOptions(
  projects: Record<string, ts.CompilerOptions>,
) {
  const strictOptions = [
    'alwaysStrict',
    'noImplicitAny',
    'noImplicitThis',
    'strictNullChecks',
    'strictFunctionTypes',
    'strictBindCallApply',
    'strictPropertyInitialization',
    'strictBuiltinIteratorReturn',
    'useUnknownInCatchVariables',
  ] as const
  const requiredOptions = [
    'strict',
    'noEmit',
    'allowJs',
    'checkJs',
    'exactOptionalPropertyTypes',
    'noUncheckedIndexedAccess',
    'noImplicitReturns',
    'noFallthroughCasesInSwitch',
    'noUnusedLocals',
    'noUnusedParameters',
    'noPropertyAccessFromIndexSignature',
    'noImplicitOverride',
    'verbatimModuleSyntax',
    'isolatedModules',
    'noUncheckedSideEffectImports',
    'forceConsistentCasingInFileNames',
  ] as const
  for (const name of typeProjects) {
    const options = projects[name]
    assert.ok(options, `Missing TypeScript project: ${name}`)
    for (const option of requiredOptions) {
      assert.equal(options[option], true, `${name}.${option} must be true`)
    }
    for (const option of strictOptions) {
      assert.equal(
        options[option] ?? options.strict,
        true,
        `${name}.${option} must be true`,
      )
    }
    for (const option of [
      'skipLibCheck',
      'allowUnreachableCode',
      'allowUnusedLabels',
    ] as const) {
      assert.equal(options[option], false, `${name}.${option} must be false`)
    }
  }
  assert.deepEqual(
    projects['tsconfig.json']?.types,
    ['vite/client'],
    'Browser ambient types must remain isolated',
  )
}

export function readCompilerOptions(root: string) {
  return Object.fromEntries(
    typeProjects.map((name) => {
      const path = resolve(root, name)
      const config = ts.readConfigFile(path, (file) => ts.sys.readFile(file))
      assert.ok(!config.error, `Cannot read TypeScript project: ${name}`)
      const parsed = ts.parseJsonConfigFileContent(
        config.config,
        ts.sys,
        root,
        undefined,
        path,
      )
      assert.equal(
        parsed.errors.length,
        0,
        `Invalid TypeScript project: ${name}`,
      )
      return [name, parsed.options]
    }),
  )
}

export function checkGateCommands(scripts: Record<string, string>) {
  const commands = {
    'check:runtime': 'node scripts/check-runtime.mjs',
    'check:policy':
      'node scripts/check-quality-policy.mjs && tsx scripts/check-effective-quality.ts',
    'test:gates':
      'vitest run test/quality-gates.test.ts && node scripts/check-test-results.mjs',
    'check:workflow': 'node scripts/check-workflows.mjs',
    'format:check': 'biome format . --error-on-warnings',
    lint: 'biome lint . --error-on-warnings && eslint . --max-warnings=0',
    typecheck: `${typeProjects.map((name) => `tsc -p ${name}`).join(' && ')} && npm run check:inventory`,
    'check:inventory': 'tsx scripts/check-type-coverage.ts',
    knip: 'knip --treat-config-hints-as-errors',
    'test:coverage':
      'vitest run --coverage && node scripts/check-test-results.mjs',
    'test:shuffle:1':
      'vitest run --sequence.shuffle --sequence.seed=1 && node scripts/check-test-results.mjs',
    'test:shuffle:42':
      'vitest run --sequence.shuffle --sequence.seed=42 && node scripts/check-test-results.mjs',
    build: 'vite build',
    'test:e2e': 'playwright test',
    'test:mutation': 'stryker run && node scripts/check-mutation-results.mjs',
    audit: 'npm audit --include=dev --audit-level=low',
    validate: 'node scripts/run-validation.mjs',
  }
  for (const [name, command] of Object.entries(commands)) {
    assert.deepEqual(
      scripts[name]?.trim().split(/\s+/),
      command.split(/\s+/),
      `Gate command changed: ${name}`,
    )
  }
}

export async function runEffectiveQuality(root = process.cwd()) {
  const { vitestConfig, viteConfig } = await resolveConfig({
    root,
    config: resolve(root, 'vite.config.ts'),
  })
  const configuredTest = record(
    record(viteConfig, 'Resolved Vite configuration')['test'],
    'Vite test configuration',
  )
  const configuredCoverage = record(
    configuredTest['coverage'],
    'Vite coverage configuration',
  )
  const configuredExcludes = configuredCoverage['exclude']
  assert.ok(
    configuredExcludes === undefined || isStringArray(configuredExcludes),
    'Vite coverage exclusions must be strings',
  )
  const files = [
    ...globSync(
      policy.sources.map((source) => `${source}/**/*`),
      { cwd: root },
    ),
  ]
    .map((file) => file.replaceAll('\\', '/'))
    .filter(
      (file) => /\.[cm]?[jt]sx?$/.test(file) && !/\.d\.[cm]?ts$/.test(file),
    )
  checkCoverageConfig(
    vitestConfig,
    files,
    policy,
    root,
    configuredExcludes ?? [],
  )
  checkMutationConfig(mutationConfig, policy)
  checkCompilerOptions(readCompilerOptions(root))
  checkGateCommands(manifest.scripts)
  return `Effective quality verified for ${files.length} executables and ${typeProjects.length} TypeScript projects.\n`
}

if (basename(process.argv[1] ?? '') === 'check-effective-quality.ts') {
  process.stdout.write(await runEffectiveQuality())
}
