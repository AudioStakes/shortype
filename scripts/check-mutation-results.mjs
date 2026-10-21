import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import policy from '../quality-policy.json' with { type: 'json' }

const detectedStatuses = new Set(['Killed', 'Timeout'])
const undetectedStatuses = new Set(['Survived', 'NoCoverage'])

/** @param {unknown} report */
export function checkMutationResults(report) {
  assert.ok(
    report && typeof report === 'object' && 'files' in report,
    'Mutation report must contain files',
  )
  assert.ok(
    report.files &&
      typeof report.files === 'object' &&
      !Array.isArray(report.files),
    'Mutation files must be an object',
  )
  let total = 0
  let detected = 0
  let noCoverage = 0
  let errors = 0
  const targets = new Set(policy.mutation.targets)

  /** @type {[string, unknown][]} */
  const files = Object.entries(report.files)
  for (const [filename, file] of files) {
    assert.ok(
      targets.delete(filename),
      `Unexpected mutation target: ${filename}`,
    )
    assert.ok(
      file &&
        typeof file === 'object' &&
        'mutants' in file &&
        Array.isArray(file.mutants),
      `Missing mutants: ${filename}`,
    )
    let fileTotal = 0
    let fileDetected = 0
    /** @type {unknown[]} */
    const mutants = file.mutants
    for (const mutant of mutants) {
      assert.ok(
        mutant &&
          typeof mutant === 'object' &&
          'status' in mutant &&
          typeof mutant.status === 'string',
        'Every mutant must have a status',
      )
      if (detectedStatuses.has(mutant.status)) {
        fileDetected += 1
      } else if (
        mutant.status === 'CompileError' ||
        mutant.status === 'RuntimeError'
      ) {
        errors += 1
      } else {
        assert.ok(
          undetectedStatuses.has(mutant.status),
          `Unresolved mutant status: ${mutant.status}`,
        )
      }
      if (mutant.status === 'NoCoverage') {
        noCoverage += 1
      }
      fileTotal += 1
    }
    assert.ok(fileTotal > 0, `No mutants tested: ${filename}`)
    assert.ok(
      (fileDetected / fileTotal) * 100 >= policy.mutation.perFile,
      `Mutation score below ${policy.mutation.perFile}%: ${filename}`,
    )
    total += fileTotal
    detected += fileDetected
  }

  assert.equal(
    targets.size,
    0,
    `Missing mutation targets: ${[...targets].join(', ')}`,
  )
  assert.ok(
    total >= policy.mutation.totalMinimum,
    'Mutation run must contain mutants',
  )
  assert.equal(
    noCoverage,
    policy.mutation.noCoverage,
    'Every mutant must be covered',
  )
  assert.equal(
    errors,
    policy.mutation.errors,
    'Mutation run must contain no compile or runtime errors',
  )
  assert.ok(
    (detected / total) * 100 >= policy.mutation.global,
    `Global mutation score below ${policy.mutation.global}%`,
  )
}

export function checkMutationReport() {
  const report = /** @type {unknown} */ (
    JSON.parse(readFileSync('reports/mutation/mutation.json', 'utf8'))
  )
  checkMutationResults(report)
  console.log('All mutation targets meet the required score')
}

if (import.meta.main) {
  checkMutationReport()
}
