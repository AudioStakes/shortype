import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/** @param {unknown} report */
export function checkTestResults(report) {
  assert.ok(
    report && typeof report === 'object',
    'Test report must be an object',
  )
  assert.ok(
    'success' in report && report.success === true,
    'Tests must succeed',
  )
  assert.ok(
    'numTotalTests' in report &&
      typeof report.numTotalTests === 'number' &&
      report.numTotalTests > 0,
    'Test run must contain tests',
  )
  for (const field of [
    'numFailedTests',
    'numFailedTestSuites',
    'numPendingTests',
    'numPendingTestSuites',
    'numTodoTests',
  ]) {
    assert.ok(
      field in report && Reflect.get(report, field) === 0,
      `${field} must be zero`,
    )
  }
  assert.ok(
    'testResults' in report && Array.isArray(report.testResults),
    'Test results must be present',
  )
  let executed = 0
  /** @type {unknown[]} */
  const files = report.testResults
  for (const file of files) {
    assert.ok(file && typeof file === 'object' && 'status' in file)
    assert.equal(file.status, 'passed', 'Test file must pass')
    assert.ok(
      'assertionResults' in file && Array.isArray(file.assertionResults),
      'Assertions must be present',
    )
    /** @type {unknown[]} */
    const tests = file.assertionResults
    for (const test of tests) {
      assert.ok(test && typeof test === 'object' && 'status' in test)
      assert.equal(test.status, 'passed', 'Test was not executed successfully')
      executed += 1
    }
  }
  assert.equal(
    executed,
    report.numTotalTests,
    'Every discovered test must execute',
  )
}

export function checkTestReport() {
  const report = /** @type {unknown} */ (
    JSON.parse(readFileSync('reports/vitest.json', 'utf8'))
  )
  checkTestResults(report)
  console.log('All discovered tests executed successfully')
}

if (import.meta.main) {
  checkTestReport()
}
