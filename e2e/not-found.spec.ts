import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('unknown pages, APIs, and assets return 404 before loading the app', async ({
  request,
}) => {
  for (const path of [
    '/does-not-exist',
    '/nested/does-not-exist',
    '/wp-login.php',
    '/api/does-not-exist',
    '/assets/does-not-exist.js',
  ]) {
    for (const method of ['GET', 'HEAD']) {
      const response = await request.fetch(path, {
        method,
        headers: { Accept: 'text/html' },
      })
      expect(response.status(), `${method} ${path}`).toBe(404)
      expect(await response.text()).not.toContain('<script')
    }
  }
})

test('existing pages and public assets remain available', async ({
  request,
}) => {
  for (const path of [
    '/',
    '/index.html',
    '/favicon.png',
    '/twitter_logo.png',
  ]) {
    expect((await request.get(path)).status(), path).toBe(200)
  }
})

test('the static 404 page has an accessible keyboard path home', async ({
  page,
}) => {
  await page.goto('/404.html')
  await expect(page).toHaveTitle('ページが見つかりません | Shortype')
  await expect(
    page.getByRole('heading', { name: '404', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('main')).toContainText('ページが見つかりません')
  await expect(page.locator('script')).toHaveCount(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'トップへ戻る' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('button', { name: 'About', exact: true }),
  ).toBeVisible()
})
