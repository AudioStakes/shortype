import { readFileSync } from 'node:fs'
import packageManifest from '../package.json' with { type: 'json' }

/** @param {string} nodeVersion @param {string} expectedNodeVersion @param {string | undefined} userAgent @param {string} packageManager */
export function checkRuntime(
  nodeVersion,
  expectedNodeVersion,
  userAgent,
  packageManager,
) {
  if (nodeVersion !== `v${expectedNodeVersion.trim()}`) {
    throw new Error('Use the Node version in .nvmrc')
  }
  if (userAgent?.split(' ')[0] !== packageManager.replace('@', '/')) {
    throw new Error('Use the declared npm version')
  }
}

/** @param {() => string} readVersion */
export function verifyRuntime(
  readVersion = () => readFileSync('.nvmrc', 'utf8'),
) {
  checkRuntime(
    process.version,
    readVersion(),
    process.env['npm_config_user_agent'],
    packageManifest.packageManager,
  )
  console.log(
    `Runtime verified: ${process.version}, ${packageManifest.packageManager}`,
  )
}

if (import.meta.main) {
  verifyRuntime()
}
