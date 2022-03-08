import { render, screen, waitForElementToBeRemoved, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'

import App from '../src/App.vue'

const userAgentWithChromeAndMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
const userAgentWithFireFoxAndMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'

beforeAll(() => {
  Object.defineProperty(navigator, 'userAgent', { value: userAgentWithChromeAndMac })
})

test('show a question', async () => {
  const { getByText } = render(App)

  getByText('Google Chrome | タブとウィンドウのショートカット')
  getByText('最後のタブに移動する')
})

test('show a pressed key combination', async () => {
  const { getByTestId } = render(App)

  await userEvent.keyboard('{Meta>}{A}')

  const pressedKeyCombination = getByTestId('pressed-key-combination')

  within(pressedKeyCombination).getByTestId("Meta")
  within(pressedKeyCombination).getByTestId("a")
})

test('proceed to a next question when the correct key is pressed', async () => {
  const { getByText, getByTestId } = render(App)

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{9}') // 正解を入力
  await waitForElementToBeRemoved(getByTestId('check-circle-icon')) // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する') // 次の質問
})

test('show a correct answer when a wrong key is pressed', async () => {
  const { getByText, getByTestId } = render(App)

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{A}') // 不正解を入力

  getByTestId('correct-key-combination') // 正解が表示
})

test('proceed to a next question when the correct key is pressed after a wrong key', async () => {
  const { getByText, getByTestId } = render(App)

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Meta>}{A}') // 不正解を入力
  await waitFor(() => getByText('ショートカットキーを入力してください...')) // 不正解入力時のアニメーションの終了を待つ
  await userEvent.keyboard('{Meta>}{9}') // 正解を入力
  await waitForElementToBeRemoved(getByTestId('check-icon')) // 正解アイコンが非表示になるまで待つ

  getByText('ウィンドウを最小化する')
})

test('skip a question when an Enter key is pressed', async () => {
  const { getByText } = render(App)

  getByText('最後のタブに移動する')

  await userEvent.keyboard('{Enter}')

  getByText('ウィンドウを最小化する')
})

test('show an unsupported message when a client is unsupported', async () => {
  Object.defineProperty(navigator, 'userAgent', { value: userAgentWithFireFoxAndMac })

  const { container } = render(App)

  expect(container.textContent).toContain('サポートされている ブラウザ をご使用ください')

  await userEvent.click(screen.getByText('閉じる'))

  expect(container.textContent).not.toContain('サポートされている ブラウザ をご使用ください')
})
