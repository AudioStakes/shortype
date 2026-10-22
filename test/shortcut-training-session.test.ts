import { beforeEach, expect, test, vi } from 'vitest'
import terminalShortcuts from '@/constants/shortcuts/terminal.json'
import { createEmptyShortcut } from '@/models/empty-shortcut'
import KeyCombination from '@/models/key-combination'
import shortcutCatalog from '@/models/shortcut-catalog'
import {
  createShortcutTrainingSession,
  createShortcutTrainingState,
  type ShortcutTrainingSessionDeps,
} from '@/models/shortcut-training-session'
import type { KeyCombinable, Shortcut } from '@/types/interfaces'
import { shortcutFixture } from './shortcut-fixture'

const { fullscreenMock } = vi.hoisted(() => ({
  fullscreenMock: vi.fn(() => Promise.resolve()),
}))
vi.mock('@/utils/toggle-fullscreen', () => ({ default: fullscreenMock }))

const press = (
  key: string,
  overrides: Partial<KeyCombinable> = {},
): KeyCombinable => ({
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key,
  ...overrides,
})
const first = shortcutFixture('first')
const second = shortcutFixture('second', {
  keysDescription: '⌘+9',
  keyCombinations: [press('9', { metaKey: true })],
})
const catalog = {
  tools: [
    {
      name: 'Google Chrome',
      shortcuts: [first, second],
      categories: [{ name: 'Tabs', shortcuts: [first, second] }],
    },
  ],
}
const setup = (shortcuts: Shortcut[] = [first, second]) => {
  const callbacks: (() => void)[] = []
  const state = createShortcutTrainingState({
    tool: 'Google Chrome',
    categories: ['Tabs'],
    shortcuts,
    shortcut: shortcuts[0] ?? createEmptyShortcut(),
    removedIds: new Set(),
    answeredHistory: new Map(),
    isFullscreenMode: false,
  })
  const deps = {
    isFullscreenMode: vi.fn(() => true),
    sample: <T>(items: T[]) => items[0],
    weightedSampleKey: vi.fn(
      (weights: Map<string, number>) => [...weights.keys()][0],
    ),
    scheduleRestartTyping: vi.fn((callback: () => void) => {
      callbacks.push(callback)
    }),
    toggleFullscreen: vi.fn(),
    appendAnswer: vi.fn(),
    removeShortcut: vi.fn(),
    restoreAllShortcuts: vi.fn(),
    persistSelectedTool: vi.fn(),
    persistSelectedCategories: vi.fn(),
  } satisfies ShortcutTrainingSessionDeps
  const session = createShortcutTrainingSession(state, catalog, deps)
  const restart = () => {
    const callback = callbacks.shift()
    if (!callback) {
      throw new Error('Missing restart')
    }
    callback()
  }
  return { state, deps, session, restart }
}

beforeEach(() => vi.restoreAllMocks())

test('initial state copies selected collections and starts listening with no answer flags', () => {
  const { state } = setup()
  expect(state).toMatchObject({
    tool: 'Google Chrome',
    categories: new Set(['Tabs']),
    isListeningKeyboardEvent: true,
    isCorrectKeyPressed: false,
    isWrongKeyPressed: false,
    isRemoveKeyPressed: false,
    isSelectToolsKeyPressed: false,
    isShowCorrectKeyPressed: false,
    isMarkedSelfAsCorrect: false,
    isMarkedSelfAsWrong: false,
    isShakingKeyCombinationView: false,
    isFullscreenMode: false,
    isKeyboardLocked: false,
  })
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
})

test('unanswered questions exclude removed ids and repeated current questions', () => {
  const { state, session } = setup()
  expect(session.availableIds()).toEqual(['first', 'second'])
  expect(session.unansweredAvailableIds()).toEqual(['first', 'second'])
  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(second)
  state.removedIdSet.add('first')
  expect(session.availableIds()).toEqual(['second'])
  expect(session.removedShortcutExists()).toBe(true)
  expect(session.isRemovedAll()).toBe(false)
  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(second)
  state.removedIdSet.add('second')
  expect(session.isRemovedAll()).toBe(true)
})

