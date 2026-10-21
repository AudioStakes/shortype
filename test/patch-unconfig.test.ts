import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, test } from 'vitest'
import { patchUnconfig } from '../scripts/patch-unconfig.mjs'

const original =
  '  load: quansync$1.QuansyncFn<LoadConfigResult<T>, [force?: Args[0] | undefined]>;'
const corrected =
  '  load: quansync$1.QuansyncFn<LoadConfigResult<T>, [force?: boolean | undefined]>;'
const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

function fixture(metadata: unknown = { version: '7.5.0' }, content = original) {
  const root = mkdtempSync(join(tmpdir(), 'shortype-unconfig-'))
  roots.push(root)
  mkdirSync(join(root, 'dist'))
  writeFileSync(join(root, 'package.json'), JSON.stringify(metadata))
  const declaration = join(root, 'dist/index.d.mts')
  writeFileSync(declaration, content)
  return { root, declaration }
}

test('repairs exactly the broken declaration and preserves surrounding declarations', () => {
  const { root, declaration } = fixture(
    undefined,
    `// preceding\n${original}\n// following\n`,
  )
  patchUnconfig(root)
  expect(readFileSync(declaration, 'utf8')).toBe(
    `// preceding\n${corrected}\n// following\n`,
  )
  patchUnconfig(root)
  expect(readFileSync(declaration, 'utf8')).toBe(
    `// preceding\n${corrected}\n// following\n`,
  )
})

test.each([
  null,
  7,
  {},
  { version: '7.5.1' },
])('rejects incompatible package metadata: %j', (metadata) => {
  const { root, declaration } = fixture(metadata)
  expect(() => patchUnconfig(root)).toThrow('requires exactly version 7.5.0')
  expect(readFileSync(declaration, 'utf8')).toBe(original)
})

test.each([
  '',
  `${original}\n${original}`,
  `${corrected}\n${corrected}`,
  `${original}\n${corrected}`,
])('rejects declaration drift or duplicates: %j', (content) => {
  const { root, declaration } = fixture(undefined, content)
  expect(() => patchUnconfig(root)).toThrow('Unexpected unconfig declaration')
  expect(readFileSync(declaration, 'utf8')).toBe(content)
})

test('fails installation when the expected declaration is absent', () => {
  const { root, declaration } = fixture()
  rmSync(declaration)
  expect(() => patchUnconfig(root)).toThrow('ENOENT')
})
