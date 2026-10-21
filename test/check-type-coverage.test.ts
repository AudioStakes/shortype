import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import ts from 'typescript'
import { afterEach, expect, test, vi } from 'vitest'

import {
  checkTypeCoverage,
  runTypeCoverage,
} from '../scripts/check-type-coverage'

const temporaryRoots: string[] = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'shortype-type-coverage-'))
  temporaryRoots.push(root)
  mkdirSync(join(root, 'src'))
  writeFileSync(join(root, 'src', 'main.ts'), 'export {}\n')
  for (const project of [
    'tsconfig.json',
    'tsconfig.node.json',
    'tsconfig.test.json',
    'tsconfig.e2e.json',
  ]) {
    writeFileSync(
      join(root, project),
      JSON.stringify({
        compilerOptions: {
          types: [],
          noLib: true,
          allowJs: true,
          checkJs: true,
        },
        include: ['src/**/*'],
      }),
    )
  }
  return root
}

test('checks configured roots and ignores generated output', () => {
  const root = createFixture()
  mkdirSync(join(root, 'dist'))
  writeFileSync(join(root, 'dist', 'generated.js'), '')
  expect(
    checkTypeCoverage(root, [
      'src/main.ts',
      'src/main.ts',
      'dist/generated.js',
      'deleted.ts',
    ]),
  ).toBe(1)
})

test.each([
  'test/setup.ts',
  'test/nested/helper.ts',
  'orphan.mts',
  'script.cjs',
])('rejects an owned file absent from project roots: %s', (file) => {
  const root = createFixture()
  mkdirSync(dirname(join(root, file)), { recursive: true })
  writeFileSync(join(root, file), '')
  expect(() => checkTypeCoverage(root, ['src/main.ts', file])).toThrow(file)
})

test('does not accept incidental imports in place of root membership', () => {
  const root = createFixture()
  writeFileSync(join(root, 'helper.ts'), 'export const answer = 42\n')
  writeFileSync(join(root, 'src', 'main.ts'), "import '../helper'\n")
  expect(() => checkTypeCoverage(root, ['src/main.ts', 'helper.ts'])).toThrow(
    'helper.ts',
  )
})

test('reads tracked and untracked files from Git and honors ignored files', () => {
  const root = createFixture()
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  execFileSync('git', ['add', 'src/main.ts'], { cwd: root })
  writeFileSync(join(root, '.gitignore'), 'ignored.ts\n')
  writeFileSync(join(root, 'ignored.ts'), '')
  expect(runTypeCoverage(root)).toBe(
    'Type coverage: 1 files across 4 projects; browser globals isolated.\n',
  )
  writeFileSync(join(root, 'untracked.ts'), '')
  expect(() => runTypeCoverage(root)).toThrow('untracked.ts')
})

test('rejects a missing project config', () => {
  const root = createFixture()
  rmSync(join(root, 'tsconfig.node.json'))
  expect(() => checkTypeCoverage(root, ['src/main.ts'])).toThrow(
    'Cannot read file',
  )
})

test('rejects malformed compiler options', () => {
  const root = createFixture()
  writeFileSync(
    join(root, 'tsconfig.node.json'),
    JSON.stringify({
      compilerOptions: { strict: 'invalid' },
      include: ['src/**/*'],
    }),
  )
  expect(() => checkTypeCoverage(root, ['src/main.ts'])).toThrow(
    "Compiler option 'strict' requires a value of type boolean",
  )
})

test('handles case-sensitive filesystem paths', () => {
  const root = createFixture()
  const previous = ts.sys.useCaseSensitiveFileNames
  ts.sys.useCaseSensitiveFileNames = true
  try {
    expect(checkTypeCoverage(root, ['src/main.ts'])).toBe(1)
  } finally {
    ts.sys.useCaseSensitiveFileNames = previous
  }
})

test('prints the CLI summary when invoked as the entry script', async () => {
  const root = createFixture()
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  const previousArgv = process.argv
  process.argv = ['node', join(root, 'check-type-coverage.ts')]
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)
  const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  vi.resetModules()
  try {
    await import('../scripts/check-type-coverage')
    expect(stdout).toHaveBeenCalledWith(
      'Type coverage: 1 files across 4 projects; browser globals isolated.\n',
    )
  } finally {
    cwd.mockRestore()
    stdout.mockRestore()
    process.argv = previousArgv
  }
})

test('does not invoke the CLI when the entry argument is absent', async () => {
  const previousArgv = process.argv
  process.argv = ['node']
  const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  vi.resetModules()
  try {
    await import('../scripts/check-type-coverage')
    expect(stdout).not.toHaveBeenCalled()
  } finally {
    stdout.mockRestore()
    process.argv = previousArgv
  }
})

test.each([
  'process',
  'Buffer',
  'test',
  'expect',
  'vi',
])('rejects browser ambient leakage: %s', (name) => {
  const root = createFixture()
  writeFileSync(
    join(root, 'src', 'leak.d.ts'),
    `declare const ${name}: unknown\n`,
  )
  expect(() =>
    checkTypeCoverage(root, ['src/main.ts', 'src/leak.d.ts']),
  ).toThrow(`Forbidden browser ambient globals: ${name}`)
})

import { execFileSync } from 'node:child_process'
