import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getMock, setMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  setMock: vi.fn(),
}))

vi.mock('@/utils/local-storage', () => ({
  default: {
    get: getMock,
    getPersisted: getMock,
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

  test.each([
    {
      tool: 'macOS',
      categories: ['システム環境設定のショートカット'],
      expected: ['システム設定のショートカット'],
    },
    {
      tool: 'macOS',
      categories: [
        '基本的なショートカット',
        'システム環境設定のショートカット',
        'Removed category',
        'システム設定のショートカット',
      ],
      expected: ['基本的なショートカット', 'システム設定のショートカット'],
    },
    {
      tool: 'macOS',
      categories: ['システム設定のショートカット'],
      expected: ['システム設定のショートカット'],
    },
    {
      tool: 'macOS',
      categories: ['Removed category'],
      expected: [],
    },
    {
      tool: 'Google Chrome',
      categories: ['システム環境設定のショートカット', chromeCategory],
      expected: [chromeCategory],
    },
  ])('migrates and deduplicates saved macOS category names before filtering: $tool $categories', ({
    tool,
    categories,
    expected,
  }) => {
    getMock.mockImplementation((key: string) => {
      if (key === SELECTED_TOOL_KEY) {
        return tool
      }
      if (key === SELECTED_CATEGORIES_KEY) {
        return categories
      }
      if (key === REMOVED_IDS_KEY) {
        return ['265']
      }
      if (key === ANSWERED_HISTORY_KEY) {
        return { '266': [true, false] }
      }
      return undefined
    })

    expect(loadGameSessionStorage()).toEqual({
      selectedTool: tool,
      selectedCategories: expected,
      removedIds: new Set(['265']),
      answeredHistory: new Map([['266', [true, false]]]),
    })
    expect(setMock).not.toHaveBeenCalled()
  })

  test('persists the session preferences without changing progress', () => {
    const persistence = createGameSessionStoragePersistence()

    persistence.persistSelectedTool('Terminal (macOS)')
    persistence.persistSelectedCategories(['Shell'])

    expect(setMock).toHaveBeenNthCalledWith(
      1,
      SELECTED_TOOL_KEY,
      'Terminal (macOS)',
    )
    expect(setMock).toHaveBeenNthCalledWith(2, SELECTED_CATEGORIES_KEY, [
      'Shell',
    ])
  })
})

test('default persistence handles share memory progress across game remounts', async () => {
  vi.resetModules()
  getMock.mockImplementation((key: string) => {
    if (key === SELECTED_TOOL_KEY) {
      return 'Google Chrome'
    }
    if (key === SELECTED_CATEGORIES_KEY) {
      return []
    }
    if (key === REMOVED_IDS_KEY) {
      return []
    }
    return {}
  })
  setMock.mockReturnValue(false)
  const isolatedStorage = await import('@/stores/game-session-storage')
  const firstMount = isolatedStorage.createGameSessionStoragePersistence()
  const unsubscribe = firstMount.subscribeProgress(() => undefined)
  firstMount.appendAnswer('local', true)
  unsubscribe()
  const writes = setMock.mock.calls.length
  const secondMount = isolatedStorage.createGameSessionStoragePersistence()
  secondMount.appendAnswer('local', false)
  secondMount.removeShortcut('local')
  expect(isolatedStorage.loadGameSessionStorage()).toEqual({
    selectedTool: 'Google Chrome',
    selectedCategories: [],
    answeredHistory: new Map([['local', [true, false]]]),
    removedIds: new Set(['local']),
  })
  expect(setMock).toHaveBeenCalledTimes(writes)
})
