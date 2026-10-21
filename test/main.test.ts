import { render as preactRender } from 'preact'
import { afterEach, expect, test, vi } from 'vitest'

import { initializeWebAnalytics } from '@/utils/web-analytics'

vi.mock('@/utils/web-analytics', () => ({ initializeWebAnalytics: vi.fn() }))

afterEach(() => {
  const root = document.getElementById('app')
  if (root) {
    preactRender(null, root)
    root.remove()
  }
  vi.resetModules()
})

test('entry reports a missing mount point instead of silently dropping the app', async () => {
  await expect(import('@/main')).rejects.toThrow('Missing #app root element')
  expect(initializeWebAnalytics).not.toHaveBeenCalled()
})

test('entry renders the application and initializes analytics after mounting', async () => {
  const root = document.createElement('div')
  root.id = 'app'
  document.body.append(root)
  await import('@/main')
  expect(root.textContent).toContain('Shortype')
  expect(initializeWebAnalytics).toHaveBeenCalledOnce()
})