test('answer results persist once while listening is paused and resume after the scheduled transition', () => {
  const { state, session, deps, restart } = setup()
  session.judge()
  expect(deps.appendAnswer).not.toHaveBeenCalled()
  session.keyDown(press('Meta', { metaKey: true }))
  expect(state.isListeningKeyboardEvent).toBe(true)
  session.keyDown(press('m', { metaKey: true }))
  expect(state.isCorrectKeyPressed).toBe(true)
  expect(state.isListeningKeyboardEvent).toBe(false)
  expect(state.answeredHistoryMap).toEqual(new Map([['first', [true]]]))
  session.keyDown(press('x'))
  session.keyUp('m')
  expect(state.pressedKeyCombination.keyCombinable.key).toBe('m')
  expect(deps.appendAnswer).toHaveBeenCalledExactlyOnceWith('first', true)
  restart()
  expect(state.shortcut).toBe(second)
  expect(state.isCorrectKeyPressed).toBe(false)
  expect(state.isListeningKeyboardEvent).toBe(true)
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
})

test('wrong then correct keeps one failed answer and retains the question until corrected', () => {
  const { state, session, restart } = setup()
  session.keyDown(press('x'))
  expect(state.isWrongKeyPressed).toBe(true)
  expect(state.isShakingKeyCombinationView).toBe(true)
  expect(state.isListeningKeyboardEvent).toBe(false)
  expect(state.answeredHistoryMap.get('first')).toEqual([false])
  restart()
  expect(state.shortcut).toBe(first)
  expect(state.isWrongKeyPressed).toBe(true)
  expect(state.isShakingKeyCombinationView).toBe(false)
  session.keyDown(press('z'))
  expect(state.answeredHistoryMap.get('first')).toEqual([false])
  session.keyDown(press('m', { metaKey: true }))
  restart()
  expect(state.shortcut).toBe(second)
  expect(state.answeredHistoryMap.get('first')).toEqual([false])
})

test.each([
  'y',
  'n',
])('unavailable answers require reveal before self scoring %s', (answer) => {
  const unavailable = shortcutFixture('unavailable', { isAvailable: false })
  const { state, session, restart } = setup([unavailable, second])
  session.keyDown(press(answer))
  expect(state.answeredHistoryMap.size).toBe(0)
  session.keyDown(press('c'))
  expect(state.isShowCorrectKeyPressed).toBe(true)
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
  session.keyDown(press(answer))
  expect(state.isListeningKeyboardEvent).toBe(false)
  expect(state.isMarkedSelfAsCorrect).toBe(answer === 'y')
  expect(state.isMarkedSelfAsWrong).toBe(answer === 'n')
  expect(state.answeredHistoryMap.get('unavailable')).toEqual([answer === 'y'])
  restart()
  expect(state.shortcut).toBe(second)
  expect(state.isShowCorrectKeyPressed).toBe(false)
  expect(state.isMarkedSelfAsCorrect).toBe(false)
  expect(state.isMarkedSelfAsWrong).toBe(false)
})

test('fullscreen shortcut reveals outside fullscreen, grades inside it, and resets pressed keys on changes', () => {
  const fullscreen = shortcutFixture('fullscreen', {
    keysDescription: '⌘+n',
    keyCombinations: [press('n', { metaKey: true })],
  })
  const { state, session } = setup([fullscreen])
  expect(session.needsFullscreenMode()).toBe(true)
  session.keyDown(press('n', { metaKey: true }))
  expect(state.answeredHistoryMap.size).toBe(0)
  session.onFullscreenchange()
  expect(state.isFullscreenMode).toBe(true)
  state.isKeyboardLocked = true
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
  expect(session.needsFullscreenMode()).toBe(false)
  session.keyDown(press('n', { metaKey: true }))
  expect(state.answeredHistoryMap.get('fullscreen')).toEqual([true])
})

const mixedTerminalShortcuts = ['78', '79'].map((id) => {
  const shortcut = terminalShortcuts.find((shortcut) => shortcut.id === id)
  if (!shortcut) {
    throw new Error(`Missing Terminal shortcut ${id}`)
  }
  return shortcut
})

