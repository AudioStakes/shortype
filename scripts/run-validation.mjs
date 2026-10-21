import { spawnSync } from 'node:child_process'

export const validationScripts = [
  'check:runtime',
  'check:policy',
  'test:gates',
  'check:workflow',
  'format:check',
  'lint',
  'typecheck',
  'knip',
  'test:coverage',
  'test:shuffle:1',
  'test:shuffle:42',
  'build',
  'test:e2e',
  'test:mutation',
  'audit',
]

/** @param {(script: string) => void} run */
export function runValidation(run) {
  for (const script of validationScripts) {
    run(script)
  }
}

/** @typedef {(command: string, args: string[], options: {stdio: 'inherit'}) => Pick<import('node:child_process').SpawnSyncReturns<Buffer>, 'status' | 'error' | 'signal'>} CommandRunner */
/** @param {string} script @param {CommandRunner} run */
export function runScript(script, run = spawnSync) {
  console.log(`\nValidating: ${script}`)
  const result = run(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', script],
    { stdio: 'inherit' },
  )
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${script} failed: ${result.signal ?? result.status}`)
  }
}

if (import.meta.main) {
  runValidation(runScript)
}
