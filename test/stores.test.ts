import { expect, test, vi } from 'vitest'
import createGameStore from '@/stores/game'
import createModalStore from '@/stores/modal'
import { shortcutFixture } from './shortcut-fixture'

test('modal actions update one flag and notify once per transition', () => {
  const onChange = vi.fn()
  const store = createModalStore(onChange)
  expect(store.modalState).toEqual({
    isAboutModalVisible: false,
    isPrivacyModalVisible: false,
    isToolsAndCategoriesModalVisible: false,
  })
  for (const [show, hide, flag] of [
    ['showAboutModal', 'hideAboutModal', 'isAboutModalVisible'],
    ['showPrivacyModal', 'hidePrivacyModal', 'isPrivacyModalVisible'],
    [
      'showToolsAndCategoriesModal',
      'hideToolsAndCategoriesModal',
      'isToolsAndCategoriesModalVisible',
    ],
  ] as const) {
    store[show]()
    expect(store.modalState[flag]).toBe(true)
    store[hide]()
    expect(store.modalState[flag]).toBe(false)
  }
  expect(onChange).toHaveBeenCalledTimes(6)
  const standalone = createModalStore()
  standalone.showAboutModal()
  expect(standalone.modalState.isAboutModalVisible).toBe(true)
})

test('game store exposes session summaries and notifies after every action and restart', async () => {
  vi.useFakeTimers()
  try {
    const onChange = vi.fn()
    const store = createGameStore([shortcutFixture('one')], onChange)
    expect(store.removedShortcutExists).toBe(false)
    expect(store.isRemovedAll).toBe(false)
    expect(store.wordsOfDescriptionFilledByCorrectKeys).toEqual([
      'Meta',
      '+',
      'm',
    ])
    expect(store.wordsOfDescriptionFilledByPressedKeys).toEqual(['', '+', ''])
    expect(store.needsFullscreenMode).toBe(false)
    expect(store.countsOfEachStatus.unanswered.included).toBe(1)
    expect(store.masteredRateOfEachTool().length).toBeGreaterThan(0)
    expect(store.categoriesWithMasteredRate('missing')).toEqual([])
    store.keyDown({
      altKey: false,
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      key: 'm',
    })
    expect(onChange).toHaveBeenCalledOnce()
    await vi.runOnlyPendingTimersAsync()
    expect(onChange).toHaveBeenCalledTimes(2)
    const standalone = createGameStore([])
    standalone.onFullscreenchange()
    expect(standalone.isRemovedAll).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})

test('production game store notifies only after the full feedback delay', async () => {
  vi.stubEnv('MODE', 'production')
  vi.useFakeTimers()
  try {
    const onChange = vi.fn()
    const store = createGameStore([shortcutFixture('delayed')], onChange)
    store.keyDown({
      altKey: false,
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      key: 'm',
    })
    await vi.advanceTimersByTimeAsync(999)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(store.state.isListeningKeyboardEvent).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(store.state.isListeningKeyboardEvent).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})
