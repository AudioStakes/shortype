import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ESLint } from 'eslint'
import { expect, test } from 'vitest'

const eslint = new ESLint()

test('typed lint rejects lost promises and accepts awaited promises', async () => {
  const invalid = await eslint.lintText('Promise.resolve(1)', {
    filePath: 'src/utils/sample.ts',
  })
  const valid = await eslint.lintText('await Promise.resolve(1)', {
    filePath: 'src/utils/sample.ts',
  })

  expect(
    invalid.flatMap((result) => result.messages.map(({ ruleId }) => ruleId)),
  ).toContain('@typescript-eslint/no-floating-promises')
  expect(valid.flatMap((result) => result.messages)).toEqual([])
  const discarded = await eslint.lintText(
    'void Promise.reject(new Error("lost"))',
    {
      filePath: 'src/utils/sample.ts',
    },
  )
  const handled = await eslint.lintText(
    'Promise.reject(new Error("handled")).catch(() => undefined)',
    {
      filePath: 'src/utils/sample.ts',
    },
  )
  expect(
    discarded.flatMap((result) => result.messages.map(({ ruleId }) => ruleId)),
  ).toContain('@typescript-eslint/no-floating-promises')
  expect(handled.flatMap((result) => result.messages)).toEqual([])
}, 15_000)

test('rejects todo, conditional, and expected-failure tests, including chained and computed calls', async () => {
  for (const selection of [
    'todo',
    'skipIf(true)',
    'runIf(true)',
    'fails',
    'fails.each([1])',
    '["fails"]',
  ]) {
    const separator = selection.startsWith('[') ? '' : '.'
    const results = await eslint.lintText(
      `import { test, expect } from 'vitest'; test${separator}${selection}('case', () => { expect(1).toBe(2) })`,
      { filePath: 'test/quality-tools.test.ts' },
    )
    expect(
      results.flatMap((result) => result.messages.map(({ ruleId }) => ruleId)),
      selection,
    ).toContain('no-restricted-syntax')
  }
  const valid = await eslint.lintText(
    "import { test, expect } from 'vitest'; test.each([1])('case', (value) => { expect(value).toBe(1) })",
    { filePath: 'test/quality-tools.test.ts' },
  )
  expect(valid.flatMap((result) => result.messages)).toEqual([])
}, 15_000)

test('test selection rules reject disabled and focused tests', async () => {
  for (const selection of ['skip', 'only']) {
    const results = await eslint.lintText(
      `import { test, expect } from 'vitest'; test.${selection}('case', () => { expect(1).toBe(1) })`,
      { filePath: 'test/quality-tools.test.ts' },
    )

    expect(
      results.flatMap((result) => result.messages.map(({ ruleId }) => ruleId)),
    ).toContain(
      selection === 'only'
        ? 'vitest/no-focused-tests'
        : 'vitest/no-disabled-tests',
    )
  }
}, 15_000)

test('rejects per-test expected failure, disabled, focused, and retry options', async () => {
  for (const options of [
    'fails: true',
    'skip: true',
    'todo: true',
    'only: true',
    'retry: 3',
    '"fails": true',
    '"retry": 2',
  ]) {
    const results = await eslint.lintText(
      `import { test, expect } from 'vitest'; test('case', { ${options} }, () => { expect(1).toBe(2) })`,
      { filePath: 'test/quality-tools.test.ts' },
    )
    expect(
      results.flatMap((result) => result.messages.map(({ ruleId }) => ruleId)),
      options,
    ).toContain('no-restricted-syntax')
  }
  const valid = await eslint.lintText(
    "import { test, expect } from 'vitest'; test('case', { retry: 0 }, () => { expect(1).toBe(1) })",
    { filePath: 'test/quality-tools.test.ts' },
  )
  expect(valid.flatMap((result) => result.messages)).toEqual([])
}, 15_000)

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
