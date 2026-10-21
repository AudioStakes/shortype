import { expect, test, vi } from 'vitest'
import toggleFullscreen from '@/utils/toggle-fullscreen'

test('missing fullscreen exit remains a harmless optional browser feature', async () => {
  vi.stubGlobal('document', {
    fullscreenElement: {},
    exitFullscreen: undefined,
  })
  await expect(toggleFullscreen()).resolves.toBeUndefined()
})
