import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const target = resolve(
  'node_modules/@preact/preset-vite/dist/cjs/transform-hook-names.js',
)

const original = 'require("zimmerframe")'
const patched = 'require("../../../../zimmerframe")'

try {
  const current = await readFile(target, 'utf8')
  if (current.includes(patched)) {
    process.exit(0)
  }
  if (!current.includes(original)) {
    throw new Error(`Could not find ${original} in ${target}`)
  }
  await writeFile(target, current.replace(original, patched))
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
