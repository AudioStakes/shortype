import { createContext, h } from 'preact'
import { expect, test, vi } from 'vitest'

import App from '@/App'
import IconGlyph from '@/components/IconGlyph'
import Key from '@/components/Key'
import KeyIcons from '@/components/KeyIcons'
import KeyWithAnnotation from '@/components/KeyWithAnnotation'
import PieChart from '@/components/PieChart'
import PieChartOfMasteredRate from '@/components/PieChartOfMasteredRate'
import createGameStore from '@/stores/game'
import GameKey from '@/stores/game-key'
import Keyboard from '@/utils/keyboard'
import { useStrictContext } from '@/utils/use-strict-context'
import Unsupported from '@/views/Unsupported'

import { click, render, waitFor, within } from './dom-helpers'

test('category selection supports individual, all, none, back, submit, and cancel', async () => {
  const { container, getByText } = render(h(App, {}))
  await click(getByText('ツールを選ぶ'))
  await click(getByText('Terminal (macOS)'))
  const dialog = container.querySelector('dialog[open]')
  if (!dialog) {
    throw new Error('Missing category dialog')
  }
  const start = within(dialog).getByText('選んだカテゴリーの練習をはじめる')
  await click(within(dialog).getByText('すべての選択を外す'))
  expect(start.getAttribute('disabled')).not.toBeNull()
  const category = dialog.querySelector<HTMLButtonElement>(
    'button[aria-pressed]',
  )
  if (!category) {
    throw new Error('Missing category choice')
  }
  await click(category)
  expect(category.getAttribute('aria-pressed')).toBe('true')
  expect(start.getAttribute('disabled')).toBeNull()
  await click(category)
  expect(category.getAttribute('aria-pressed')).toBe('false')
  await click(within(dialog).getByText('すべて選ぶ'))
  expect(
    within(dialog).getByText('すべて選ぶ').getAttribute('disabled'),
  ).not.toBeNull()
  await click(within(dialog).getByText('すべての選択を外す'))
  expect(start.getAttribute('disabled')).not.toBeNull()
  await click(within(dialog).getByText('すべて選ぶ'))
  await click(start)
  expect(dialog.isConnected).toBe(false)
  expect(container.textContent).toContain('Terminal')

  await click(getByText('ツールを選ぶ'))
  await click(getByText('Terminal (macOS)'))
  const nextDialog = container.querySelector('dialog[open]')
  if (!nextDialog) {
    throw new Error('Missing reopened category dialog')
  }
  await click(within(nextDialog).getByText('ツールを選ぶ'))
  expect(
    within(nextDialog).getByText('ツールを選んでください').isConnected,
  ).toBe(true)
  nextDialog.dispatchEvent(new Event('cancel', { cancelable: true }))
  await waitFor(() => expect(nextDialog.isConnected).toBe(false))
})

test.each([
  'BrightnessDown',
  'BrightnessUp',
  'PlayerEject',
  'Power',
  'VolumeUp',
  'VolumeDown',
  'KeyboardBacklightUp',
  'KeyboardBacklightDown',
  'MissionControl',
])('renders a decorative %s key icon', (iconName) => {
  const { container } = render(
    h(KeyIcons, { iconName, class: 'custom-key-icon' }),
  )
  expect(container.getAttribute('aria-hidden')).toBe('true')
  expect(container.getAttribute('class')).toContain('custom-key-icon')
  expect(['svg', 'img']).toContain(container.tagName.toLowerCase())
})

test('unknown icons render no misleading placeholder', () => {
  const { container } = render(h(KeyIcons, { iconName: 'Unknown' }))
  expect(container.childElementCount).toBe(0)
  expect(
    render(h(KeyIcons, { iconName: 'MissionControl' })).container.getAttribute(
      'class',
    ),
  ).not.toContain('undefined')
})

