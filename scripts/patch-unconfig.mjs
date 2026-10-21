import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const before =
  '  load: quansync$1.QuansyncFn<LoadConfigResult<T>, [force?: Args[0] | undefined]>;'
const after =
  '  load: quansync$1.QuansyncFn<LoadConfigResult<T>, [force?: boolean | undefined]>;'

/** @param {string} packageDirectory */
export function patchUnconfig(packageDirectory) {
  /** @type {unknown} */
  const metadata = JSON.parse(
    readFileSync(resolve(packageDirectory, 'package.json'), 'utf8'),
  )
  if (
    typeof metadata !== 'object' ||
    metadata === null ||
    !('version' in metadata) ||
    metadata.version !== '7.5.0'
  ) {
    throw new Error(
      'The unconfig declaration patch requires exactly version 7.5.0',
    )
  }
  const declaration = resolve(packageDirectory, 'dist/index.d.mts')
  const content = readFileSync(declaration, 'utf8')
  const oldCount = content.split(before).length - 1
  const newCount = content.split(after).length - 1
  if (oldCount === 0 && newCount === 1) {
    return
  }
  if (oldCount !== 1 || newCount !== 0) {
    throw new Error(
      'Unexpected unconfig declaration; review and remove or update the patch',
    )
  }
  // Upstream force defaults to false; remove this patch when its declaration is fixed.
  writeFileSync(declaration, content.replace(before, after))
}

if (import.meta.main) {
  patchUnconfig(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../node_modules/unconfig',
    ),
  )
}
