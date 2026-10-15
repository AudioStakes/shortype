import { h } from 'preact'

import App from '@/App'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
} from '@/constants/local-storage-keys'
import chromeShortcuts from '@/constants/shortcuts/chrome.json'
import { click, render, waitFor } from './dom-helpers'

beforeEach(() => localStorage.clear())

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

  await click(getByText('ツールを選ぶ'))
  getByText('ツールを選んでください')
})

test('show the modal about Shortype when the About link is clicked', async () => {
  const { getByText } = render(h(App, {}))

  await click(getByText('About'))

  getByText('Shortype について')
})

test('About pauses game shortcuts until its dialog is closed', async () => {
  const { container, getByText } = render(h(App, {}))
  const initialQuestion = container.querySelector('h2[aria-live]')?.textContent
  await click(getByText('About'))
  const event = new KeyboardEvent('keydown', {
    key: 'r',
    code: 'KeyR',
    cancelable: true,
  })
  window.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(false)
  expect(localStorage.getItem(ANSWERED_HISTORY_KEY)).toBeNull()
  expect(container.querySelector('h2[aria-live]')?.textContent).toBe(
    initialQuestion,
  )
})

test('the header can switch tools after every current shortcut is removed', async () => {
  localStorage.setItem(SCHEMA_VERSION_KEY, '0')
  localStorage.setItem(
    REMOVED_IDS_KEY,
    JSON.stringify(chromeShortcuts.map(({ id }) => id)),
  )
  const { getByText } = render(h(App, {}))
  getByText('出題できるショートカットキーがありません。')
  await click(getByText('ツールを選ぶ'))
  getByText('ツールを選んでください')
})

test('mastery details can be toggled by their accessible chart control', async () => {
  const { container } = render(h(App, {}))
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-controls]',
  )
  expect(trigger).not.toBeNull()
  if (!trigger) throw new Error('Missing mastery details button')
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  await click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  expect(
    document.getElementById(trigger.getAttribute('aria-controls') ?? '')
      ?.textContent,
  ).toContain('未回答')
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  await Promise.resolve()
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
})

test('a chart click pins hovered details and Escape closes them', async () => {
  const { container } = render(h(App, {}))
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-controls]',
  )
  if (!trigger?.parentElement) throw new Error('Missing mastery details button')
  const chart = trigger.parentElement
  chart.dispatchEvent(
    new PointerEvent('pointerenter', { pointerType: 'mouse' }),
  )
  await waitFor(() =>
    expect(trigger.getAttribute('aria-expanded')).toBe('true'),
  )
  await click(trigger)
  chart.dispatchEvent(
    new PointerEvent('pointerleave', { pointerType: 'mouse' }),
  )
  await waitFor(() =>
    expect(trigger.getAttribute('aria-expanded')).toBe('true'),
  )
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  await waitFor(() =>
    expect(trigger.getAttribute('aria-expanded')).toBe('false'),
  )
  expect(localStorage.getItem(ANSWERED_HISTORY_KEY)).toBeNull()
})
