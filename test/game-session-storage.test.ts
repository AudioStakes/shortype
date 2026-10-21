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
import shortcutCatalog from '@/models/shortcut-catalog'
import {
  createGameSessionStoragePersistence,
  loadGameSessionStorage,
} from '@/stores/game-session-storage'

describe('game-session-storage', () => {
  const chromeCategory =
    shortcutCatalog.listCategoriesOf('Google Chrome')[0] ?? ''

  beforeEach(() => {
    getMock.mockReset()
    setMock.mockReset()
  })

  test('loads storage values into session-friendly collections', () => {
    getMock.mockImplementation((key: string) => {
      if (key === SELECTED_TOOL_KEY) {
        return 'Google Chrome'
      }
      if (key === SELECTED_CATEGORIES_KEY) {
        return [chromeCategory]
      }
      if (key === REMOVED_IDS_KEY) {
        return ['chrome-1']
      }
      if (key === ANSWERED_HISTORY_KEY) {
        return {
          'chrome-1': [true, false],
        }
      }

      return undefined
    })

    expect(loadGameSessionStorage()).toEqual({
      selectedTool: 'Google Chrome',
      selectedCategories: [chromeCategory],
      removedIds: new Set(['chrome-1']),
      answeredHistory: new Map([['chrome-1', [true, false]]]),
    })
  })

  test('falls back to a usable tool when the saved tool no longer exists', () => {
    getMock.mockImplementation((key: string) => {
      if (key === SELECTED_TOOL_KEY) {
        return 'Removed tool'
      }
      if (key === SELECTED_CATEGORIES_KEY) {
        return ['Removed category']
      }
      if (key === REMOVED_IDS_KEY) {
        return []
      }
      if (key === ANSWERED_HISTORY_KEY) {
        return {}
      }
      return undefined
    })

    const snapshot = loadGameSessionStorage()

    expect(snapshot.selectedTool).toBe('Google Chrome')
    expect(snapshot.selectedCategories).toEqual([])
    expect(
      shortcutCatalog.searchShortcuts({
        tool: snapshot.selectedTool,
        categories: snapshot.selectedCategories,
      }).length,
    ).toBeGreaterThan(0)
  })

  test.each([
    [chromeCategory, 'Removed category'],
    ['Removed category'],
  ])('drops categories that no longer exist: %j', (...categories) => {
    getMock.mockImplementation((key: string) => {
      if (key === SELECTED_TOOL_KEY) {
        return 'Google Chrome'
      }
      if (key === SELECTED_CATEGORIES_KEY) {
        return categories
      }
      if (key === REMOVED_IDS_KEY) {
        return []
      }
      if (key === ANSWERED_HISTORY_KEY) {
        return {}
      }
      return undefined
    })

    const snapshot = loadGameSessionStorage()

    expect(snapshot.selectedCategories).toEqual(
      categories.includes(chromeCategory) ? [chromeCategory] : [],
    )
    expect(
      shortcutCatalog.searchShortcuts({
        tool: snapshot.selectedTool,
        categories: snapshot.selectedCategories,
      }).length,
    ).toBeGreaterThan(0)
  })

  test('persists session collections back to storage format', () => {
    const persistence = createGameSessionStoragePersistence()

    persistence.persistRemovedIds(new Set(['chrome-1', 'chrome-2']))
    persistence.persistAnsweredHistory(new Map([['chrome-1', [true, false]]]))
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
