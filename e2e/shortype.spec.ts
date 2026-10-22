import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page, test } from '@playwright/test'

import shortcuts from '../src/constants/shortcuts/chrome.json' with {
  type: 'json',
}

const origin = new URL(
  process.env['PLAYWRIGHT_BASE_URL'] || 'http://127.0.0.1:4173',
).origin
const category = 'タブとウィンドウのショートカット'
const action = '最後のタブに移動する'
const restoredAction = '新しいウィンドウを開く'
const toolDialogName = 'ツールとカテゴリーの選択'

const storageState = (overrides: Record<string, string> = {}) => ({
  cookies: [],
  origins: [
    {
      origin,
      localStorage: Object.entries({
        schemaVersion: '0',
        selectedTool: JSON.stringify('Google Chrome'),
        selectedCategories: JSON.stringify([category]),
        removedIds: JSON.stringify(
          shortcuts.filter(({ id }) => id !== '8').map(({ id }) => id),
        ),
        answeredHistory: '{}',
        ...overrides,
      }).map(([name, value]) => ({ name, value })),
    },
  ],
})

test.use({ storageState: storageState() })

const pageErrors = new WeakMap<Page, string[]>()

test.beforeEach(({ page, context }) => {
  const trackErrors = (trackedPage: Page) => {
    const errors: string[] = []
    pageErrors.set(trackedPage, errors)
    trackedPage.on('pageerror', (error) => errors.push(error.message))
  }
  trackErrors(page)
  context.on('page', trackErrors)
})

test.afterEach(({ context }) => {
  for (const page of context.pages()) {
    expect(pageErrors.get(page)).toEqual([])
  }
})

async function proceedIfUnsupported(page: Page) {
  const unsupported = page.getByRole('dialog', {
    name: 'サポートされている環境について',
  })
  if (await unsupported.isVisible()) {
    await unsupported
      .getByRole('button', { name: '閉じる', exact: true })
      .click()
  }
}

async function openGame(page: Page, questionAction = action) {
  await page.goto('/')
  await proceedIfUnsupported(page)
  await expect(
    page.getByRole('heading', { name: questionAction, exact: true }),
  ).toBeVisible()
}

async function holdProgressWrites(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((acquired, reject) => {
        navigator.locks
          .request('shortype:training-progress', () => {
            acquired()
            return new Promise<void>((release) => {
              window.addEventListener(
                'release-training-progress',
                () => release(),
                {
                  once: true,
                },
              )
            })
          })
          .catch(reject)
      }),
  )
  return () =>
    page.evaluate(() => {
      window.dispatchEvent(new Event('release-training-progress'))
    })
}

async function openToolSelection(page: Page) {
  await page.getByRole('button', { name: 'ツールを選ぶT', exact: true }).click()
  return page.getByRole('dialog', { name: toolDialogName })
}

async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(violations).toEqual([])
}

async function contrast(locator: Locator) {
  const colors = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    const background = getComputedStyle(
      element.closest('button') ?? element,
    ).backgroundColor
    return [
      style.color,
      background === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : background,
    ]
  })
  const luminances = colors.map((color) => {
    const channels = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number)
    expect(channels).toHaveLength(3)
    const linear = channels?.map((channel) => {
      const value = channel / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    const [red = 0, green = 0, blue = 0] = linear ?? []
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
  })
  const [foreground = 0, background = 0] = luminances
  return (
    (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05)
  )
}

test('real wrong and correct key presses persist through reload', async ({
  page,
}) => {
  await openGame(page)
  await page.keyboard.press('x')
  await expect(page.getByTestId('correct-key-combination')).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('answeredHistory')))
    .toBe('{"8":[false]}')
  await expect(page.getByTestId('x')).toBeHidden()
  await page.keyboard.press('Meta+9')
  await expect(page.getByTestId('wrong-key-pressed')).toBeVisible()
  await expect(page.getByTestId('wrong-key-pressed')).toBeHidden()
  await page.keyboard.press('Meta+9')
  await expect(page.getByTestId('correct-key-pressed')).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('answeredHistory')))
    .toBe('{"8":[false,true]}')
  await page.reload()
  await proceedIfUnsupported(page)
  await expect(
    page.getByRole('heading', { name: action, exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => localStorage.getItem('answeredHistory')),
  ).toBe('{"8":[false,true]}')
  expect(await page.evaluate(() => localStorage.getItem('schemaVersion'))).toBe(
    '0',
  )
})

