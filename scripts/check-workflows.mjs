import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const version = '1.7.12'
const checksums = {
  linux_x64: '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8',
  linux_arm64:
    '325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6',
  darwin_x64:
    '5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644',
  darwin_arm64:
    'aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f',
}

/** @param {Uint8Array} bytes @param {string} expected */
export function checkDownload(bytes, expected) {
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    expected,
    'actionlint archive checksum mismatch',
  )
}

/** @typedef {(command: string, args: string[], options: {stdio: 'inherit'}) => Pick<import('node:child_process').SpawnSyncReturns<Buffer>, 'status' | 'error'>} ToolRunner */
/** @param {{fetch: typeof fetch, run: ToolRunner, verify: typeof checkDownload}} io */
export async function checkWorkflows(
  io = { fetch, run: spawnSync, verify: checkDownload },
) {
  const platform = `${process.platform}_${process.arch}`
  const checksum = checksums[/** @type {keyof typeof checksums} */ (platform)]
  assert.ok(checksum, `Unsupported actionlint platform: ${platform}`)
  const arch = process.arch === 'x64' ? 'amd64' : process.arch
  const filename = `actionlint_${version}_${process.platform}_${arch}.tar.gz`
  const response = await io.fetch(
    `https://github.com/rhysd/actionlint/releases/download/v${version}/${filename}`,
    { signal: AbortSignal.timeout(60_000) },
  )
  assert.ok(response.ok, `actionlint download failed: HTTP ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  io.verify(bytes, checksum)
  const directory = mkdtempSync(join(tmpdir(), 'shortype-actionlint-'))
  try {
    const archive = join(directory, filename)
    writeFileSync(archive, bytes)
    const extraction = io.run(
      'tar',
      ['-xzf', archive, '-C', directory, 'actionlint'],
      { stdio: 'inherit' },
    )
    if (extraction.error) {
      throw extraction.error
    }
    assert.equal(extraction.status, 0, 'actionlint extraction failed')
    // Optional executables must not silently change lint behavior between machines.
    const result = io.run(
      join(directory, 'actionlint'),
      ['-shellcheck=', '-pyflakes='],
      { stdio: 'inherit' },
    )
    if (result.error) {
      throw result.error
    }
    assert.equal(result.status, 0, 'Workflow validation failed')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  await checkWorkflows()
}
