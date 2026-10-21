import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { expect, test } from 'vitest'

function expectLint(source: string, filePath: string, ruleId?: string) {
  const directory = mkdtempSync(join(dirname(filePath), 'shortype-eslint-'))
  const file = join(directory, basename(filePath))

  try {
    // Single-run typed lint reads project files from disk, not stdin overlays.
    writeFileSync(file, source)
    const result = spawnSync(
      process.execPath,
      [
        'node_modules/eslint/bin/eslint.js',
        file,
        '--format=json',
        '--max-warnings=0',
      ],
      { encoding: 'utf8', timeout: 15_000 },
    )

    expect(result.error).toBeUndefined()
    expect(result.status, result.stderr).toBe(ruleId ? 1 : 0)
    const report: unknown = JSON.parse(result.stdout)
    const messages: unknown = ruleId
      ? expect.arrayContaining([expect.objectContaining({ ruleId })])
      : []
    expect(report).toEqual([expect.objectContaining({ messages })])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('typed lint rejects lost promises and accepts awaited promises', () => {
  expectLint(
    'Promise.resolve(1)',
    'src/utils/probe.ts',
    '@typescript-eslint/no-floating-promises',
  )
  expectLint('await Promise.resolve(1)', 'src/utils/probe.ts')
  expectLint(
    'void Promise.reject(new Error("lost"))',
    'src/utils/probe.ts',
    '@typescript-eslint/no-floating-promises',
  )
  expectLint(
    'Promise.reject(new Error("handled")).catch(() => undefined)',
    'src/utils/probe.ts',
  )
}, 30_000)

test('rejects todo, conditional, and expected-failure tests, including chained and computed calls', () => {
  for (const selection of [
    'todo',
    'skipIf(true)',
    'runIf(true)',
    'fails',
    'fails.each([1])',
    '["fails"]',
  ]) {
    const separator = selection.startsWith('[') ? '' : '.'
    expectLint(
      `import { test, expect } from 'vitest'; test${separator}${selection}('case', () => { expect(1).toBe(2) })`,
      'test/quality-tools.test.ts',
      'no-restricted-syntax',
    )
  }
  expectLint(
    "import { test, expect } from 'vitest'; test.each([1])('case', (value) => { expect(value).toBe(1) })",
    'test/quality-tools.test.ts',
  )
}, 60_000)

test('test selection rules reject disabled and focused tests', () => {
  for (const selection of ['skip', 'only']) {
    expectLint(
      `import { test, expect } from 'vitest'; test.${selection}('case', () => { expect(1).toBe(1) })`,
      'test/quality-tools.test.ts',
      selection === 'only'
        ? 'vitest/no-focused-tests'
        : 'vitest/no-disabled-tests',
    )
  }
}, 30_000)

test('rejects per-test expected failure, disabled, focused, and retry options', () => {
  for (const options of [
    'fails: true',
    'skip: true',
    'todo: true',
    'only: true',
    'retry: 3',
    '"fails": true',
    '"retry": 2',
  ]) {
    expectLint(
      `import { test, expect } from 'vitest'; test('case', { ${options} }, () => { expect(1).toBe(2) })`,
      'test/quality-tools.test.ts',
      'no-restricted-syntax',
    )
  }
  expectLint(
    "import { test, expect } from 'vitest'; test('case', { retry: 0 }, () => { expect(1).toBe(1) })",
    'test/quality-tools.test.ts',
  )
}, 60_000)

test('Biome validates Preact hooks without React attribute assumptions', () => {
  const directory = mkdtempSync(join(tmpdir(), 'shortype-lint-'))
  const file = join(directory, 'probe.tsx')

  try {
    for (const [dependencies, status] of [
      ['[value]', 0],
      ['[]', 1],
    ] as const) {
      writeFileSync(
        file,
        `import { useEffect } from 'preact/hooks'; export function Sample({value}: {value: number}) { useEffect(() => { document.title = String(value) }, ${dependencies}); return <div class="example" /> }`,
      )
      const result = spawnSync(
        process.execPath,
        [
          'node_modules/@biomejs/biome/bin/biome',
          'lint',
          file,
          '--config-path=biome.jsonc',
          '--error-on-warnings',
        ],
        { encoding: 'utf8' },
      )

      expect(result.error).toBeUndefined()
      expect(result.status, result.stderr).toBe(status)
      if (status !== 0) {
        expect(result.stderr).toContain('useExhaustiveDependencies')
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
