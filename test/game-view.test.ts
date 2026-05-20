import { nextTick } from 'vue'

import { ANSWERED_HISTORY_KEY } from '@/constants/local-storage-keys'
import createModalStore from '@/stores/modal'
import ModalKey from '@/stores/modal-key'
import Keyboard from '@/utils/keyboard'
import LocalStorage from '@/utils/local-storage'
import GameView from '@/views/GameView.vue'

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

  await nextTick()
  dispatchKeyboardEvent('keydown', normalizedKey, flags)
  await nextTick()
}

const pressChord = async (keys: string[]) => {
  const activeFlags: Partial<KeyboardEventInit> = {}

  await nextTick()
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

  await nextTick()
}

beforeAll(() => {
  vi.spyOn(Keyboard.prototype, 'key').mockImplementation(({ key }) => key) // テストでは key の値を指定しており、修飾キーの状態やキーボードレイアウトによる key の値の変化が生じないため
})

beforeEach(() => {
  localStorageMock.clear()
})

const renderGameView = (props: object = { shortcuts: availableShortcuts }) => {
  return render(GameView, {
    props,
    global: {
      provide: {
        [ModalKey as symbol]: createModalStore(),
      },
    },
  })
}

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

  await pressChord(['Meta', '9']) // 正解を入力
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed')) // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する') // 次の質問
})

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', 'A']) // 不正解を入力

  getByTestId('correct-key-combination') // 正解が表示
})

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', 'A']) // 不正解を入力
  await waitFor(() => getByText('正解を入力してみましょう')) // 不正解入力時のアニメーションの終了を待つ
  await pressChord(['Meta', '9']) // 正解を入力
  await waitForElementToBeRemoved(getByTestId('wrong-key-pressed')) // 正解アイコンが非表示になるまで待つ

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
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressKey('r')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  window.location.reload()

  getByText('ウィンドウを最小化する')
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

test('save a record of answered correctly when the correct key is pressed', async () => {
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', '9'])

  expect(
    new Map(Object.entries(LocalStorage.get(ANSWERED_HISTORY_KEY))).get(
      availableShortcuts[0].id,
    ),
  ).toStrictEqual([true])
})

test('save a record of answered incorrectly when the incorrect key is pressed', async () => {
  const { getByText } = renderGameView()

  getByText('最後のタブに移動する')

  await pressChord(['Meta', 'A'])

  expect(
    new Map(Object.entries(LocalStorage.get(ANSWERED_HISTORY_KEY))).get(
      availableShortcuts[0].id,
    ),
  ).toStrictEqual([false])
})

test('increase the frequency of the shortcut keys answered incorrectly', async () => {
  const { getByText, getByTestId, queryByText } = renderGameView()

  getByText('最後のタブに移動する')
  await pressChord(['Meta', '9']) // 正解
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  getByText('ウィンドウを最小化する')
  await pressChord(['Meta', '9']) // 不正解
  await waitFor(() => getByText('正解を入力してみましょう'))

  let frequencyOfShortcutAnsweredIncorrectly = 0
  for (let i = 0; i < 100; i++) {
    await pressKey('Enter')

    if (queryByText('ウィンドウを最小化する')) {
      frequencyOfShortcutAnsweredIncorrectly++
    }
  }

  expect(frequencyOfShortcutAnsweredIncorrectly).toBeGreaterThan(70) // 頻度の差を示しつつ、ほぼ必ず成功する値とした
})

test('show an unanswered shortcut key as the highest priority', async () => {
  const { getByText, getByTestId } = renderGameView()

  getByText('最後のタブに移動する')
  await pressChord(['Meta', '9'])
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  getByText('ウィンドウを最小化する')

  await pressKey('Enter')

  getByText('ウィンドウを最小化する')
})

test('show the current mastered ratio', async () => {
  const { getByText, container } = renderGameView()

  expect(container.querySelector('svg > text')?.textContent?.trim()).toEqual(
    '0 %',
  )
  getByText('最後のタブに移動する')
  await pressChord(['Meta', '9'])

  expect(container.querySelector('svg > text')?.textContent?.trim()).toEqual(
    '50 %',
  )
})

test('show the modal to select a tool when the tool key is pressed', async () => {
  const { getByText } = renderGameView()

  await pressKey('t')

  getByText('ツールを選んでください')
})

