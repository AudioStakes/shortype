import { expect, test, vi } from 'vitest'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
} from '@/constants/local-storage-keys'
import createGameStore from '@/stores/game'
import { createGameSessionStoragePersistence } from '@/stores/game-session-storage'
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

test('game progress subscriptions notify same-page stores and stop updating after cleanup', () => {
  const onChange = vi.fn()
  const store = createGameStore([shortcutFixture('shared')], onChange)
  const stopSync = store.startProgressSync()
  const persistence = createGameSessionStoragePersistence()
  onChange.mockClear()

  try {
    persistence.appendAnswer('shared', true)

    expect(store.state.answeredHistoryMap.get('shared')).toEqual([true])
    expect(store.countsOfEachStatus.mastered.included).toBe(1)
    expect(onChange).toHaveBeenCalled()
  } finally {
    stopSync()
  }
  onChange.mockClear()
  persistence.appendAnswer('shared', false)

  expect(store.state.answeredHistoryMap.get('shared')).toEqual([true])
  expect(onChange).not.toHaveBeenCalled()
})

test('a subscribed game records its own answer once while keeping immediate feedback', async () => {
  vi.useFakeTimers()
  const store = createGameStore([shortcutFixture('own')])
  const stopSync = store.startProgressSync()

  try {
    store.keyDown({
      altKey: false,
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      key: 'm',
    })

    expect(store.state.isCorrectKeyPressed).toBe(true)
    expect(store.state.answeredHistoryMap.get('own')).toEqual([true])
    expect(
      JSON.parse(localStorage.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
    ).toEqual({
      own: [true],
    })

    await vi.runOnlyPendingTimersAsync()
    expect(store.state.answeredHistoryMap.get('own')).toEqual([true])
  } finally {
    stopSync()
    vi.useRealTimers()
  }
})

test('storage events refresh game summaries, exclusions, and restored questions', () => {
  const first = shortcutFixture('first')
  const second = shortcutFixture('second')
  const onChange = vi.fn()
  const store = createGameStore([first, second], onChange)
  const stopSync = store.startProgressSync()

  try {
    onChange.mockClear()
    localStorage.setItem(SCHEMA_VERSION_KEY, '0')
    localStorage.setItem(
      ANSWERED_HISTORY_KEY,
      JSON.stringify({ second: [true] }),
    )
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: ANSWERED_HISTORY_KEY,
        storageArea: null,
      }),
    )

    expect(store.state.answeredHistoryMap.get('second')).toEqual([true])
    expect(store.countsOfEachStatus.mastered.included).toBe(1)
    expect(onChange).toHaveBeenCalled()

    localStorage.setItem(REMOVED_IDS_KEY, JSON.stringify(['first']))
    window.dispatchEvent(
      new StorageEvent('storage', { key: REMOVED_IDS_KEY, storageArea: null }),
    )
    expect(store.state.shortcut).toBe(first)
    expect(store.removedShortcutExists).toBe(true)
    expect(store.countsOfEachStatus.unanswered.removed).toBe(1)

    localStorage.setItem(REMOVED_IDS_KEY, JSON.stringify(['first', 'second']))
    window.dispatchEvent(
      new StorageEvent('storage', { key: REMOVED_IDS_KEY, storageArea: null }),
    )
    expect(store.isRemovedAll).toBe(true)

    localStorage.setItem(REMOVED_IDS_KEY, JSON.stringify(['first']))
    window.dispatchEvent(
      new StorageEvent('storage', { key: REMOVED_IDS_KEY, storageArea: null }),
    )
    expect(store.isRemovedAll).toBe(false)
    expect(store.state.shortcut).toBe(second)
  } finally {
    stopSync()
  }
})