test.each(
  mixedTerminalShortcuts,
)('Terminal $id ignores its reserved alternative and grades its usable alternative outside fullscreen', (shortcut) => {
  const { state, session, deps } = setup([shortcut])
  const key = shortcut.id === '78' ? 'n' : 't'
  expect(session.needsFullscreenMode()).toBe(false)

  session.keyDown(press(key, { metaKey: true }))
  expect(state.answeredHistoryMap.size).toBe(0)
  expect(state.isCorrectKeyPressed).toBe(false)
  expect(state.isWrongKeyPressed).toBe(false)
  expect(state.isListeningKeyboardEvent).toBe(true)
  expect(deps.scheduleRestartTyping).not.toHaveBeenCalled()

  session.keyDown(press(key, { ctrlKey: true, metaKey: true }))
  expect(state.answeredHistoryMap.get(shortcut.id)).toEqual([true])
  expect(deps.appendAnswer).toHaveBeenCalledExactlyOnceWith(shortcut.id, true)
})

test.each(
  mixedTerminalShortcuts.flatMap((shortcut) =>
    shortcut.keyCombinations.map((combination) => ({ shortcut, combination })),
  ),
)('Terminal $shortcut.id grades Ctrl=$combination.ctrlKey inside fullscreen', ({
  shortcut,
  combination,
}) => {
  const { state, session } = setup([shortcut])
  session.onFullscreenchange()
  state.isKeyboardLocked = true
  session.keyDown(combination)
  expect(state.answeredHistoryMap.get(shortcut.id)).toEqual([true])
})

test('a mixed shortcut still scores an unrelated wrong key once', () => {
  const shortcut = mixedTerminalShortcuts[0]
  if (!shortcut) {
    throw new Error('Missing mixed Terminal shortcut')
  }
  const { state, session, restart } = setup([shortcut])
  session.keyDown(press('x'))
  expect(state.isWrongKeyPressed).toBe(true)
  expect(state.answeredHistoryMap.get(shortcut.id)).toEqual([false])
  restart()
  session.keyDown(press('n', { ctrlKey: true, metaKey: true }))
  expect(state.isCorrectKeyPressed).toBe(true)
  expect(state.answeredHistoryMap.get(shortcut.id)).toEqual([false])
})

test.each([
  'y',
  'n',
])('reserved-only shortcuts retain reveal and manual self scoring with %s', (answer) => {
  const shortcut = shortcutFixture('reserved', {
    keyCombinations: [press('n', { metaKey: true })],
  })
  const { state, session } = setup([shortcut])
  expect(session.needsFullscreenMode()).toBe(true)
  session.keyDown(press(answer))
  expect(state.answeredHistoryMap.size).toBe(0)
  session.keyDown(press('c'))
  expect(state.isShowCorrectKeyPressed).toBe(true)
  session.keyDown(press(answer))
  expect(state.answeredHistoryMap.get('reserved')).toEqual([answer === 'y'])
})

test('mixed alternatives retain shifted punctuation normalization when finding a match', () => {
  const shortcut = shortcutFixture('punctuation', {
    keyCombinations: [
      press('n', { metaKey: true }),
      press(';', { shiftKey: true }),
    ],
  })
  const { state, session } = setup([shortcut])
  session.keyDown(press(':', { shiftKey: true }))
  expect(state.answeredHistoryMap.get('punctuation')).toEqual([true])
})

test('reserved shortcuts require an acquired keyboard lock inside fullscreen', () => {
  const shortcut = shortcutFixture('reserved', {
    keyCombinations: [press('n', { metaKey: true })],
  })
  const { state, session } = setup([shortcut])
  session.onFullscreenchange()
  expect(session.needsFullscreenMode()).toBe(true)
  session.keyDown(press('n', { metaKey: true }))
  expect(state.answeredHistoryMap.size).toBe(0)
  state.isKeyboardLocked = true
  expect(session.needsFullscreenMode()).toBe(false)
  session.keyDown(press('n', { metaKey: true }))
  expect(state.answeredHistoryMap.get('reserved')).toEqual([true])
})

test('mixed shortcuts keep their unrestricted alternative usable while fullscreen lock is pending', () => {
  const shortcut = mixedTerminalShortcuts[0]
  if (!shortcut) {
    throw new Error('Missing mixed Terminal shortcut')
  }
  const { state, session } = setup([shortcut])
  session.onFullscreenchange()
  expect(session.needsFullscreenMode()).toBe(false)
  session.keyDown(press('n', { metaKey: true }))
  expect(state.answeredHistoryMap.size).toBe(0)
  session.keyDown(press('n', { metaKey: true, ctrlKey: true }))
  expect(state.answeredHistoryMap.get(shortcut.id)).toEqual([true])
})