test('switch a tool when the tool on the modal is selected', async () => {
  const { getByText, queryByText } = renderGameView()

  getByText(/Google Chrome/)
  expect(queryByText(/Terminal/)).toBeNull()

  await pressKey('t')

  getByText('ツールを選んでください')

  await click(getByText('Terminal (macOS)'))
  await click(getByText('すべて選ぶ'))
  await click(getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  expect(queryByText(/Google Chrome/)).toBeNull()
  getByText(/Terminal/)
})

test('select a category when the category on the modal is clicked', async () => {
  const { getByText, getByTestId, queryByText } = renderGameView()

  getByText(/Google Chrome/)
  getByText(/タブとウィンドウのショートカット/)

  await pressKey('t')

  getByText('ツールを選んでください')

  await click(within(getByTestId('modal')).getByText('Google Chrome'))

  getByText('カテゴリーを選んでください')

  await click(getByText('すべての選択を外す'))
  await click(getByText('アドレスバーのショートカット'))
  await click(getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  expect(queryByText(/タブとウィンドウのショートカット/)).toBeNull()
  getByText(/アドレスバーのショートカット/)
})

test('save a selected tool to localStorage when the tool is selected and start training', async () => {
  const { getByText, queryByText } = renderGameView()

  getByText(/Google Chrome/)
  expect(queryByText(/Terminal/)).toBeNull()

  await pressKey('t')
  await click(getByText('Terminal (macOS)'))
  await click(getByText('すべて選ぶ'))
  await click(getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  expect(queryByText(/Google Chrome/)).toBeNull()
  getByText(/Terminal/)

  window.location.reload()

  expect(queryByText(/Google Chrome/)).toBeNull()
  getByText(/Terminal/)
})

test('save selected categories to localStorage when categories is selected and start training', async () => {
  const { getByText, getByTestId, queryByText } = renderGameView()

  getByText(/タブとウィンドウのショートカット/)
  expect(queryByText(/アドレスバーのショートカット/)).toBeNull()

  await pressKey('t')
  await click(within(getByTestId('modal')).getByText('Google Chrome'))
  await click(getByText('すべての選択を外す'))
  await click(getByText('アドレスバーのショートカット'))
  await click(getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  getByText(/アドレスバーのショートカット/)
  expect(queryByText(/タブとウィンドウのショートカット/)).toBeNull()

  window.location.reload()

  getByText(/アドレスバーのショートカット/)
  expect(queryByText(/タブとウィンドウのショートカット/)).toBeNull()
})

test('show the message to confirm the correct answer when the question is an unsupported shortcut key ', () => {
  const { getByText, container } = renderGameView({
    shortcuts: unsupportedShortcuts,
  })

  getByText('開いている次のタブに移動する')

  getByText('正解判定に未対応のため、')
  expect(
    container.querySelector('[data-testid="pressed-key-combination"]')
      ?.textContent,
  ).toContain('Cで正解を確認 & 自己採点')
  getByText('をお願いします')
})

test('show the correct shortcut key when the c key is pressed for an unsupported shortcut key', async () => {
  const { getByTestId } = renderGameView({ shortcuts: unsupportedShortcuts })

  await pressKey('c')

  getByTestId('correct-key-combination')
})

test('present options for self-scoring when the c key is pressed for the unsupported shortcut key', async () => {
  const { getByText } = renderGameView({ shortcuts: unsupportedShortcuts })

  await pressKey('c')

  getByText('正解した')
  getByText('不正解だった')
})

test('save a record of answered correctly when mark self as correct for the unsupported shortcut key', async () => {
  renderGameView({ shortcuts: unsupportedShortcuts })

  await pressKey('c')
  await pressKey('y')

  expect(
    new Map(Object.entries(LocalStorage.get(ANSWERED_HISTORY_KEY))).get(
      unsupportedShortcuts[0].id,
    ),
  ).toStrictEqual([true])
})

test('save a record of answered wrongly when mark self as wrong for the unsupported shortcut key', async () => {
  renderGameView({ shortcuts: unsupportedShortcuts })

  await pressKey('c')
  await pressKey('n')

  expect(
    new Map(Object.entries(LocalStorage.get(ANSWERED_HISTORY_KEY))).get(
      unsupportedShortcuts[0].id,
    ),
  ).toStrictEqual([false])
})

test('show multiple correct answers when a shortcut key has multiple key combinations', async () => {
  const { getByText, container } = renderGameView({
    shortcuts: shortcutWithMultipleKeyCombinations,
  })

  getByText('キーボード フォーカスのあるタブを左右に移動する')

  await pressChord(['Meta', 'A']) // 不正解を入力

  expect(
    container
      .querySelector('[data-testid="correct-key-combination"]')
      ?.textContent?.trim(),
  ).toContain('Command⌘+Right→もしくはCommand⌘+Left←')
})

test.each([
  { keyCombination: '{Meta>}{arrowleft}' },
  { keyCombination: '{Meta>}{arrowright}' },
])('judge $keyCombination as correct when a shortcut key has multiple key combinations including $keyCombination', async ({
  keyCombination,
}) => {
  const { getByText, getByTestId } = renderGameView({
    shortcuts: shortcutWithMultipleKeyCombinations,
  })

  getByText('キーボード フォーカスのあるタブを左右に移動する')

  await pressChord(
    keyCombination.replace(/[{}>]/g, ' ').trim().split(/\s+/).filter(Boolean),
  )
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))
})

test('show a fill-in-blank question when a shortcut key has non-key actions', async () => {
  const { getByText, getByTestId } = renderGameView({
    shortcuts: shortcutWithNonKeyActions,
  })

  getByText('リンクを新しいバックグラウンド タブで開く')

  const keyElement = within(getByTestId('pressed-key-combination')).queryByText(
    /⌘/,
  )
  const nonKeyElement = within(
    getByTestId('pressed-key-combination'),
  ).queryByText(/リンクをクリック/)

  expect(keyElement).toBeNull()
  expect(nonKeyElement).toBeTruthy()
})

test('show a pressed key on fill-in-blank mode', async () => {
  const { getByText, getByTestId } = renderGameView({
    shortcuts: shortcutWithNonKeyActions,
  })

  getByText('リンクを新しいバックグラウンド タブで開く')

  await pressKey('Shift')

  const pressedKeyElement = within(
    getByTestId('pressed-key-combination'),
  ).queryByText(/Shift/)

  expect(pressedKeyElement).toBeTruthy()
})

test('show the message to request fullscreen mode when the shortcut key is only available in fullscreen mode', async () => {
  const { getByText, getByTestId } = renderGameView({
    shortcuts: shortcutsOnlyAvailableInFullscreen,
  })

  getByText('新しいウィンドウを開く')

  const pressedKeyCombination = getByTestId('pressed-key-combination')

  expect(pressedKeyCombination.textContent).toContain(
    '正解判定できるようにするため、Fで全画面モードを ONにしてください',
  )
  expect(pressedKeyCombination.textContent).toContain(
    'このまま続ける場合、Cで正解を確認 & 自己採点をお願いします',
  )
})
