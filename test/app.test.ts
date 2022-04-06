import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import App from '@/App.vue'

test('show an unsupported message when a client is unsupported', async () => {
  const userAgentWithFireFoxAndMac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:97.0) Gecko/20100101 Firefox/97.0'
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgentWithFireFoxAndMac,
  })

  const { container } = render(App)

  expect(container.textContent).toContain(
    'サポートされている ブラウザ をご使用ください'
  )

  await userEvent.click(screen.getByText('閉じる'))

  expect(container.textContent).not.toContain(
    'サポートされている ブラウザ をご使用ください'
  )
})

test("doesn't show an unsupported message when a client is unsupported", async () => {
  const userAgentWithChromeAndMac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgentWithChromeAndMac,
  })

  const { container } = render(App)

  expect(container.textContent).not.toContain(
    'サポートされている ブラウザ をご使用ください'
  )
})

test('show the modal to select a tool when the tool button on the header is pressed', async () => {
  const { getByText } = render(App)

  await userEvent.click(screen.getByText('ツールを選ぶ'))

  getByText('ツールを選んでください')
})

test('switch a tool when the tool on the modal is selected', async () => {
  const { getByText, queryAllByText } = render(App)

  getByText(/Google Chrome/)

  await userEvent.click(screen.getByText('ツールを選ぶ'))

  getByText('ツールを選んでください')

  await userEvent.click(screen.getByText('Terminal (macOS)'))
  await userEvent.click(screen.getByText('すべて選ぶ'))
  await userEvent.click(screen.getByText('選んだカテゴリーの練習をはじめる'))
  document.body.focus()

  expect(queryAllByText(/Google Chrome/)).toEqual([])
  queryAllByText(/Terminal/)
})

test('show the modal about Shortype when the About link is clicked', async () => {
  const { getByText } = render(App)

  await userEvent.click(screen.getByText('About'))

  getByText('Shortype について')
})
