import { readFileSync } from 'node:fs'
import { expect, test, vi } from 'vitest'

import {
  checkTestReport,
  checkTestResults,
} from '../scripts/check-test-results.mjs'

vi.mock(import('node:fs'), async (importOriginal) => {
  const original = await importOriginal()
  const readFileSync = vi.fn()
  return { ...original, default: { ...original, readFileSync }, readFileSync }
})

const passingReport = () => ({
  success: true,
  numTotalTests: 1,
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPendingTests: 0,
  numPendingTestSuites: 0,
  numTodoTests: 0,
  testResults: [
    {
      name: 'example.test.ts',
      status: 'passed',
      assertionResults: [{ fullName: 'checks behavior', status: 'passed' }],
    },
  ],
})

test('accepts a successful report only when every discovered test ran', () => {
  expect(() => checkTestResults(passingReport())).not.toThrow()
})

test('reads and validates the report used by the command', () => {
  vi.mocked(readFileSync).mockReturnValue(JSON.stringify(passingReport()))
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  checkTestReport()
  expect(readFileSync).toHaveBeenCalledWith('reports/vitest.json', 'utf8')
  expect(log).toHaveBeenCalledWith('All discovered tests executed successfully')
})

test.each([
  null,
  {},
  { ...passingReport(), success: false },
  { ...passingReport(), numTotalTests: 0 },
  { ...passingReport(), numTotalTests: 2 },
  { ...passingReport(), numFailedTests: 1 },
  { ...passingReport(), numFailedTestSuites: 1 },
  { ...passingReport(), numPendingTests: 1 },
  { ...passingReport(), numPendingTestSuites: 1 },
  { ...passingReport(), numTodoTests: 1 },
  { ...passingReport(), testResults: undefined },
  { ...passingReport(), testResults: [{ status: 'failed' }] },
  { ...passingReport(), testResults: [{ status: 'passed' }] },
])('rejects incomplete or failed test reports %#', (report) => {
  expect(() => checkTestResults(report)).toThrow()
})

test.each([
  'pending',
  'skipped',
  'todo',
  'disabled',
  'failed',
])('rejects the runtime %s status even when summary counters claim success', (status) => {
  const report = passingReport()
  report.testResults[0]?.assertionResults.splice(0, 1, {
    fullName: 'conditional runtime test',
    status,
  })
  expect(() => checkTestResults(report)).toThrow(/not executed successfully/)
})
