import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getMock, setMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  setMock: vi.fn(),
}))

vi.mock('@/utils/local-storage', () => ({
  default: {
    get: getMock,
    set: setMock,
  },
}))

import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import {
  createGameSessionStoragePersistence,
  loadGameSessionStorage,
} from '@/stores/game-session-storage'

describe('game-session-storage', () => {
  beforeEach(() => {
    getMock.mockReset()
    setMock.mockReset()
  })

  test('loads storage values into session-friendly collections', () => {
    getMock.mockImplementation((key: string) => {
      if (key === SELECTED_TOOL_KEY) return 'Google Chrome'
      if (key === SELECTED_CATEGORIES_KEY) return ['Tabs']
      if (key === REMOVED_IDS_KEY) return ['chrome-1']
      if (key === ANSWERED_HISTORY_KEY) {
        return {
          'chrome-1': [true, false],
        }
      }

      return undefined
    })

    expect(loadGameSessionStorage()).toEqual({
      selectedTool: 'Google Chrome',
      selectedCategories: ['Tabs'],
      removedIds: new Set(['chrome-1']),
      answeredHistory: new Map([['chrome-1', [true, false]]]),
    })
  })

  test('persists session collections back to storage format', () => {
    const persistence = createGameSessionStoragePersistence()

    persistence.persistRemovedIds(new Set(['chrome-1', 'chrome-2']))
    persistence.persistAnsweredHistory(
      new Map([['chrome-1', [true, false]]]),
    )
    persistence.persistSelectedTool('Terminal (macOS)')
    persistence.persistSelectedCategories(['Shell'])

    expect(setMock).toHaveBeenNthCalledWith(1, REMOVED_IDS_KEY, [
      'chrome-1',
      'chrome-2',
    ])
    expect(setMock).toHaveBeenNthCalledWith(2, ANSWERED_HISTORY_KEY, {
      'chrome-1': [true, false],
    })
    expect(setMock).toHaveBeenNthCalledWith(
      3,
      SELECTED_TOOL_KEY,
      'Terminal (macOS)',
    )
    expect(setMock).toHaveBeenNthCalledWith(4, SELECTED_CATEGORIES_KEY, [
      'Shell',
    ])
  })
})
