import { describe, expect, test, vi } from 'vitest'

import {
  createGameSessionBootstrap,
  createGameSessionDeps,
} from '@/stores/game-session'

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

test('bootstrap respects explicit shortcuts and excludes removed initial questions', () => {
  const first = shortcutFixture('first')
  const second = shortcutFixture('second')
  const bootstrap = createGameSessionBootstrap({
    tool: 'Google Chrome',
    categories: ['Tabs'],
    selectedShortcuts: [first],
    shortcuts: [first, second],
    removedIds: new Set(['first']),
    answeredHistory: new Map([['second', [true]]]),
    isFullscreenMode: true,
  })
  expect(bootstrap.shortcut).toBe(second)
  expect(bootstrap.shortcuts).toEqual([first, second])
  expect(bootstrap.categories).toEqual(['Tabs'])
  expect(bootstrap.answeredHistory).toEqual(new Map([['second', [true]]]))
  expect(bootstrap.isFullscreenMode).toBe(true)
})

test('production bootstrap samples available shortcuts and dependencies schedule delayed restarts', async () => {
  vi.useFakeTimers()
  vi.stubEnv('MODE', 'production')
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
  try {
    const first = shortcutFixture('first')
    const second = shortcutFixture('second')
    const bootstrap = createGameSessionBootstrap({
      tool: 'Google Chrome',
      categories: [],
      selectedShortcuts: [first, second],
      removedIds: new Set(),
      answeredHistory: new Map(),
      isFullscreenMode: false,
    })
    expect(bootstrap.shortcut).toBe(second)
    const deps = createGameSessionDeps()
    expect(deps.isFullscreenMode()).toBe(false)
    const callback = vi.fn()
    deps.scheduleRestartTyping(callback)
    await vi.advanceTimersByTimeAsync(999)
    expect(callback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(callback).toHaveBeenCalledOnce()
  } finally {
    vi.useRealTimers()
  }
})

import { shortcutFixture } from './shortcut-fixture'

test('test dependencies resume on the next timer turn', async () => {
  vi.useFakeTimers()
  try {
    const deps = createGameSessionDeps()
    const callback = vi.fn()
    deps.scheduleRestartTyping(callback)
    expect(callback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)
    expect(callback).toHaveBeenCalledOnce()
  } finally {
    vi.useRealTimers()
  }
})
