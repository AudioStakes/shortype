import { describe, expect, test } from 'vitest'

import { createGameSessionBootstrap } from '@/stores/game-session'

describe('game-session', () => {
  test('falls back to an empty shortcut when no shortcuts are available', () => {
    const bootstrap = createGameSessionBootstrap({
      tool: 'Google Chrome',
      categories: ['Tabs'],
      selectedShortcuts: [],
      removedIds: new Set(),
      answeredHistory: new Map(),
      isFullscreenMode: false,
    })

    expect(bootstrap.shortcut).toMatchObject({
      id: '',
      app: '',
      category: '',
      action: '',
      keyCombinations: [],
      isAvailable: false,
    })
  })
})
