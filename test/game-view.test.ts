import { h } from 'preact'
import { act } from 'preact/test-utils'

import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
} from '@/constants/local-storage-keys'
import chromeShortcuts from '@/constants/shortcuts/chrome.json'
import macShortcuts from '@/constants/shortcuts/mac.json'
import terminalShortcuts from '@/constants/shortcuts/terminal.json'
import createModalStore from '@/stores/modal'
import ModalKey from '@/stores/modal-key'
import type { Shortcut } from '@/types/interfaces'
import Keyboard from '@/utils/keyboard'
import GameView from '@/views/GameView'

import {
  availableShortcuts,
  shortcutsOnlyAvailableInFullscreen,
  shortcutWithMultipleKeyCombinations,
  shortcutWithNonKeyActions,
  unsupportedShortcuts,
} from './data/shortcuts'
import {
  click,
  render,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from './dom-helpers'

const localStorageMock = globalThis.localStorage

const setFullscreenElement = (element: Element | null) => {
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    value: element,
  })
}

afterEach(() => {
  Reflect.deleteProperty(document, 'fullscreenElement')
  Reflect.deleteProperty(document, 'visibilityState')
})

const modifierKeys = new Set(['Meta', 'Shift', 'Control', 'Alt'])

const keyCodeByKey: Record<string, string> = {
  Alt: 'AltLeft',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Control: 'ControlLeft',
  Enter: 'Enter',
  Meta: 'MetaLeft',
  N: 'KeyN',
  R: 'KeyR',
  Shift: 'ShiftLeft',
  T: 'KeyT',
  Y: 'KeyY',
  a: 'KeyA',
  c: 'KeyC',
  n: 'KeyN',
  r: 'KeyR',
  t: 'KeyT',
  y: 'KeyY',
  '9': 'Digit9',
}

const keyFlagsByKey: Record<string, Partial<KeyboardEventInit>> = {
  Alt: { altKey: true },
  Control: { ctrlKey: true },
  Meta: { metaKey: true },
  Shift: { shiftKey: true },
}

const normalizeKey = (key: string) => {
  if (key.toLowerCase() === 'arrowleft') {
    return 'ArrowLeft'
  }
  if (key.toLowerCase() === 'arrowright') {
    return 'ArrowRight'
  }

  return key.length === 1 ? key.toLowerCase() : key
}

const dispatchKeyboardEvent = (
  type: 'keydown' | 'keyup',
  key: string,
  options: Partial<KeyboardEventInit> = {},
) => {
  const normalizedKey = normalizeKey(key)
  const event = new window.KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    code: keyCodeByKey[normalizedKey] ?? normalizedKey,
    key: normalizedKey,
    ...options,
  })

  window.dispatchEvent(event)
}

const pressKey = async (key: string) => {
  const normalizedKey = normalizeKey(key)
  const flags = keyFlagsByKey[normalizedKey] ?? {}

  dispatchKeyboardEvent('keydown', normalizedKey, flags)
  await Promise.resolve()
}

const pressChord = async (keys: string[]) => {
  const activeFlags: Partial<KeyboardEventInit> = {}

  for (const key of keys) {
    const normalizedKey = normalizeKey(key)

    if (modifierKeys.has(normalizedKey)) {
      const keyFlags = keyFlagsByKey[normalizedKey] ?? {}
      dispatchKeyboardEvent('keydown', normalizedKey, {
        ...activeFlags,
        ...keyFlags,
      })
      Object.assign(activeFlags, keyFlags)
    } else {
      dispatchKeyboardEvent('keydown', normalizedKey, activeFlags)
    }
  }

  await Promise.resolve()
}

beforeEach(() => {
  vi.spyOn(Keyboard.prototype, 'key').mockImplementation(({ key }) => key) // テストでは key の値を指定しており、修飾キーの状態やキーボードレイアウトによる key の値の変化が生じないため
})

beforeEach(() => {
  localStorageMock.clear()
})

const renderGameView = (shortcuts: readonly Shortcut[] = availableShortcuts) =>
  render(
    h(
      ModalKey.Provider,
      { value: createModalStore() },
      h(GameView, {
        shortcuts,
      }),
    ),
  )

