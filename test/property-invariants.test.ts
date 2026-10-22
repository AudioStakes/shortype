import fc from 'fast-check'
import { expect, test } from 'vitest'

import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import { createEmptyShortcut } from '@/models/empty-shortcut'
import {
  getAvailableIdToWeightMap,
  getCountsOfEachStatus,
} from '@/models/shortcut-training-session-status'
import { createLocalStorageCore } from '@/utils/local-storage-core'

const propertyOptions = { numRuns: 500, seed: 20261022 }
const history = fc.array(fc.boolean(), { minLength: 1, maxLength: 20 })

test('valid learning data survives storage serialization and a fresh session', () => {
  fc.assert(
    fc.property(
      fc.record({
        tool: fc.string(),
        categories: fc.array(fc.string()),
        removedIds: fc.array(fc.string()),
        answeredHistory: fc.dictionary(fc.string(), history),
      }),
      ({ tool, categories, removedIds, answeredHistory }) => {
        const values = new Map<string, string>()
        const storage = {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => values.set(key, value),
          removeItem: (key: string) => values.delete(key),
        }
        const writer = createLocalStorageCore(storage)
        writer.set(SELECTED_TOOL_KEY, tool)
        writer.set(SELECTED_CATEGORIES_KEY, categories)
        writer.set(REMOVED_IDS_KEY, removedIds)
        writer.set(ANSWERED_HISTORY_KEY, answeredHistory)

        const reader = createLocalStorageCore(storage)
        expect(reader.get(SELECTED_TOOL_KEY)).toBe(tool)
        expect(reader.get(SELECTED_CATEGORIES_KEY)).toEqual(categories)
        expect(reader.get(REMOVED_IDS_KEY)).toEqual(removedIds)
        expect(reader.get(ANSWERED_HISTORY_KEY)).toEqual(
          Object.fromEntries(
            Object.entries(answeredHistory).map(([id, results]) => [
              id,
              results.slice(-2),
            ]),
          ),
        )
      },
    ),
    propertyOptions,
  )
})

test('every shortcut belongs to exactly one learning status and inclusion group', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          results: fc.option(history, { nil: undefined }),
          removed: fc.boolean(),
        }),
        { maxLength: 100 },
      ),
      (entries) => {
        const shortcuts = entries.map((_, index) => ({
          ...createEmptyShortcut(),
          id: String(index),
        }))
        const removedIds = new Set<string>()
        const answeredHistory = new Map<string, boolean[]>()
        const expected = {
          mastered: { included: 0, removed: 0 },
          unmastered: { included: 0, removed: 0 },
          unanswered: { included: 0, removed: 0 },
        }

        entries.forEach(({ results, removed }, index) => {
          if (removed) {
            removedIds.add(String(index))
          }
          if (results) {
            answeredHistory.set(String(index), results)
          }
          const status = !results
            ? 'unanswered'
            : results.slice(-2).every(Boolean)
              ? 'mastered'
              : 'unmastered'
          expected[status][removed ? 'removed' : 'included'] += 1
        })

        expect(
          getCountsOfEachStatus({ shortcuts, removedIds, answeredHistory }),
        ).toEqual(expected)
        const boundedHistory = new Map(
          [...answeredHistory].map(([id, results]) => [id, results.slice(-2)]),
        )
        expect(
          getCountsOfEachStatus({
            shortcuts,
            removedIds,
            answeredHistory: boundedHistory,
          }),
        ).toEqual(expected)
        expect(
          getAvailableIdToWeightMap({
            shortcuts,
            removedIds,
            answeredHistory: boundedHistory,
          }),
        ).toEqual(
          getAvailableIdToWeightMap({ shortcuts, removedIds, answeredHistory }),
        )
      },
    ),
    propertyOptions,
  )
})
