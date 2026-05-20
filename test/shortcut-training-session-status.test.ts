import { describe, expect, test } from 'vitest'

import {
  getAvailableIdToWeightMap,
  getCountsOfEachStatus,
  getMasteredIds,
} from '@/models/shortcut-training-session-status'

const snapshot = {
  shortcuts: [
    {
      id: 'chrome-1',
    },
    {
      id: 'chrome-2',
    },
    {
      id: 'terminal-1',
    },
  ] as never,
  removedIds: new Set(['chrome-2']),
  answeredHistory: new Map([
    ['chrome-1', [true]],
    ['chrome-2', [false]],
    ['terminal-1', [false, false]],
  ]),
}

describe('shortcut-training-session-status', () => {
  test('counts shortcuts by status', () => {
    expect(getCountsOfEachStatus(snapshot)).toEqual({
      mastered: {
        included: 1,
        removed: 0,
      },
      unmastered: {
        included: 1,
        removed: 1,
      },
      noAnswered: {
        included: 0,
        removed: 0,
      },
    })
  })

  test('returns mastered ids and available weights from the same rule', () => {
    expect(getMasteredIds(snapshot)).toEqual(['chrome-1'])
    expect(Array.from(getAvailableIdToWeightMap(snapshot))).toEqual([
      ['chrome-1', 0.51],
      ['terminal-1', 9],
    ])
  })
})