test('show a question', () => {
  const { getByText } = renderGameView()

  expect(getByText('Google Chrome').isConnected).toBe(true)
  expect(getByText('タブとウィンドウのショートカット').isConnected).toBe(true)
  expect(getByText('からの出題').isConnected).toBe(true)
  expect(getByText('最後のタブに移動する').isConnected).toBe(true)
})

test('refreshes progress written before effects attach and unsubscribes on unmount', async () => {
  const addListener = vi.spyOn(window, 'addEventListener')
  const removeListener = vi.spyOn(window, 'removeEventListener')
  let view: ReturnType<typeof renderGameView> | undefined

  await act(() => {
    view = renderGameView()
    localStorage.setItem(SCHEMA_VERSION_KEY, '0')
    localStorage.setItem(
      REMOVED_IDS_KEY,
      JSON.stringify(availableShortcuts.map((shortcut) => shortcut.id)),
    )
  })

  expect(
    view?.getByText('出題できるショートカットキーがありません。').isConnected,
  ).toBe(true)
  const storageListener = addListener.mock.calls.find(
    ([type]) => type === 'storage',
  )?.[1]
  expect(storageListener).toBeTypeOf('function')

  view?.unmount()
  expect(removeListener).toHaveBeenCalledWith('storage', storageListener)
})

test.each([
  { keyCombination: '{Meta}', keys: ['Meta'] },
  { keyCombination: '{Shift}', keys: ['Shift'] },
  { keyCombination: '{Control}', keys: ['Control'] },
  { keyCombination: '{Alt}', keys: ['Alt'] },
  {
    keyCombination: '{Meta>}{Shift>}{Control>}{Alt}',
    keys: ['Meta', 'Shift', 'Control', 'Alt'],
  },
])('show keys of $keys when press $keyCombination', async ({
  keyCombination,
  keys,
}) => {
  const { getByTestId } = renderGameView()

  await pressChord(
    keyCombination.replace(/[{}>]/g, ' ').trim().split(/\s+/).filter(Boolean),
  )

  const pressedKeyCombination = getByTestId('pressed-key-combination')

  keys.forEach((key) => {
    expect(within(pressedKeyCombination).getByTestId(key).isConnected).toBe(
      true,
    )
  })
})

test('proceed to a next question when the correct key is pressed', async () => {
  const { getByText, getByTestId } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressChord(['Meta', '9'])
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)
})

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressChord(['Meta', 'A'])

  expect(getByTestId('correct-key-combination').isConnected).toBe(true)
})

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressChord(['Meta', 'A'])
  await waitFor(() => getByText('正解を入力してみましょう'))
  await pressChord(['Meta', '9'])
  await waitForElementToBeRemoved(getByTestId('wrong-key-pressed'))

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)
})

test('skip a question when an Enter key is pressed', async () => {
  const { getByText } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressKey('Enter')

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)
})

test('Tab navigation does not record an incorrect answer', () => {
  const { queryByTestId } = renderGameView()
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    code: 'Tab',
    cancelable: true,
  })
  window.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(false)
  expect(queryByTestId('wrong-key-pressed')).toBeNull()
  expect(localStorage.getItem(ANSWERED_HISTORY_KEY)).toBeNull()
})

test('real Tab questions remain answerable without blocking focus navigation', () => {
  const firstShortcut = availableShortcuts[0]
  if (!firstShortcut) {
    throw new Error('Missing shortcut fixture')
  }
  renderGameView([
    {
      ...firstShortcut,
      keysDescription: 'tab',
      needsFillInBlankMode: false,
      keyCombinations: [
        {
          altKey: false,
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          key: 'Tab',
        },
      ],
    },
  ])
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    code: 'Tab',
    cancelable: true,
  })
  window.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(false)
  expect(
    JSON.parse(localStorage.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toEqual({ '1': [true] })
})

test('remove a question when an R key is pressed', async () => {
  const { getByText } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressKey('r')

  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)

  await pressKey('Enter')

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)

  await pressKey('Enter')

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)
})