test('key annotations adapt to multiline and long labels and preserve symbol fallbacks', () => {
  const long = render(h(KeyWithAnnotation, { keyName: 'Longannotationvalue' }))
  expect(long.container.className).toContain('w-[6rem]')
  expect(long.container.querySelector('span')?.className).toContain(
    'text-[0.85rem]',
  )
  const multiline = render(
    h(KeyWithAnnotation, { keyName: 'KeyboardBacklightDown' }),
  )
  expect(multiline.container.className).toContain('h-[6rem]')
  expect(multiline.container.querySelector('img')).not.toBeNull()
  expect(render(h(Key, { keyName: 'Unknown' })).container.className).toContain(
    'text-lg',
  )
  vi.spyOn(Keyboard, 'hasSymbol').mockReturnValue(true)
  vi.spyOn(Keyboard, 'symbol').mockReturnValue(undefined)
  expect(
    render(h(KeyWithAnnotation, { keyName: 'MissingSymbol' })).container
      .textContent,
  ).toContain('MissingSymbol')
})

test('complete mastery uses compact chart labels and touch never opens hover details', async () => {
  const game = {
    ...createGameStore(),
    countsOfEachStatus: {
      mastered: { included: 1, removed: 0 },
      unmastered: { included: 0, removed: 0 },
      unanswered: { included: 0, removed: 0 },
    },
  }
  const { container } = render(
    h(GameKey.Provider, { value: game }, h(PieChart, {})),
  )
  const button = container.querySelector('button')
  if (!button) {
    throw new Error('Missing mastery control')
  }
  expect(button.textContent).toContain('100%')
  expect(button.querySelector('span')?.className).toContain('tracking-tighter')
  container.dispatchEvent(
    new PointerEvent('pointerenter', { pointerType: 'touch' }),
  )
  container.dispatchEvent(
    new PointerEvent('pointerleave', { pointerType: 'touch' }),
  )
  expect(button.getAttribute('aria-expanded')).toBe('false')
  await click(button)
  button.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
  )
  expect(button.getAttribute('aria-expanded')).toBe('true')
  await click(button)
  expect(button.getAttribute('aria-expanded')).toBe('false')
  await click(button)
  button.focus()
  button.blur()
  await waitFor(() =>
    expect(button.getAttribute('aria-expanded')).toBe('false'),
  )
  expect(
    render(h(PieChartOfMasteredRate, { masteredRate: 100 })).container
      .textContent,
  ).toContain('100%')
})

test.each([
  { isUnsupportedBrowser: false, isUnsupportedOs: true, expected: 'OS' },
  {
    isUnsupportedBrowser: true,
    isUnsupportedOs: true,
    expected: 'ブラウザ・OS',
  },
])('unsupported environment explains $expected and allows proceeding', async ({
  expected,
  ...props
}) => {
  const onProceed = vi.fn()
  const { container, getByText } = render(
    h(Unsupported, { ...props, onProceed }),
  )
  expect(container.querySelector('h1')?.textContent).toContain(expected)
  await click(getByText('閉じる'))
  expect(onProceed).toHaveBeenCalledOnce()
})

test('strict contexts accept provided values and identify missing providers', () => {
  const context = createContext<string | undefined>(undefined)
  const Harness = ({ name }: { name: string | undefined }) =>
    h('span', null, useStrictContext(context, name))
  expect(() => render(h(Harness, { name: undefined }))).toThrow(
    'Could not resolve context',
  )
  expect(() => render(h(Harness, { name: 'Example' }))).toThrow(
    'Could not resolve Example',
  )
  expect(
    render(
      h(
        context.Provider,
        { value: 'resolved' },
        h(Harness, { name: undefined }),
      ),
    ).container.textContent,
  ).toBe('resolved')
})

test('all non-key decorative glyphs remain hidden from screen readers', () => {
  const { container } = render(h(IconGlyph, { name: 'check' }))
  expect(container.getAttribute('aria-hidden')).toBe('true')
  expect(container.querySelector('path')).not.toBeNull()
})
