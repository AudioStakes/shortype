import { expect, test, vi } from 'vitest'

import { createEmptyShortcut } from '@/models/empty-shortcut'
import { createShortcutTrainingState } from '@/models/shortcut-training-session'
import { createShortcutTrainingSessionEffects } from '@/models/shortcut-training-session-effects'

test('answer effects retain only the latest two results and append each answer once', () => {
  const oldHistory = [true, false, true, false]
  const state = createShortcutTrainingState({
    tool: 'Google Chrome',
    categories: [],
    shortcuts: [],
    shortcut: createEmptyShortcut(),
    removedIds: new Set(),
    answeredHistory: new Map([['id', oldHistory]]),
    isFullscreenMode: false,
  })
  const appendAnswer = vi.fn()
  const effects = createShortcutTrainingSessionEffects(
    state,
    {
      isFullscreenMode: () => false,
      sample: () => undefined,
      weightedSampleKey: () => undefined,
      scheduleRestartTyping: vi.fn(),
      toggleFullscreen: vi.fn(),
      appendAnswer,
      removeShortcut: vi.fn(),
      restoreAllShortcuts: vi.fn(),
      persistSelectedTool: vi.fn(),
      persistSelectedCategories: vi.fn(),
    },
    createEmptyShortcut,
    vi.fn(),
  )

  effects.saveResult('id', true)
  expect(state.answeredHistoryMap.get('id')).toEqual([false, true])
  effects.saveResult('id', true)
  expect(state.answeredHistoryMap.get('id')).toEqual([true, true])
  effects.saveResult('id', false)
  expect(state.answeredHistoryMap.get('id')).toEqual([true, false])
  effects.saveResult('new-id', false)
  expect(state.answeredHistoryMap.get('new-id')).toEqual([false])
  expect(appendAnswer.mock.calls).toEqual([
    ['id', true],
    ['id', true],
    ['id', false],
    ['new-id', false],
  ])
  expect(oldHistory).toEqual([true, false, true, false])
})