test.each([
  'y',
  'n',
])('revealed manual scoring stays latched after keyboard lock succeeds: %s', (answer) => {
  const shortcut = shortcutFixture('reserved', {
    keyCombinations: [press('n', { metaKey: true })],
  })
  const { state, session } = setup([shortcut])
  session.onFullscreenchange()
  session.keyDown(press('c'))
  state.isKeyboardLocked = true
  session.keyDown(press(answer))
  expect(state.isMarkedSelfAsCorrect).toBe(answer === 'y')
  expect(state.isMarkedSelfAsWrong).toBe(answer === 'n')
  expect(state.answeredHistoryMap.get('reserved')).toEqual([answer === 'y'])
})

test('remove, select-tool and fullscreen commands perform their separate effects', () => {
  const { state, session, deps, restart } = setup()
  session.keyDown(press('f'))
  expect(deps.toggleFullscreen).toHaveBeenCalledTimes(1)
  session.keyDown(press('r'))
  expect(state.removedIdSet).toEqual(new Set(['first']))
  expect(state.isRemoveKeyPressed).toBe(true)
  expect(state.isListeningKeyboardEvent).toBe(false)
  expect(deps.removeShortcut).toHaveBeenCalledExactlyOnceWith('first')
  restart()
  expect(state.shortcut).toBe(second)
  session.keyDown(press('t'))
  expect(state.isSelectToolsKeyPressed).toBe(true)
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
  expect(state.isListeningKeyboardEvent).toBe(false)
  session.exitSelectionOfToolAndCategories()
  expect(state.isSelectToolsKeyPressed).toBe(false)
  expect(state.isListeningKeyboardEvent).toBe(true)
})

test('Enter and modifier-only answers are graded when explicitly requested', () => {
  const enter = shortcutFixture('enter', { keyCombinations: [press('Enter')] })
  const { state, session } = setup([enter])
  session.keyDown(press('Enter'))
  expect(state.answeredHistoryMap.get('enter')).toEqual([true])
  const modifiers = setup([
    shortcutFixture('modifiers', {
      keyCombinations: [press('Meta', { metaKey: true })],
    }),
  ])
  modifiers.session.keyDown(press('Meta', { metaKey: true }))
  expect(modifiers.state.answeredHistoryMap.get('modifiers')).toEqual([true])
})

test('sampling answered questions guards an absent or unknown sampled id', () => {
  const { state, deps, session } = setup()
  state.answeredHistoryMap.set('first', [true])
  state.answeredHistoryMap.set('second', [false])
  deps.weightedSampleKey.mockReturnValue('second')
  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(second)
  expect(deps.weightedSampleKey).toHaveBeenCalledWith(
    new Map([
      ['first', 0.51],
      ['second', 5],
    ]),
  )
  deps.weightedSampleKey.mockReturnValue(undefined)
  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(first)
  deps.weightedSampleKey.mockReturnValue('missing')
  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(first)
})

test('an absent sampled candidate and an empty catalogue keep a concrete shortcut', () => {
  const duplicate = setup([first, { ...first }])
  duplicate.session.keyDown(press('Enter'))
  expect(duplicate.state.shortcut).toBe(first)
  const empty = setup([])
  empty.state.pressedKeyCombination.keyDown(press('Enter'))
  empty.session.judge()
  expect(empty.state.shortcut).toEqual(createEmptyShortcut())
  expect(empty.session.availableIds()).toEqual([])
  expect(empty.session.isRemovedAll()).toBe(true)
  empty.state.pressedKeyCombination.keyDown(press('Enter'))
  empty.session.keyDown(press('x'))
  empty.session.keyUp('Enter')
  expect(empty.state.pressedKeyCombination.keyCombinable.key).toBe('Enter')
})

test('description filling consumes detectable keys and preserves surrounding actions', () => {
  const { state, session } = setup([
    shortcutFixture('description', { keysDescription: '⌘+m または ⌘+9' }),
  ])
  expect(session.wordsOfDescriptionFilledByCorrectKeys()).toEqual([
    'Meta',
    '+',
    'm',
    ' または ',
    'Meta',
    '+',
    '9',
  ])
  state.pressedKeyCombination = new KeyCombination(
    press('x', { metaKey: true }),
  )
  expect(session.wordsOfDescriptionFilledByPressedKeys()).toEqual([
    'Meta',
    '+',
    'x',
    ' または ',
    '',
    '+',
    '',
  ])
  const firstCorrect = session.correctKeyCombinations()
  expect(session.correctKeyCombinations()).toBe(firstCorrect)
  state.shortcut = second
  expect(session.correctKeyCombinations()).not.toBe(firstCorrect)
})

