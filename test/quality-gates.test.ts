import { execFileSync, type spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import policy from '../quality-policy.json'
import {
  checkGateInventory,
  checkPolicy,
  checkQualityPolicy,
  gitOutput,
  parsePolicy,
} from '../scripts/check-quality-policy.mjs'
import { checkRuntime, verifyRuntime } from '../scripts/check-runtime.mjs'
import { checkDownload, checkWorkflows } from '../scripts/check-workflows.mjs'
import {
  runScript,
  runValidation,
  validationScripts,
} from '../scripts/run-validation.mjs'

function childResult(
  status: number | null = 0,
  signal: NodeJS.Signals | null = null,
) {
  return {
    status,
    signal,
    pid: 1,
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
    output: [],
  }
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('validation command execution', () => {
  it('rejects failed or interrupted commands and supports platform npm names', () => {
    const run = vi.fn<typeof spawnSync>().mockReturnValue(childResult())
    runValidation((script) => runScript(script, run))
    expect(run).toHaveBeenCalledTimes(validationScripts.length)
    expect(run).toHaveBeenCalledWith('npm', ['run', 'lint'], {
      stdio: 'inherit',
    })
    run.mockReturnValue({ ...childResult(), error: new Error('spawn denied') })
    expect(() => runScript('lint', run)).toThrow('spawn denied')
    run.mockReturnValue(childResult(3))
    expect(() => runScript('lint', run)).toThrow('lint failed: 3')
    run.mockReturnValue(childResult(null, 'SIGTERM'))
    expect(() => runScript('lint', run)).toThrow('SIGTERM')
    vi.stubGlobal('process', { ...process, platform: 'win32' })
    run.mockReturnValue(childResult())
    runScript('lint', run)
    expect(run).toHaveBeenLastCalledWith('npm.cmd', ['run', 'lint'], {
      stdio: 'inherit',
    })
  })
  it('checks the default runtime reader and rejects a mismatched project version', () => {
    vi.stubGlobal('process', {
      ...process,
      version: 'v24.22.1',
      env: {
        ...process.env,
        npm_config_user_agent: 'npm/11.19.1 node/v24.22.1',
      },
    })
    expect(() => verifyRuntime()).not.toThrow()
    expect(() => verifyRuntime(() => '24.21.0')).toThrow('Node')
  })
})

describe('quality policy loading', () => {
  it('validates threshold shape before comparing JSON', () => {
    expect(parsePolicy(JSON.stringify(policy))).toEqual(policy)
    expect(() => parsePolicy('null')).toThrow('objects')
    expect(() =>
      parsePolicy(JSON.stringify({ ...policy, exceptions: [false] })),
    ).toThrow('strings')
    expect(() =>
      parsePolicy(
        JSON.stringify({
          ...policy,
          mutation: { ...policy.mutation, global: -1 },
        }),
      ),
    ).toThrow('nonnegative')
    const malformed = structuredClone(policy)
    Reflect.deleteProperty(
      malformed.coverage.critical['data/parse-csv.ts'],
      'lines',
    )
    expect(() => parsePolicy(JSON.stringify(malformed))).toThrow('numbers')
    expect(gitOutput(['--version'])).toMatch(/^git version /)
  })
  it('compares the merge base and rejects regressions', () => {
    vi.stubEnv('QUALITY_BASE_REF', 'origin/main')
    const git = vi
      .fn<(args: string[]) => string>()
      .mockReturnValueOnce('abc123')
      .mockReturnValueOnce('quality-policy.json')
      .mockReturnValueOnce(JSON.stringify(policy))
    expect(() =>
      checkQualityPolicy(() => JSON.stringify(policy), git),
    ).not.toThrow()
    expect(git).toHaveBeenCalledWith(['merge-base', 'HEAD', 'origin/main'])
    const weaker = structuredClone(policy)
    weaker.mutation.global = 89
    git
      .mockReturnValueOnce('abc123')
      .mockReturnValueOnce('quality-policy.json')
      .mockReturnValueOnce(JSON.stringify(policy))
    expect(() => checkQualityPolicy(() => JSON.stringify(weaker), git)).toThrow(
      'must not decrease',
    )
  })
  it('supports initial introduction but refuses missing CI refs and invalid refs', () => {
    vi.stubEnv('QUALITY_BASE_REF', 'origin/main')
    const git = vi
      .fn<(args: string[]) => string>()
      .mockReturnValueOnce('abc123')
      .mockReturnValueOnce('')
    expect(() => checkQualityPolicy(undefined, git)).not.toThrow()
    vi.stubEnv('QUALITY_BASE_REF', '')
    vi.stubEnv('CI', '')
    git.mockReturnValueOnce('abc123').mockReturnValueOnce('')
    expect(() => checkQualityPolicy(undefined, git)).not.toThrow()
    expect(git).toHaveBeenNthCalledWith(3, [
      'merge-base',
      'HEAD',
      'origin/main',
    ])
    vi.stubEnv('CI', 'true')
    expect(() => checkQualityPolicy(undefined, git)).toThrow('QUALITY_BASE_REF')
    vi.stubEnv('QUALITY_BASE_REF', 'main;echo unsafe')
    expect(() => checkQualityPolicy(undefined, git)).toThrow(
      'Invalid policy comparison ref',
    )
    expect(git).toHaveBeenCalledTimes(4)
  })
})

describe('workflow tool execution', () => {
  function toolIO() {
    return {
      fetch: vi
        .fn<typeof fetch>()
        .mockImplementation(() =>
          Promise.resolve(new Response(new Uint8Array([42]))),
        ),
      run: vi.fn<typeof spawnSync>().mockReturnValue(childResult()),
      verify: vi.fn<typeof checkDownload>(),
    }
  }
  it('verifies before executing and supports both supported architectures', async () => {
    vi.stubGlobal('process', { ...process, platform: 'linux', arch: 'x64' })
    const io = toolIO()
    await expect(checkWorkflows(io)).resolves.toBeUndefined()
    expect(io.verify).toHaveBeenCalledWith(
      new Uint8Array([42]),
      '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8',
    )
    expect(io.run).toHaveBeenCalledTimes(2)
    expect(io.run).toHaveBeenLastCalledWith(
      expect.stringContaining('actionlint'),
      ['-shellcheck=', '-pyflakes='],
      { stdio: 'inherit' },
    )
    vi.stubGlobal('process', { ...process, platform: 'darwin', arch: 'arm64' })
    await expect(checkWorkflows(io)).resolves.toBeUndefined()
    expect(io.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('darwin_arm64'),
      expect.any(Object),
    )
  })
  it('rejects unsupported hosts and failed downloads before running commands', async () => {
    vi.stubGlobal('process', { ...process, platform: 'freebsd' })
    await expect(checkWorkflows()).rejects.toThrow('Unsupported')
    vi.stubGlobal('process', { ...process, platform: 'linux', arch: 'x64' })
    const io = toolIO()
    io.fetch.mockResolvedValue(new Response('', { status: 503 }))
    await expect(checkWorkflows(io)).rejects.toThrow('HTTP 503')
    expect(io.run).not.toHaveBeenCalled()
    io.fetch.mockResolvedValue(new Response(new Uint8Array([42])))
    io.verify.mockImplementation(() => {
      throw new Error('corrupt archive')
    })
    await expect(checkWorkflows(io)).rejects.toThrow('corrupt archive')
    expect(io.run).not.toHaveBeenCalled()
  })
  it('fails closed when extraction or validation cannot run', async () => {
    const io = toolIO()
    io.run.mockReturnValueOnce({
      ...childResult(),
      error: new Error('tar missing'),
    })
    await expect(checkWorkflows(io)).rejects.toThrow('tar missing')
    io.run.mockReturnValueOnce(childResult(2))
    await expect(checkWorkflows(io)).rejects.toThrow('extraction failed')
    io.run.mockReturnValueOnce(childResult()).mockReturnValueOnce({
      ...childResult(),
      error: new Error('tool missing'),
    })
    await expect(checkWorkflows(io)).rejects.toThrow('tool missing')
    io.run
      .mockReturnValueOnce(childResult())
      .mockReturnValueOnce(childResult(1))
    await expect(checkWorkflows(io)).rejects.toThrow(
      'Workflow validation failed',
    )
  })
})

describe('quality gate conformance', () => {
  it('requires success from every child job, including jobs skipped after dependency failure', () => {
    const workflow = readFileSync('.github/workflows/lint_and_test.yml', 'utf8')
    const run = workflow.slice(
      workflow.lastIndexOf('        run: |') + '        run: |'.length,
    )
    const command = run
      .split('\n')
      .map((line) => line.replace(/^ {10}/, ''))
      .join('\n')
    const jobs = [
      'static_checks',
      'coverage',
      'build',
      'browser',
      'mutation',
      'audit',
    ]
    const results = Object.fromEntries(
      jobs.map((job) => [job, { result: 'success' }]),
    )
    const execute = () =>
      execFileSync(
        'bash',
        ['--noprofile', '--norc', '-eo', 'pipefail', '-c', command],
        {
          env: { ...process.env, VALIDATION_RESULTS: JSON.stringify(results) },
          stdio: 'pipe',
        },
      )
    expect(execute).not.toThrow()
    for (const result of [
      'failure',
      'cancelled',
      'skipped',
      'neutral',
      'timed_out',
    ]) {
      results['browser'] = { result }
      expect(execute).toThrow()
    }
    Reflect.deleteProperty(results, 'browser')
    expect(execute).toThrow()
  })
  it('accepts the declared runtime and rejects Node or npm drift', () => {
    expect(() =>
      checkRuntime(
        'v24.22.1',
        '24.22.1\n',
        'npm/11.19.1 node/v24.22.1',
        'npm@11.19.1',
      ),
    ).not.toThrow()
    expect(() =>
      checkRuntime('v24.22.0', '24.22.1', 'npm/11.19.1', 'npm@11.19.1'),
    ).toThrow('Node')
    expect(() =>
      checkRuntime('v24.22.1', '24.22.1', 'npm/10.9.7', 'npm@11.19.1'),
    ).toThrow('npm')
    expect(() =>
      checkRuntime('v24.22.1', '24.22.1', undefined, 'npm@11.19.1'),
    ).toThrow('npm')
  })

  it('verifies download integrity and rejects corrupt bytes', () => {
    const bytes = new TextEncoder().encode('verified tool archive')
    const checksum = createHash('sha256').update(bytes).digest('hex')
    expect(() => checkDownload(bytes, checksum)).not.toThrow()
    expect(() => checkDownload(new Uint8Array([0]), checksum)).toThrow(
      'checksum',
    )
  })

  it('runs every gate in order and stops immediately on failure', () => {
    const ran: string[] = []
    runValidation((script) => {
      ran.push(script)
    })
    expect(ran).toEqual(validationScripts)
    expect(ran).toEqual(policy.requiredGates)
    const failed: string[] = []
    expect(() =>
      runValidation((script) => {
        failed.push(script)
        if (script === 'lint') {
          throw new Error('lint failure')
        }
      }),
    ).toThrow('lint failure')
    expect(failed.at(-1)).toBe('lint')
    expect(failed).not.toContain('build')
  })

  it('requires every gate script to exist', () => {
    const scripts = Object.fromEntries(
      policy.requiredGates.map((gate) => [gate, 'command']),
    )
    expect(() => checkGateInventory(policy, scripts)).not.toThrow()
    delete scripts['lint']
    expect(() => checkGateInventory(policy, scripts)).toThrow('lint')
    expect(() =>
      checkGateInventory(
        { ...policy, requiredGates: [...policy.requiredGates, 'missing'] },
        scripts,
      ),
    ).toThrow()
  })

  it('accepts unchanged or stronger thresholds', () => {
    expect(() =>
      checkPolicy(policy, structuredClone(policy), () => true),
    ).not.toThrow()
    const stronger = structuredClone(policy)
    stronger.coverage.global.lines = 100
    stronger.mutation.global = 95
    expect(() => checkPolicy(policy, stronger, () => true)).not.toThrow()
  })

  it('rejects lower thresholds, higher tolerated failures, and new exceptions', () => {
    const weaker = structuredClone(policy)
    weaker.coverage.global.lines = 94
    expect(() => checkPolicy(policy, weaker, () => true)).toThrow(
      'must not decrease',
    )
    const mutation = structuredClone(policy)
    mutation.mutation.noCoverage = 1
    expect(() => checkPolicy(policy, mutation, () => true)).toThrow(
      'must not increase',
    )
    const exceptions = { ...policy, exceptions: ['ignored-file'] }
    expect(() => checkPolicy(policy, exceptions, () => true)).toThrow(
      'exceptions',
    )
  })

  it('rejects removing existing protected targets and allows deleted source removal', () => {
    const mutation = structuredClone(policy)
    mutation.mutation.targets.pop()
    expect(() => checkPolicy(policy, mutation, () => true)).toThrow(
      'Mutation target removed',
    )
    expect(() => checkPolicy(policy, mutation, () => false)).not.toThrow()
    const coverage = structuredClone(policy)
    const critical = 'data/parse-csv.ts'
    Reflect.deleteProperty(coverage.coverage.critical, critical)
    expect(() => checkPolicy(policy, coverage, () => true)).toThrow(
      'Critical coverage target removed',
    )
    expect(() => checkPolicy(policy, coverage, () => false)).not.toThrow()
    const gates = structuredClone(policy)
    gates.requiredGates.pop()
    expect(() => checkPolicy(policy, gates, () => true)).toThrow(
      'requiredGates target removed',
    )
  })
})
