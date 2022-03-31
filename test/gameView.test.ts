import userEvent from '@testing-library/user-event'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/vue'

import Keyboard from '@/keyboard'
import { loadAnsweredHistory } from '@/utils'
import GameView from '@/views/GameView.vue'

import {
  availableShortcuts,
  shortcutWithMultipleKeyCombinations,
  shortcutWithNonKeyActions,
  unsupportedShortcuts,
} from './data/shortcuts'

let mockStorage: { [key: string]: string } = {}

beforeAll(() => {
  vi.spyOn(Keyboard.prototype, 'key').mockImplementation(({ key }) => key) // テストでは key の値を指定しており、修飾キーの状態やキーボードレイアウトによる key の値の変化が生じないため

  global.localStorage.setItem = vi.fn((key, value) => {
    mockStorage[key] = value
  })
  global.localStorage.getItem = vi.fn((key) => mockStorage[key])
})

beforeEach(() => {
  mockStorage = {}
})

test('show a question', () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('Google Chrome | タブとウィンドウのショートカット')
  getByText('最後のタブに移動する')
})

test.each([
  { keyCombination: '{A}', keys: ['a'] },
  { keyCombination: '{Meta>}{A}', keys: ['Meta', 'a'] },
  { keyCombination: '{Shift>}{A}', keys: ['Shift', 'a'] },
  { keyCombination: '{Control>}{A}', keys: ['Control', 'a'] },
  { keyCombination: '{Alt>}{A}', keys: ['Alt', 'a'] },
  {
    keyCombination: '{Meta>}{Shift>}{Control>}{Alt>}{A}',
    keys: ['Meta', 'Shift', 'Control', 'Alt', 'a'],
  },
])(
  'show keys of $keys when press $keyCombination',
  async ({ keyCombination, keys }) => {
    const { getByTestId } = render(GameView, {
      props: { shortcuts: availableShortcuts },
    })

    await userEvent.keyboard(keyCombination)

    const pressedKeyCombination = getByTestId('pressed-key-combination')

    keys.forEach((key) => {
      within(pressedKeyCombination).getByTestId(key)
    })
  }
)

test('proceed to a next question when the correct key is pressed', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{9}') // 正解を入力
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed')) // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する') // 次の質問
})

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{A}') // 不正解を入力

  getByTestId('correct-key-combination') // 正解が表示
})

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{A}') // 不正解を入力
  await waitFor(() => getByText('正解を入力してみましょう')) // 不正解入力時のアニメーションの終了を待つ
  await userEvent.keyboard('{Meta>}{9}') // 正解を入力
  await waitForElementToBeRemoved(getByTestId('wrong-key-pressed')) // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する')
})

test('skip a question when an Enter key is pressed', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Enter}')

  getByText('ウィンドウを最小化する')
})

test('remove a question when an R key is pressed', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{R}')

  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  await userEvent.keyboard('{Enter}')

  getByText('ウィンドウを最小化する')

  await userEvent.keyboard('{Enter}')

  getByText('ウィンドウを最小化する')
})

test('removed shortcut keys are stored in localStorage', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{R}')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  window.location.reload()

  getByText('ウィンドウを最小化する')
})

test('restore removed shortcut keys when the restore button is clicked', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{R}')
  await waitFor(() => getByText('ショートカットキーを入力してください...'))

  getByText('ウィンドウを最小化する')

  window.confirm = vi.fn(() => true)
  await userEvent.click(screen.getByText('出題しないリストを空にする'))
  document.body.focus()

  getByText('最後のタブに移動する')
})

test('save a record of answered correctly when the correct key is pressed', () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  userEvent.keyboard('{Meta>}{9}')

  expect(loadAnsweredHistory().get(availableShortcuts[0].id)).toStrictEqual([
    true,
  ])
})

test('save a record of answered incorrectly when the incorrect key is pressed', () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')

  userEvent.keyboard('{Meta>}{A}')

  expect(loadAnsweredHistory().get(availableShortcuts[0].id)).toStrictEqual([
    false,
  ])
})

test('increase the frequency of the shortcut keys answered incorrectly', async () => {
  const { getByText, getByTestId, queryByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')
  await userEvent.keyboard('{Meta>}{9}') // 正解
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  getByText('ウィンドウを最小化する')
  await userEvent.keyboard('{Meta>}{9}') // 不正解
  await waitFor(() => getByText('正解を入力してみましょう'))

  let frequencyOfShortcutAnsweredIncorrectly = 0
  for (let i = 0; i < 100; i++) {
    await userEvent.keyboard('{Enter}')

    if (queryByText('ウィンドウを最小化する')) {
      frequencyOfShortcutAnsweredIncorrectly++
    }
  }

  expect(frequencyOfShortcutAnsweredIncorrectly).toBeGreaterThan(70) // 頻度の差を示しつつ、ほぼ必ず成功する値とした
})

test('show an unanswered shortcut key as the highest priority', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText('最後のタブに移動する')
  await userEvent.keyboard('{Meta>}{9}')
  await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))

  getByText('ウィンドウを最小化する')

  await userEvent.keyboard('{Enter}')

  getByText('ウィンドウを最小化する')
})