test('keyboard navigation keeps focus across tool and category steps', async ({
  page,
}) => {
  await openGame(page)
  const trigger = page.getByRole('button', {
    name: 'ツールを選ぶT',
    exact: true,
  })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: toolDialogName })
  await expect(
    dialog.getByRole('button', { name: 'Close modal', exact: true }).last(),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  const chrome = dialog.getByRole('button', { name: /^Google Chrome/ })
  await expect(chrome).toBeFocused()
  await page.keyboard.press('Enter')
  const back = dialog.getByRole('button', { name: 'ツールを選ぶ', exact: true })
  await expect(back).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    dialog.getByRole('button', { name: /^Google Chrome/ }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(back).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'すべて選ぶ', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'すべての選択を外す', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  const firstCategory = dialog.getByRole('button', {
    name: new RegExp(`^${category}`),
  })
  const start = dialog.getByRole('button', {
    name: '選んだカテゴリーの練習をはじめる',
    exact: true,
  })
  await expect(firstCategory).toBeFocused()
  await expect(firstCategory).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Space')
  await expect(firstCategory).toHaveAttribute('aria-pressed', 'false')
  await expect(start).toBeDisabled()
  await page.keyboard.press('Enter')
  await expect(firstCategory).toHaveAttribute('aria-pressed', 'true')
  await expect(start).toBeEnabled()
  await page.keyboard.press('Tab')
  const secondCategoryName = 'Google Chrome 機能のショートカット'
  const secondCategory = dialog.getByRole('button', {
    name: new RegExp(`^${secondCategoryName}`),
  })
  await expect(secondCategory).toBeFocused()
  await expect(secondCategory).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('Space')
  await expect(secondCategory).toHaveAttribute('aria-pressed', 'true')
  for (const name of [
    'アドレスバーのショートカット',
    'ウェブページのショートカット',
    'マウスのショートカット',
  ]) {
    await page.keyboard.press('Tab')
    await expect(
      dialog.getByRole('button', { name: new RegExp(`^${name}`) }),
    ).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(start).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(
    page.getByRole('heading', { name: action, exact: true }),
  ).toBeVisible()
  await expect(page.getByTestId('pressed-key-combination')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('selectedTool'))).toBe(
    JSON.stringify('Google Chrome'),
  )
  expect(
    await page.evaluate(() => localStorage.getItem('selectedCategories')),
  ).toBe(JSON.stringify([category, secondCategoryName]))
  expect(
    await page.evaluate(() => localStorage.getItem('answeredHistory')),
  ).toBe('{}')
})

test('modal Escape restores focus and pauses game key handling', async ({
  page,
}) => {
  await openGame(page)
  const trigger = page.getByRole('button', { name: 'About', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', {
    name: 'Shortype について',
    exact: true,
  })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('x')
  await page.keyboard.press('Meta+9')
  expect(
    await page.evaluate(() => localStorage.getItem('answeredHistory')),
  ).toBe('{}')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await page.keyboard.press('x')
  await expect(page.getByTestId('correct-key-combination')).toBeVisible()
})

test('five UI states have no WCAG 2.2 AA axe violations', async ({ page }) => {
  await openGame(page)
  await expectAccessible(page)
  const dialog = await openToolSelection(page)
  await expectAccessible(page)
  await dialog.getByRole('button', { name: /^Google Chrome/ }).click()
  await expect(
    dialog.getByRole('heading', { name: 'カテゴリーを選んでください' }),
  ).toBeVisible()
  await expectAccessible(page)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'About', exact: true }).click()
  await expect(
    page.getByRole('dialog', { name: 'Shortype について' }),
  ).toBeVisible()
  await expectAccessible(page)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'プライバシー', exact: true }).click()
  await expect(
    page.getByRole('dialog', { name: 'プライバシー', exact: true }),
  ).toBeVisible()
  await expectAccessible(page)
})