test('selection persists choices and handles missing results and removed questions', () => {
  const { state, session, deps } = setup()
  session.selectToolAndCategories('missing', [])
  expect(state.tool).toBe('missing')
  expect(state.categories).toEqual(new Set())
  expect(state.shortcuts).toEqual([])
  expect(state.shortcut).toEqual(createEmptyShortcut())
  expect(deps.persistSelectedTool).toHaveBeenCalledWith('missing')
  expect(deps.persistSelectedCategories).toHaveBeenCalledWith([])
  session.selectToolAndCategories('Google Chrome', [])
  expect(state.shortcuts.length).toBeGreaterThan(0)
  expect(state.shortcut.app).toBe('Google Chrome')
  expect(state.isListeningKeyboardEvent).toBe(true)
  expect(session.masteredRateOfEachTool()).toEqual([
    { name: 'Google Chrome', masteredRate: 0 },
  ])
  expect(session.categoriesWithMasteredRate('Google Chrome')).toEqual([
    { name: 'Tabs', masteredRate: 0 },
  ])
  expect(session.countsOfEachStatus()).toEqual({
    mastered: { included: 0, removed: 0 },
    unmastered: { included: 0, removed: 0 },
    unanswered: { included: state.shortcuts.length, removed: 0 },
  })
})

test('restoration honors confirmation and safely restores an empty catalogue', () => {
  const { state, session, deps } = setup()
  state.removedIdSet.add('first')
  vi.stubGlobal(
    'confirm',
    vi.fn(() => false),
  )
  session.restoreRemovedShortcuts()
  expect(state.removedIdSet).toEqual(new Set(['first']))
  expect(deps.restoreAllShortcuts).not.toHaveBeenCalled()
  vi.mocked(confirm).mockReturnValue(true)
  state.isShowCorrectKeyPressed = true
  state.pressedKeyCombination.keyDown(press('x'))
  session.restoreRemovedShortcuts()
  expect(confirm).toHaveBeenCalledWith(
    'すべてのショートカットキーが出題されるようになります。\nよろしいですか？',
  )
  expect(state.isShowCorrectKeyPressed).toBe(false)
  expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
  expect(state.removedIdSet.size).toBe(0)
  expect(state.shortcut).toBe(first)
  expect(deps.restoreAllShortcuts).toHaveBeenCalledOnce()
  const empty = setup([])
  empty.session.restoreRemovedShortcuts()
  expect(empty.state.shortcut).toEqual(createEmptyShortcut())
})

test.each([
  'test',
  'production',
])('default dependencies keep a standalone training session usable in %s', async (mode) => {
  vi.stubEnv('MODE', mode)
  vi.useFakeTimers()
  try {
    const { state } = setup([first, second])
    const session = createShortcutTrainingSession(state, catalog)
    session.onFullscreenchange()
    expect(state.isFullscreenMode).toBe(false)
    fullscreenMock.mockRejectedValueOnce(new Error('Fullscreen denied'))
    session.keyDown(press('f'))
    await Promise.resolve()
    expect(fullscreenMock).toHaveBeenCalled()
    session.keyDown(press('x'))
    vi.runOnlyPendingTimers()
    session.keyDown(press('m', { metaKey: true }))
    vi.runOnlyPendingTimers()
    expect(state.answeredHistoryMap.get('first')).toEqual([false])
    session.keyDown(press('r'))
    vi.runOnlyPendingTimers()
    expect(state.removedIdSet.size).toBe(1)
    session.selectToolAndCategories('missing', [])
    expect(state.shortcut).toEqual(createEmptyShortcut())
  } finally {
    vi.useRealTimers()
  }
})

test('repeated correct answers append history and keyup releases an active key', () => {
  const { state, session, restart } = setup([first])
  state.answeredHistoryMap.set('first', [true])
  session.keyDown(press('Meta', { metaKey: true }))
  session.keyUp('Meta')
  expect(state.pressedKeyCombination.keys()).toEqual([])
  session.keyDown(press('m', { metaKey: true }))
  restart()
  expect(state.answeredHistoryMap.get('first')).toEqual([true, true])
})

