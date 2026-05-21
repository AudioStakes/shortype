import { h } from 'preact'

import App from '@/App'
import { click, render } from './dom-helpers'

test('show an unsupported message when a client is unsupported', async () => {
  const userAgentWithFireFoxAndMac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: userAgentWithFireFoxAndMac,
  })

  const { container, getByText } = render(h(App, {}))

  expect(container.textContent).toContain(
    'サポートされている ブラウザをご使用ください',
  )

  await click(getByText('閉じる'))

  expect(container.textContent).not.toContain(
    'サポートされている ブラウザをご使用ください',
  )
})

test("doesn't show an unsupported message when a client is unsupported", async () => {
  const userAgentWithChromeAndMac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: userAgentWithChromeAndMac,
  })

  const { container } = render(h(App, {}))

  expect(container.textContent).not.toContain(
    'サポートされている ブラウザをご使用ください',
  )
})

test('show the modal to select a tool when the tool button on the header is pressed', async () => {
  const { getByText } = render(h(App, {}))

  await click(getByText('ツールを選ぶ'))

  getByText('ツールを選んでください')
})

test('switch a tool when the tool on the modal is selected', async () => {
  const { getByText, queryAllByText } = render(h(App, {}))

  getByText(/Google Chrome/)

  await click(getByText('ツールを選ぶ'))

  getByText('ツールを選んでください')

  await click(getByText('Terminal (macOS)'))
  await click(getByText('すべて選ぶ'))
  await click(getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  expect(queryAllByText(/Google Chrome/)).toEqual([])
  queryAllByText(/Terminal/)
})

test('show the modal about Shortype when the About link is clicked', async () => {
  const { getByText } = render(h(App, {}))

  await click(getByText('About'))

  getByText('Shortype について')
})