test('removed shortcut keys are stored in localStorage', async () => {
  const firstRender = renderGameView()

  expect(firstRender.getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressKey('r')
  await waitFor(() =>
    firstRender.getByText('ショートカットキーを入力してください...'),
  )

  expect(firstRender.getByText('ウィンドウを最小化する').isConnected).toBe(true)

  firstRender.unmount()

  const secondRender = renderGameView()
  expect(secondRender.getByText('ウィンドウを最小化する').isConnected).toBe(
    true,
  )
})

test('restore removed shortcut keys when the restore button is clicked', async () => {
  const { getByText } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressKey('r')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  expect(getByText('ウィンドウを最小化する').isConnected).toBe(true)

  vi.stubGlobal(
    'confirm',
    vi.fn(() => true),
  )
  await click(getByText('出題しないリストを空にする'))
  document.body.focus()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)
})

test('save a record of answered correctly when the correct key is pressed', async () => {
  const { getByText } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressChord(['Meta', '9'])

  expect(
    JSON.parse(localStorageMock.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toStrictEqual({ '1': [true] })
})

test('save a record of answered incorrectly when the incorrect key is pressed', async () => {
  const { getByText } = renderGameView()

  expect(getByText('最後のタブに移動する').isConnected).toBe(true)

  await pressChord(['Meta', 'A'])

  expect(
    JSON.parse(localStorageMock.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toStrictEqual({ '1': [false] })
})

test('switch a tool when the modal flow is used', async () => {
  const { getByText, queryByText } = renderGameView([
    ...chromeShortcuts,
    ...terminalShortcuts,
    ...macShortcuts,
  ])

  expect(getByText(/Google Chrome/).isConnected).toBe(true)
  expect(queryByText(/Terminal/)).toBeNull()

  await pressKey('t')
  expect(getByText('ツールを選んでください').isConnected).toBe(true)

  await click(getByText('Terminal (macOS)'))
  await waitFor(() => getByText('カテゴリーを選んでください'))

  expect(getByText('Terminal (macOS)').isConnected).toBe(true)
})

test('show the self-scoring prompt and store self evaluation for unsupported shortcuts', async () => {
  const { getByText, container } = renderGameView(unsupportedShortcuts)

  expect(getByText('開いている次のタブに移動する').isConnected).toBe(true)
  expect(getByText('正解判定に未対応のため、').isConnected).toBe(true)
  expect(container.textContent).toContain('正解を確認 & 自己採点')

  await pressKey('c')

  expect(getByText('正解した').isConnected).toBe(true)
  expect(getByText('不正解だった').isConnected).toBe(true)

  await pressKey('y')

  expect(
    JSON.parse(localStorageMock.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toStrictEqual({ '5': [true] })
})

test('store a wrong self score for unsupported shortcuts', async () => {
  const { getByText } = renderGameView(unsupportedShortcuts)

  expect(getByText('開いている次のタブに移動する').isConnected).toBe(true)

  await pressKey('c')
  await pressKey('n')

  expect(
    JSON.parse(localStorageMock.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toStrictEqual({ '5': [false] })
})

test('show multiple correct answers when a shortcut has multiple key combinations', async () => {
  const { getByText, getByTestId } = renderGameView(
    shortcutWithMultipleKeyCombinations,
  )

  expect(
    getByText('キーボード フォーカスのあるタブを左右に移動する').isConnected,
  ).toBe(true)

  await pressChord(['Meta', 'A'])

  expect(getByTestId('correct-key-combination').textContent).toContain('Right')
  expect(getByTestId('correct-key-combination').textContent).toContain('Left')
})

test.each([
  { keyCombination: ['Meta', 'ArrowLeft'] },
  { keyCombination: ['Meta', 'ArrowRight'] },
])('judge $keyCombination as correct for a multiple-combination shortcut', async ({
  keyCombination,
}) => {
  const { getByText, getByTestId } = renderGameView(
    shortcutWithMultipleKeyCombinations,
  )

  expect(
    getByText('キーボード フォーカスのあるタブを左右に移動する').isConnected,
  ).toBe(true)

  await pressChord(keyCombination)
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))
})

test('show fill-in-blank content for shortcuts with non-key actions', () => {
  const { getByText, getByTestId } = renderGameView(shortcutWithNonKeyActions)

  expect(
    getByText('リンクを新しいバックグラウンド タブで開く').isConnected,
  ).toBe(true)

  const keyElement = within(getByTestId('pressed-key-combination')).queryByText(
    /⌘/,
  )
  const nonKeyElement = within(
    getByTestId('pressed-key-combination'),
  ).queryByText(/リンクをクリック/)

  expect(keyElement).toBeNull()
  expect(nonKeyElement).toBeTruthy()
})

test('show the message to request fullscreen mode when the shortcut key is only available in fullscreen mode', () => {
  const { getByText, getByTestId } = renderGameView(
    shortcutsOnlyAvailableInFullscreen,
  )

  expect(getByText('新しいウィンドウを開く').isConnected).toBe(true)

  const pressedKeyCombination = getByTestId('pressed-key-combination')

  expect(pressedKeyCombination.textContent).toContain(
    '正解判定できるようにするため、Fで全画面モードを ONにしてください',
  )
  expect(pressedKeyCombination.textContent).toContain(
    'このまま続ける場合、Cで正解を確認 & 自己採点をお願いします',
  )
})

test('keep keyboard listeners stable across gameplay updates', async () => {
  const addSpy = vi.spyOn(window, 'addEventListener')
  const removeSpy = vi.spyOn(window, 'removeEventListener')

  const { getByText } = renderGameView()

  const initialKeydownAdds = addSpy.mock.calls.filter(
    ([type]) => type === 'keydown',
  ).length
  const initialKeyupAdds = addSpy.mock.calls.filter(
    ([type]) => type === 'keyup',
  ).length

  await pressKey('r')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  expect(addSpy.mock.calls.filter(([type]) => type === 'keydown').length).toBe(
    initialKeydownAdds,
  )
  expect(addSpy.mock.calls.filter(([type]) => type === 'keyup').length).toBe(
    initialKeyupAdds,
  )
  expect(
    removeSpy.mock.calls.filter(([type]) => type === 'keydown').length,
  ).toBe(0)
  expect(removeSpy.mock.calls.filter(([type]) => type === 'keyup').length).toBe(
    0,
  )

  addSpy.mockRestore()
  removeSpy.mockRestore()
})

test('uses available keyboard capabilities and clears released modifier keys', async () => {
  const getLayoutMap = vi.fn(() => Promise.resolve(new Map([['KeyQ', 'q']])))
  const lock = vi.fn()
  vi.stubGlobal('navigator', { keyboard: { getLayoutMap, lock } })
  const { getByTestId } = renderGameView()
  await waitFor(() => expect(getLayoutMap).toHaveBeenCalledOnce())
  expect(lock).not.toHaveBeenCalled()
  await pressKey('Meta')
  const pressed = getByTestId('pressed-key-combination')
  expect(within(pressed).queryByTestId('Meta')).not.toBeNull()
  dispatchKeyboardEvent('keyup', 'Meta')
  await waitFor(() => expect(within(pressed).queryByTestId('Meta')).toBeNull())
})

test('refreshes keyboard layout on focus and visibility, then cleans up its listeners', async () => {
  vi.spyOn(Keyboard.prototype, 'key').mockRestore()
  const getLayoutMap = vi
    .fn()
    .mockResolvedValueOnce(new Map([['KeyQ', 'x']]))
    .mockResolvedValueOnce(new Map([['KeyQ', 'z']]))
    .mockResolvedValueOnce(new Map([['KeyQ', '9']]))
  vi.stubGlobal('navigator', { keyboard: { getLayoutMap } })
  const view = renderGameView()
  await waitFor(() => expect(getLayoutMap).toHaveBeenCalledOnce())

  await act(async () => {
    window.dispatchEvent(new Event('focus'))
    await Promise.resolve()
  })
  expect(getLayoutMap).toHaveBeenCalledTimes(2)

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'hidden',
  })
  document.dispatchEvent(new Event('visibilitychange'))
  expect(getLayoutMap).toHaveBeenCalledTimes(2)
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  })
  await act(async () => {
    document.dispatchEvent(new Event('visibilitychange'))
    await Promise.resolve()
  })
  expect(getLayoutMap).toHaveBeenCalledTimes(3)

  dispatchKeyboardEvent('keydown', 'q', { code: 'KeyQ', metaKey: true })
  expect(
    JSON.parse(localStorage.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toEqual({ '1': [true] })
  view.unmount()
  window.dispatchEvent(new Event('focus'))
  document.dispatchEvent(new Event('visibilitychange'))
  expect(getLayoutMap).toHaveBeenCalledTimes(3)
})

test('training survives unexpected keyboard capability adapter rejections', async () => {
  const lock = vi.fn().mockRejectedValue(new Error('Lock unavailable'))
  vi.stubGlobal('navigator', { keyboard: { lock } })
  setFullscreenElement(document.documentElement)
  const layout = vi
    .spyOn(Keyboard.prototype, 'setKeyboardLayoutMap')
    .mockRejectedValue(new Error('Layout adapter unavailable'))
  const { getByText } = renderGameView()
  await waitFor(() => {
    expect(layout).toHaveBeenCalledOnce()
    expect(lock).toHaveBeenCalledOnce()
  })
  expect(getByText('最後のタブに移動する').isConnected).toBe(true)
})

test.each([
  'y',
  'n',
])('manual scoring remains visible after a pending keyboard lock succeeds: %s', async (answer) => {
  const lockResult = Promise.withResolvers<void>()
  const lock = vi.fn(() => lockResult.promise)
  const unlock = vi.fn()
  vi.stubGlobal('navigator', { keyboard: { lock, unlock } })
  setFullscreenElement(document.documentElement)
  const { getByText, container } = renderGameView(
    shortcutsOnlyAvailableInFullscreen,
  )
  await waitFor(() => expect(lock).toHaveBeenCalledOnce())
  expect(container.textContent).not.toContain('で全画面モードを ON')
  expect(getByText('正解判定に未対応のため、').isConnected).toBe(true)
  await pressKey('c')
  expect(getByText('正解した').isConnected).toBe(true)
  await act(async () => {
    lockResult.resolve()
    await lockResult.promise
  })
  expect(getByText('正解した').isConnected).toBe(true)
  expect(container.textContent).not.toContain('で全画面モードを ON')

  await pressKey(answer)
  expect(
    JSON.parse(localStorage.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toEqual({ '1': [answer === 'y'] })
})

test('an old mount cannot release a newer mount keyboard lock or enable its stale question', async () => {
  const oldLock = Promise.withResolvers<void>()
  const newLock = Promise.withResolvers<void>()
  const lock = vi
    .fn()
    .mockReturnValueOnce(oldLock.promise)
    .mockReturnValueOnce(newLock.promise)
  const unlock = vi.fn()
  vi.stubGlobal('navigator', { keyboard: { lock, unlock } })
  setFullscreenElement(document.documentElement)
  const oldView = renderGameView(shortcutsOnlyAvailableInFullscreen)
  await waitFor(() => expect(lock).toHaveBeenCalledOnce())
  const newView = renderGameView(shortcutsOnlyAvailableInFullscreen)
  await waitFor(() => expect(lock).toHaveBeenCalledTimes(2))
  await act(async () => {
    newLock.resolve()
    await newLock.promise
  })
  expect(newView.container.textContent).not.toContain('で全画面モードを ON')

  oldView.unmount()
  await act(async () => {
    oldLock.resolve()
    await oldLock.promise
  })
  expect(unlock).not.toHaveBeenCalled()
  expect(newView.container.textContent).not.toContain('で全画面モードを ON')
  await pressChord(['Meta', 'n'])
  expect(
    JSON.parse(localStorage.getItem(ANSWERED_HISTORY_KEY) ?? '{}'),
  ).toEqual({ '1': [true] })
  newView.unmount()
  expect(unlock).toHaveBeenCalledOnce()
})

test('fullscreen-only questions allow self scoring when fullscreen is unavailable', async () => {
  const { container, getByText } = renderGameView(
    shortcutsOnlyAvailableInFullscreen,
  )
  expect(container.textContent).toContain('で全画面モードを ON')
  await pressKey('c')
  expect(getByText('正解した').isConnected).toBe(true)
  expect(container.textContent).not.toContain('で全画面モードを ON')
})
