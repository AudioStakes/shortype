import { readFileSync } from 'node:fs'
import { expect, test, vi } from 'vitest'

import policy from '../quality-policy.json'
import {
  checkMutationReport,
  checkMutationResults,
} from '../scripts/check-mutation-results.mjs'

vi.mock(import('node:fs'), async (importOriginal) => {
  const original = await importOriginal()
  const readFileSync = vi.fn()
  return { ...original, default: { ...original, readFileSync }, readFileSync }
})

const passingReport = () => ({
  files: Object.fromEntries(
    policy.mutation.targets.map((filename) => [
      filename,
      { mutants: Array.from({ length: 10 }, () => ({ status: 'Killed' })) },
    ]),
  ),
})

test('accepts a complete mutation run with every file at or above its floor', () => {
  const report = passingReport()
  for (const file of Object.values(report.files)) {
    file.mutants.splice(0, 2, { status: 'Timeout' }, { status: 'Survived' })
  }
  expect(() => checkMutationResults(report)).not.toThrow()
})

test('reads and validates the report used by the command', () => {
  vi.mocked(readFileSync).mockReturnValue(JSON.stringify(passingReport()))
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  checkMutationReport()
  expect(readFileSync).toHaveBeenCalledWith(
    'reports/mutation/mutation.json',
    'utf8',
  )
  expect(log).toHaveBeenCalledWith(
    'All mutation targets meet the required score',
  )
})

test.each([
  null,
  {},
  { files: null },
  { files: [] },
  { files: {} },
])('rejects malformed or empty mutation reports %#', (report) => {
  expect(() => checkMutationResults(report)).toThrow()
})

test.each([
  'NoCoverage',
  'CompileError',
  'RuntimeError',
  'Ignored',
  'Pending',
])('rejects %s mutants even when the score would otherwise pass', (status) => {
  const report = passingReport()
  const file = Object.values(report.files)[0]
  if (!file) {
    throw new Error('Missing fixture target')
  }
  file.mutants[0] = { status }
  expect(() => checkMutationResults(report)).toThrow()
})

test('rejects one file below its floor despite a high global score', () => {
  const report = passingReport()
  const file = Object.values(report.files)[0]
  if (!file) {
    throw new Error('Missing fixture target')
  }
  file.mutants.splice(0, 2, { status: 'Survived' }, { status: 'Survived' })
  expect(() => checkMutationResults(report)).toThrow(/Mutation score below/)
})

test('rejects empty, missing, and unexpected mutation targets', () => {
  const report = passingReport()
  report.files['unexpected.ts'] = { mutants: [{ status: 'Killed' }] }
  expect(() => checkMutationResults(report)).toThrow(
    /Unexpected mutation target/,
  )
  const empty = passingReport()
  const target = policy.mutation.targets[0]
  if (!target) {
    throw new Error('Missing fixture target')
  }
  empty.files[target] = { mutants: [] }
  expect(() => checkMutationResults(empty)).toThrow(/No mutants tested/)
  const missing = passingReport()
  delete missing.files[target]
  expect(() => checkMutationResults(missing)).toThrow(
    /Missing mutation targets/,
  )
})
