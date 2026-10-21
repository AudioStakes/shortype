import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import packageManifest from '../package.json' with { type: 'json' }
import currentPolicy from '../quality-policy.json' with { type: 'json' }
import { validationScripts } from './run-validation.mjs'

/** @typedef {Omit<typeof import('../quality-policy.json'), 'exceptions'> & {exceptions: string[]}} QualityPolicy */

/** @param {unknown} value @param {unknown} template */
function checkShape(value, template) {
  if (Array.isArray(template)) {
    assert.ok(
      Array.isArray(value) && value.every((item) => typeof item === 'string'),
      'Policy arrays must contain strings',
    )
  } else if (typeof template === 'object' && template !== null) {
    assert.ok(
      typeof value === 'object' && value !== null && !Array.isArray(value),
      'Policy sections must be objects',
    )
    for (const [key, expected] of Object.entries(template)) {
      checkShape(/** @type {Record<string, unknown>} */ (value)[key], expected)
    }
  } else {
    assert.ok(
      typeof value === 'number' && Number.isFinite(value) && value >= 0,
      'Policy thresholds must be finite nonnegative numbers',
    )
  }
}

/** @param {string} text @returns {QualityPolicy} */
export function parsePolicy(text) {
  /** @type {unknown} */
  const value = JSON.parse(text)
  checkShape(value, {
    ...currentPolicy,
    coverage: { ...currentPolicy.coverage, critical: {} },
  })
  const policy = /** @type {QualityPolicy} */ (value)
  for (const thresholds of Object.values(policy.coverage.critical)) {
    checkShape(thresholds, currentPolicy.coverage.global)
  }
  return policy
}

/** @param {QualityPolicy} previous @param {QualityPolicy} current @param {(path: string) => boolean} exists */
export function checkPolicy(previous, current, exists = existsSync) {
  /** @param {Record<string, number>} before @param {Record<string, number>} after @param {string} label */
  function floors(before, after, label) {
    for (const [metric, value] of Object.entries(before)) {
      assert.ok(
        Number.isFinite(after[metric]) &&
          /** @type {number} */ (after[metric]) >= value,
        `${label}.${metric} must not decrease`,
      )
    }
  }
  floors(previous.coverage.global, current.coverage.global, 'coverage.global')
  floors(
    previous.coverage.perFile,
    current.coverage.perFile,
    'coverage.perFile',
  )
  for (const [path, thresholds] of Object.entries(previous.coverage.critical)) {
    if (!exists(path)) {
      continue
    }
    const currentThresholds =
      /** @type {Record<string, Record<string, number>>} */ (
        current.coverage.critical
      )[path]
    assert.ok(currentThresholds, `Critical coverage target removed: ${path}`)
    floors(thresholds, currentThresholds, path)
  }
  floors(
    {
      global: previous.mutation.global,
      perFile: previous.mutation.perFile,
      totalMinimum: previous.mutation.totalMinimum,
    },
    {
      global: current.mutation.global,
      perFile: current.mutation.perFile,
      totalMinimum: current.mutation.totalMinimum,
    },
    'mutation',
  )
  for (const metric of /** @type {const} */ (['noCoverage', 'errors'])) {
    assert.ok(
      Number.isFinite(current.mutation[metric]) &&
        current.mutation[metric] <= previous.mutation[metric],
      `mutation.${metric} must not increase`,
    )
  }
  for (const target of previous.mutation.targets) {
    if (exists(target)) {
      assert.ok(
        current.mutation.targets.includes(target),
        `Mutation target removed: ${target}`,
      )
    }
  }
  for (const key of /** @type {const} */ ([
    'sources',
    'typeConfigs',
    'requiredGates',
  ])) {
    for (const target of previous[key]) {
      assert.ok(
        current[key].includes(target),
        `${key} target removed: ${target}`,
      )
    }
  }
  assert.ok(
    current.exceptions.every((exception) =>
      previous.exceptions.includes(exception),
    ),
    'New quality exceptions are forbidden',
  )
}

/** @param {QualityPolicy} policy @param {Record<string, string>} scripts */
export function checkGateInventory(policy, scripts) {
  for (const gate of policy.requiredGates) {
    assert.ok(
      validationScripts.includes(gate),
      `Validation omits required gate: ${gate}`,
    )
    assert.ok(scripts[gate]?.trim(), `Missing package script: ${gate}`)
  }
}

/** @param {() => string} read @param {(args: string[]) => string} git */
export function checkQualityPolicy(
  read = () => readFileSync('quality-policy.json', 'utf8'),
  git = gitOutput,
) {
  const current = parsePolicy(read())
  checkGateInventory(current, packageManifest.scripts)
  const base =
    process.env['QUALITY_BASE_REF'] ||
    (!process.env['CI'] ? 'origin/main' : undefined)
  if (base) {
    assert.match(base, /^[A-Za-z0-9_./-]+$/, 'Invalid policy comparison ref')
    const mergeBase = git(['merge-base', 'HEAD', base]).trim()
    const files = git([
      'ls-tree',
      '--name-only',
      mergeBase,
      '--',
      'quality-policy.json',
    ]).trim()
    if (files) {
      const previous = parsePolicy(
        git(['show', `${mergeBase}:quality-policy.json`]),
      )
      checkPolicy(previous, current)
    } else {
      console.log(
        'Introducing quality policy: no policy exists at the comparison base',
      )
    }
  } else {
    throw new Error('CI must set QUALITY_BASE_REF for policy regression checks')
  }
  console.log('Quality policy verified')
}

/** @param {string[]} args */
export function gitOutput(args) {
  return execFileSync('git', args, { encoding: 'utf8' })
}

if (import.meta.main) {
  checkQualityPolicy()
}