test('show the current mastered ratio', async () => {
  const { getByText, container } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  expect(container.querySelector('svg')?.textContent?.trim()).toEqual('0 %')
  getByText('最後のタブに移動する')
  await userEvent.keyboard('{Meta>}{9}')

  expect(container.querySelector('svg')?.textContent?.trim()).toEqual('50 %')
})

test('show the modal to select a tool when the tool key is pressed', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  await userEvent.keyboard('{T}')

  getByText('ツールを選択してください')
})

test('switch a tool when the tool on the modal is clicked', async () => {
  const { getByText, queryByText } = render(GameView, {
    props: { shortcuts: availableShortcuts },
  })

  getByText(/Google Chrome/)

  await userEvent.keyboard('{T}')

  getByText('ツールを選択してください')

  await userEvent.click(screen.getByText('Terminal (macOS)'))
  document.body.focus()

  expect(queryByText(/Google Chrome/)).toBeNull()
  getByText(/Terminal/)
})

test('show the message to confirm the correct answer when the question is an unsupported shortcut key ', () => {
  const { getByText, container } = render(GameView, {
    props: { shortcuts: unsupportedShortcuts },
  })

  getByText('新しいウィンドウを開く')

  getByText('正解判定に未対応のため、')
  expect(
    container.querySelector('[data-testid="pressed-key-combination"]')
      ?.textContent
  ).toContain('Cで正解を確認 & 自己採点')
  getByText('をお願いします')
})

test('show the correct shortcut key when the c key is pressed for an unsupported shortcut key', async () => {
  const { getByTestId } = render(GameView, {
    props: { shortcuts: unsupportedShortcuts },
  })

  await userEvent.keyboard('{C}')

  getByTestId('correct-key-combination')
})

test('present options for self-scoring when the c key is pressed for the unsupported shortcut key', async () => {
  const { getByText } = render(GameView, {
    props: { shortcuts: unsupportedShortcuts },
  })

  await userEvent.keyboard('{C}')

  getByText('正解した')
  getByText('不正解だった')
})

test('save a record of answered correctly when mark self as correct for the unsupported shortcut key', () => {
  render(GameView, {
    props: { shortcuts: unsupportedShortcuts },
  })

  userEvent.keyboard('{C}')
  userEvent.keyboard('{Y}')

  expect(loadAnsweredHistory().get(unsupportedShortcuts[0].id)).toStrictEqual([
    true,
  ])
})

test('save a record of answered wrongly when mark self as wrong for the unsupported shortcut key', () => {
  render(GameView, {
    props: { shortcuts: unsupportedShortcuts },
  })

  userEvent.keyboard('{C}')
  userEvent.keyboard('{N}')

  expect(loadAnsweredHistory().get(unsupportedShortcuts[0].id)).toStrictEqual([
    false,
  ])
})

test('show multiple correct answers when a shortcut key has multiple key combinations', async () => {
  const { getByText, container } = render(GameView, {
    props: { shortcuts: shortcutWithMultipleKeyCombinations },
  })

  getByText('キーボード フォーカスのあるタブを左右に移動する')

  await userEvent.keyboard('{Meta>}{A}') // 不正解を入力

  expect(
    container
      .querySelector('[data-testid="correct-key-combination"]')
      ?.textContent?.trim()
  ).toContain('Command ⌘+Right →もしくはCommand ⌘+Left ←')
})

test.each([
  { keyCombination: '{Meta>}{arrowleft}' },
  { keyCombination: '{Meta>}{arrowright}' },
])(
  'judge $keyCombination as correct when a shortcut key has multiple key combinations including $keyCombination',
  async ({ keyCombination }) => {
    const { getByText, getByTestId } = render(GameView, {
      props: { shortcuts: shortcutWithMultipleKeyCombinations },
    })

    getByText('キーボード フォーカスのあるタブを左右に移動する')

    await userEvent.keyboard(keyCombination)
    await waitForElementToBeRemoved(getByTestId('correct-key-pressed'))
  }
)

test('show a fill-in-blank question when a shortcut key has non-key actions', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: shortcutWithNonKeyActions },
  })

  getByText('リンクを新しいバックグラウンド タブで開く')

  const keyElement = within(getByTestId('pressed-key-combination')).queryByText(
    /⌘/
  )
  const nonKeyElement = within(
    getByTestId('pressed-key-combination')
  ).queryByText(/リンクをクリック/)

  expect(keyElement).toBeNull()
  expect(nonKeyElement).toBeTruthy()
})

test('show a pressed key on fill-in-blank mode', async () => {
  const { getByText, getByTestId } = render(GameView, {
    props: { shortcuts: shortcutWithNonKeyActions },
  })

  getByText('リンクを新しいバックグラウンド タブで開く')

  await userEvent.keyboard('{Shift}')

  const pressedKeyElement = within(
    getByTestId('pressed-key-combination')
  ).queryByText(/Shift/)

  expect(pressedKeyElement).toBeTruthy()
})