test('320px cards and bulk actions reflow without overflow or overlap', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await openGame(page)
  const dialog = await openToolSelection(page)
  const assertCardsFit = async () => {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const cards = await dialog.locator('.ui-card').evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = (rect: DOMRect | undefined) =>
          rect && {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          }
        const card = element.getBoundingClientRect()
        const title = element.querySelector('h3')?.getBoundingClientRect()
        const chart = element
          .querySelector('svg[role="img"]')
          ?.getBoundingClientRect()
        return {
          card: {
            left: card.left,
            right: card.right,
            top: card.top,
            bottom: card.bottom,
          },
          title: bounds(title),
          chart: bounds(chart),
        }
      }),
    )
    expect(cards.length).toBeGreaterThan(0)
    for (const { card, title, chart } of cards) {
      expect(title).toBeDefined()
      expect(chart).toBeDefined()
      expect(title?.left).toBeGreaterThanOrEqual(card.left)
      expect(title?.right).toBeLessThanOrEqual(chart?.left ?? card.right)
      expect(title?.top).toBeGreaterThanOrEqual(card.top)
      expect(title?.bottom).toBeLessThanOrEqual(card.bottom)
      expect(chart?.right).toBeLessThanOrEqual(card.right)
      expect(card.right).toBeLessThanOrEqual(320)
    }
  }
  await assertCardsFit()
  const closeIcon = dialog
    .getByRole('button', { name: 'Close modal', exact: true })
    .last()
    .locator('svg')
  expect(await contrast(closeIcon)).toBeGreaterThanOrEqual(3)
  await dialog.getByRole('button', { name: /^Google Chrome/ }).click()
  await assertCardsFit()
  const start = dialog.getByRole('button', {
    name: '選んだカテゴリーの練習をはじめる',
    exact: true,
  })
  expect(await contrast(start)).toBeGreaterThanOrEqual(4.5)
  const selected = dialog
    .getByRole('button', { pressed: true })
    .first()
    .locator('svg[aria-hidden="true"]')
  expect(await contrast(selected)).toBeGreaterThanOrEqual(3)
  for (const name of ['すべて選ぶ', 'すべての選択を外す']) {
    const box = await dialog
      .getByRole('button', { name, exact: true })
      .boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320)
  }
  await expectAccessible(page)
})

test.describe('malformed persisted JSON', () => {
  test.use({ storageState: storageState({ answeredHistory: '{invalid json' }) })

  test('recovers at schema 0 and saves the next answer', async ({ page }) => {
    await openGame(page)
    await expect(
      page.getByRole('button', { name: '習熟度 0% の詳細', exact: true }),
    ).toBeVisible()
    await expect(page.getByTestId('pressed-key-combination')).toBeVisible()
    await page.keyboard.press('Meta+9')
    await expect(page.getByTestId('correct-key-pressed')).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('answeredHistory')))
      .toBe('{"8":[true]}')
    expect(
      await page.evaluate(() => localStorage.getItem('schemaVersion')),
    ).toBe('0')
  })
})

test('storage write refusal keeps training and removal usable in memory', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage disabled', 'QuotaExceededError')
    }
    Storage.prototype.removeItem = () => {
      throw new DOMException('Storage disabled', 'SecurityError')
    }
  })
  await openGame(page)
  await page.keyboard.press('x')
  await expect(page.getByTestId('correct-key-combination')).toBeVisible()
  expect(
    await page.evaluate(() => localStorage.getItem('answeredHistory')),
  ).toBe('{}')
  await expect(page.getByTestId('x')).toBeHidden()
  await page.keyboard.press('Meta+9')
  await expect(page.getByTestId('wrong-key-pressed')).toBeVisible()
  await expect(page.getByTestId('wrong-key-pressed')).toBeHidden()
  await page.keyboard.press('r')
  await expect(
    page.getByText('出題できるショートカットキーがありません。'),
  ).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '出題しないリストを空にする' }).click()
  await expect(page.getByTestId('pressed-key-combination')).toBeVisible()
})

test.describe('all questions excluded', () => {
  test.use({
    storageState: storageState({
      removedIds: JSON.stringify(shortcuts.map(({ id }) => id)),
    }),
  })

  test('restores excluded questions and persists recovery', async ({
    page,
  }) => {
    await page.goto('/')
    const unsupported = page.getByRole('dialog', {
      name: 'サポートされている環境について',
    })
    if (await unsupported.isVisible()) {
      await unsupported
        .getByRole('button', { name: '閉じる', exact: true })
        .click()
    }
    await expect(
      page.getByText('出題できるショートカットキーがありません。'),
    ).toBeVisible()
    page.once('dialog', (dialog) => dialog.accept())
    await page
      .getByRole('button', { name: '出題しないリストを空にする' })
      .click()
    await expect(
      page.getByRole('heading', { name: restoredAction, exact: true }),
    ).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('removedIds'))).toBe(
      '[]',
    )
    await page.reload()
    await proceedIfUnsupported(page)
    await expect(
      page.getByText('出題できるショートカットキーがありません。'),
    ).toBeHidden()
    await expect(page.getByTestId('pressed-key-combination')).toBeVisible()
  })
})