test('external progress refreshes summaries and keeps the issued question until advancing', () => {
  const { state, session, deps } = setup()
  const answeredHistory = new Map([
    ['first', [false]],
    ['second', [true]],
  ])
  const removedIds = new Set(['first'])

  session.applyProgress({ answeredHistory, removedIds })

  expect(state.shortcut).toBe(first)
  expect(session.countsOfEachStatus()).toEqual({
    mastered: { included: 1, removed: 0 },
    unmastered: { included: 0, removed: 1 },
    unanswered: { included: 0, removed: 0 },
  })
  expect(session.masteredRateOfEachTool()).toEqual([
    { name: 'Google Chrome', masteredRate: 100 },
  ])
  expect(session.categoriesWithMasteredRate('Google Chrome')).toEqual([
    { name: 'Tabs', masteredRate: 100 },
  ])
  expect(deps.appendAnswer).not.toHaveBeenCalled()
  expect(deps.removeShortcut).not.toHaveBeenCalled()

  session.keyDown(press('Enter'))
  expect(state.shortcut).toBe(second)
  session.keyDown(press('9', { metaKey: true }))
  expect(state.answeredHistoryMap.get('second')).toEqual([true, true])
  expect(answeredHistory.get('second')).toEqual([true])
  state.removedIdSet.add('second')
  expect(removedIds).toEqual(new Set(['first']))
})

test('external restoration recovers an available question from an all-excluded session', () => {
  const { state, session } = setup()
  session.applyProgress({
    answeredHistory: new Map(),
    removedIds: new Set(['first', 'second']),
  })
  expect(session.isRemovedAll()).toBe(true)
  session.keyDown(press('m', { metaKey: true }))
  expect(state.answeredHistoryMap.size).toBe(0)

  session.applyProgress({
    answeredHistory: new Map(),
    removedIds: new Set(['first']),
  })
  expect(session.isRemovedAll()).toBe(false)
  expect(state.shortcut).toBe(second)
  session.keyDown(press('9', { metaKey: true }))
  expect(state.answeredHistoryMap.get('second')).toEqual([true])

  state.shortcut = createEmptyShortcut()
  session.applyProgress({ answeredHistory: new Map(), removedIds: new Set() })
  expect(state.shortcut).toBe(first)
})

test('restoring an excluded session resets prior feedback without closing tool selection', () => {
  const { state, session, restart } = setup()
  session.keyDown(press('x'))
  restart()
  expect(state.isWrongKeyPressed).toBe(true)
  session.applyProgress({
    answeredHistory: new Map([['first', [false]]]),
    removedIds: new Set(['first', 'second']),
  })
  state.isSelectToolsKeyPressed = true
  session.applyProgress({
    answeredHistory: new Map([['first', [false]]]),
    removedIds: new Set(['first']),
  })

  expect(state.shortcut).toBe(second)
  expect(state.isWrongKeyPressed).toBe(false)
  expect(state.isSelectToolsKeyPressed).toBe(true)
  session.exitSelectionOfToolAndCategories()
  session.keyDown(press('9', { metaKey: true }))
  expect(state.answeredHistoryMap.get('second')).toEqual([true])
})

const questionResets = [
  {
    name: 'tool/category selection',
    reset: ({ session }: ReturnType<typeof setup>) => {
      vi.spyOn(shortcutCatalog, 'searchShortcuts').mockReturnValue([
        first,
        second,
      ])
      session.selectToolAndCategories('Google Chrome', ['Tabs'])
    },
  },
  {
    name: 'confirmed restoration',
    reset: ({ session }: ReturnType<typeof setup>) => {
      vi.stubGlobal(
        'confirm',
        vi.fn(() => true),
      )
      session.restoreRemovedShortcuts()
    },
  },
  {
    name: 'external restoration',
    reset: ({ state, session }: ReturnType<typeof setup>) => {
      const answeredHistory = new Map(state.answeredHistoryMap)
      session.applyProgress({
        answeredHistory,
        removedIds: new Set(['first', 'second']),
      })
      session.applyProgress({
        answeredHistory,
        removedIds: new Set(['second']),
      })
    },
  },
]

