import { h } from 'preact'

import createModalStore from '@/stores/modal'
import ModalKey from '@/stores/modal-key'
import type { Shortcut } from '@/types/interfaces'
import Keyboard from '@/utils/keyboard'
import GameView from '@/views/GameView'

import { availableShortcuts } from './data/shortcuts'
import {
  click,
  render,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from './dom-helpers'

const localStorageMock = globalThis.localStorage

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
  if (key.toLowerCase() === 'arrowleft') return 'ArrowLeft'
  if (key.toLowerCase() === 'arrowright') return 'ArrowRight'

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

beforeAll(() => {
  vi.spyOn(Keyboard.prototype, 'key').mockImplementation(({ key }) => key) // テストでは key の値を指定しており、修飾キーの状態やキーボードレイアウトによる key の値の変化が生じないため
})

beforeEach(() => {
  localStorageMock.clear()
})

const renderGameView = () =>
  render(
    h(
      ModalKey.Provider,
      { value: createModalStore() },
      h(GameView, {
        shortcuts: availableShortcuts as unknown as readonly Shortcut[],
      }),
    ),
  )

test('show a question', () => {
  const { getByText } = renderGameView()

  getByText('Google Chrome')
  getByText('タブとウィンドウのショートカット')
  getByText('からの出題')
  getByText('最後のタブに移動する')
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
    within(pressedKeyCombination).getByTestId(key)
  })
})

test('proceed to a next question when the correct key is pressed', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', '9'])
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  getByText('ウィンドウを最小化する')
})

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', 'A'])

  getByTestId('correct-key-combination')
})

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', 'A'])
  await waitFor(() => getByText('正解を入力してみましょう'))
  await pressChord(['Meta', '9'])
  await waitForElementToBeRemoved(getByTestId('wrong-key-pressed'))

  getByText('ウィンドウを最小化する')
})

test('skip a question when an Enter key is pressed', async () => {
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressKey('Enter')

  getByText('ウィンドウを最小化する')
})

test('remove a question when an R key is pressed', async () => {
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressKey('r')

  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  await pressKey('Enter')

  getByText('ウィンドウを最小化する')

  await pressKey('Enter')

  getByText('ウィンドウを最小化する')
})

test('removed shortcut keys are stored in localStorage', async () => {
  const firstRender = renderGameView()

  firstRender.getByText('最後のタブに移動する')

  await pressKey('r')
  await waitFor(() =>
    firstRender.getByText('ショートカットキーを入力してください...'),
  )

  firstRender.getByText('ウィンドウを最小化する')

  firstRender.unmount()

  const secondRender = renderGameView()
  secondRender.getByText('ウィンドウを最小化する')
})

test('restore removed shortcut keys when the restore button is clicked', async () => {
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressKey('r')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  window.confirm = vi.fn(() => true)
  await click(getByText('出題しないリストを空にする'))
  document.body.focus()

  getByText('最後のタブに移動する')
})