test.describe('cross-tab answered history', () => {
  test.use({
    storageState: storageState({ answeredHistory: '{"8":[false]}' }),
  })

  test('simultaneous answers in two tabs persist exactly once and update live progress', async ({
    page,
    context,
  }) => {
    const otherPage = await context.newPage()
    await openGame(page)
    await openGame(otherPage)
    for (const tab of [page, otherPage]) {
      await expect(
        tab.getByRole('button', { name: '習熟度 0% の詳細', exact: true }),
      ).toBeVisible()
    }

    const releaseWrites = await holdProgressWrites(page)
    try {
      await Promise.all([
        page.keyboard.press('Meta+9'),
        otherPage.keyboard.press('Meta+9'),
      ])
      for (const tab of [page, otherPage]) {
        await expect(tab.getByTestId('correct-key-pressed')).toBeVisible()
      }
      expect(
        await page.evaluate(() => localStorage.getItem('answeredHistory')),
      ).toBe('{"8":[false]}')
    } finally {
      await releaseWrites()
    }

    const history = '{"8":[false,true,true]}'
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('answeredHistory')))
      .toBe(history)
    for (const tab of [page, otherPage]) {
      await expect(
        tab.getByRole('button', { name: '習熟度 100% の詳細', exact: true }),
      ).toBeVisible()
      await tab.reload()
      await proceedIfUnsupported(tab)
      await expect(
        tab.getByRole('button', { name: '習熟度 100% の詳細', exact: true }),
      ).toBeVisible()
      expect(
        await tab.evaluate(() => localStorage.getItem('answeredHistory')),
      ).toBe(history)
    }
  })
})

test.describe('cross-tab exclusions', () => {
  test.use({
    storageState: storageState({
      removedIds: JSON.stringify(
        shortcuts
          .filter(({ id }) => id !== '1' && id !== '8')
          .map(({ id }) => id),
      ),
    }),
  })

  test('two tabs preserve both exclusions and recover live after remote restoration', async ({
    page,
    context,
  }) => {
    const otherPage = await context.newPage()
    await page.addInitScript(() => {
      Math.random = () => 0
    })
    await otherPage.addInitScript(() => {
      Math.random = () => 0.99
    })
    await openGame(page, restoredAction)
    await openGame(otherPage)

    const releaseWrites = await holdProgressWrites(page)
    try {
      await Promise.all([
        page.keyboard.press('r'),
        otherPage.keyboard.press('r'),
      ])
    } finally {
      await releaseWrites()
    }

    await expect
      .poll(() =>
        page.evaluate(() => {
          const stored: unknown = JSON.parse(
            localStorage.getItem('removedIds') ?? 'null',
          )
          return Array.isArray(stored) ? stored.toSorted() : stored
        }),
      )
      .toEqual(shortcuts.map(({ id }) => id).toSorted())
    for (const tab of [page, otherPage]) {
      await expect(
        tab.getByText('出題できるショートカットキーがありません。'),
      ).toBeVisible()
    }

    page.once('dialog', (dialog) => dialog.accept())
    await page
      .getByRole('button', { name: '出題しないリストを空にする' })
      .click()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('removedIds')))
      .toBe('[]')
    for (const tab of [page, otherPage]) {
      await expect(
        tab.getByText('出題できるショートカットキーがありません。'),
      ).toBeHidden()
      await expect(tab.getByTestId('pressed-key-combination')).toBeVisible()
    }
    await otherPage.reload()
    await proceedIfUnsupported(otherPage)
    await expect(otherPage.getByTestId('pressed-key-combination')).toBeVisible()
    expect(
      await otherPage.evaluate(() => localStorage.getItem('removedIds')),
    ).toBe('[]')
  })
})

test('remote restoration followed by another tab removal keeps restored questions included', async ({
  page,
  context,
}) => {
  const otherPage = await context.newPage()
  await openGame(page)
  await openGame(otherPage)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '出題しないリストを空にする' }).click()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('removedIds')))
    .toBe('[]')
  await expect(
    page.getByRole('heading', { name: restoredAction, exact: true }),
  ).toBeVisible()
  await expect(
    otherPage.getByRole('heading', { name: action, exact: true }),
  ).toBeVisible()

  await otherPage.keyboard.press('r')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('removedIds')))
    .toBe('["8"]')
  await expect(
    otherPage.getByRole('heading', { name: action, exact: true }),
  ).toBeHidden()
  await expect(otherPage.getByTestId('pressed-key-combination')).toBeVisible()
  await page.reload()
  await proceedIfUnsupported(page)
  await expect(
    page.getByRole('heading', { name: action, exact: true }),
  ).toBeHidden()
  await expect(page.getByTestId('pressed-key-combination')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('removedIds'))).toBe(
    '["8"]',
  )
})