test.each(
  questionResets,
)('an old advance cannot finish a new attempt after $name reissues the same shortcut', async ({
  reset,
}) => {
  vi.useFakeTimers()
  try {
    const game = setup()
    const { state, deps, session } = game
    state.removedIdSet.add('second')
    deps.scheduleRestartTyping.mockImplementation((callback) => {
      setTimeout(callback, 1000)
    })
    session.keyDown(press('m', { metaKey: true }))
    await vi.advanceTimersByTimeAsync(250)
    reset(game)
    expect(state.shortcut).toBe(first)
    expect(state.isListeningKeyboardEvent).toBe(true)
    expect(state.isCorrectKeyPressed).toBe(false)

    await vi.advanceTimersByTimeAsync(250)
    session.keyDown(press('m', { metaKey: true }))
    await vi.advanceTimersByTimeAsync(500)

    expect(state.shortcut).toBe(first)
    expect(state.isCorrectKeyPressed).toBe(true)
    expect(state.isListeningKeyboardEvent).toBe(false)
    expect(state.pressedKeyCombination.keys()).toEqual(['Meta', 'm'])
    expect(state.answeredHistoryMap.get('first')).toEqual([true, true])

    await vi.advanceTimersByTimeAsync(500)
    expect(state.isCorrectKeyPressed).toBe(false)
    expect(state.isListeningKeyboardEvent).toBe(true)
    expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
    expect(state.answeredHistoryMap.get('first')).toEqual([true, true])
  } finally {
    vi.useRealTimers()
  }
})

test.each(
  questionResets,
)('an old retry cannot resume a new wrong attempt after $name reissues the same shortcut', async ({
  reset,
}) => {
  vi.useFakeTimers()
  try {
    const game = setup()
    const { state, deps, session } = game
    state.removedIdSet.add('second')
    deps.scheduleRestartTyping.mockImplementation((callback) => {
      setTimeout(callback, 1000)
    })
    session.keyDown(press('x'))
    await vi.advanceTimersByTimeAsync(250)
    reset(game)
    expect(state.shortcut).toBe(first)
    expect(state.isListeningKeyboardEvent).toBe(true)
    expect(state.isWrongKeyPressed).toBe(false)
    expect(state.isShakingKeyCombinationView).toBe(false)

    await vi.advanceTimersByTimeAsync(250)
    session.keyDown(press('z'))
    await vi.advanceTimersByTimeAsync(500)

    expect(state.isWrongKeyPressed).toBe(true)
    expect(state.isListeningKeyboardEvent).toBe(false)
    expect(state.isShakingKeyCombinationView).toBe(true)
    expect(state.pressedKeyCombination.keys()).toEqual(['z'])
    expect(state.answeredHistoryMap.get('first')).toEqual([false, false])

    await vi.advanceTimersByTimeAsync(500)
    expect(state.isWrongKeyPressed).toBe(true)
    expect(state.isListeningKeyboardEvent).toBe(true)
    expect(state.isShakingKeyCombinationView).toBe(false)
    expect(state.pressedKeyCombination.hasPressedSomeKey()).toBe(false)
    expect(state.answeredHistoryMap.get('first')).toEqual([false, false])
  } finally {
    vi.useRealTimers()
  }
})

test('cancelling restoration lets the current answer finish its feedback delay', async () => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'confirm',
    vi.fn(() => false),
  )
  try {
    const { state, deps, session } = setup()
    state.removedIdSet.add('second')
    deps.scheduleRestartTyping.mockImplementation((callback) => {
      setTimeout(callback, 1000)
    })
    session.keyDown(press('m', { metaKey: true }))
    await vi.advanceTimersByTimeAsync(250)
    session.restoreRemovedShortcuts()
    expect(state.isCorrectKeyPressed).toBe(true)
    expect(state.isListeningKeyboardEvent).toBe(false)

    await vi.advanceTimersByTimeAsync(750)
    expect(state.isCorrectKeyPressed).toBe(false)
    expect(state.isListeningKeyboardEvent).toBe(true)
    expect(state.answeredHistoryMap.get('first')).toEqual([true])
    expect(state.removedIdSet).toEqual(new Set(['second']))
    expect(deps.restoreAllShortcuts).not.toHaveBeenCalled()
  } finally {
    vi.useRealTimers()
  }
})
