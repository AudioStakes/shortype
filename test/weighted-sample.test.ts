import { afterEach, expect, test, vi } from 'vitest'
import sample from '@/utils/sample'
import { calculateWeight, weightedSampleKey } from '@/utils/weighted-sample'

afterEach(() => vi.restoreAllMocks())

test.each([
  [[], 1],
  [[true], 0.51],
  [[false], 5],
  [[true, true], 0.02],
  [[true, false], 4.51],
  [[false, true], 4.51],
  [[false, false], 9],
  [[false, false, true, true], 0.02],
  [[true, true, false, false], 9],
] as const)('weights only the two most recent answers: %j', (results, expected) => {
  expect(calculateWeight([...results])).toBeCloseTo(expected, 12)
})

test.each([
  [0, 'a'],
  [0.249999, 'a'],
  [0.25, 'a'],
  [0.250001, 'b'],
  [0.999999, 'b'],
] as const)('samples cumulative weighted boundaries at %s', (random, expected) => {
  vi.spyOn(Math, 'random').mockReturnValue(random)
  expect(
    weightedSampleKey(
      new Map([
        ['a', 1],
        ['b', 3],
      ]),
    ),
  ).toBe(expected)
})

test('empty sampling returns undefined', () => {
  expect(weightedSampleKey(new Map())).toBeUndefined()
  expect(sample([])).toBeUndefined()
})

test.each([
  [0, 'first'],
  [0.49, 'first'],
  [0.5, 'last'],
  [0.999999, 'last'],
] as const)('samples array positions at %s', (random, expected) => {
  vi.spyOn(Math, 'random').mockReturnValue(random)
  expect(sample(['first', 'last'])).toBe(expected)
})
