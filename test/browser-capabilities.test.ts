import { afterEach, describe, expect, test, vi } from 'vitest'

import Keyboard from '@/utils/keyboard'
import { createKeyboardLock } from '@/utils/lock-keyboard'
import toggleFullscreen from '@/utils/toggle-fullscreen'

afterEach(() => vi.unstubAllGlobals())

describe('optional browser capabilities', () => {
  test('keyboard lock reports whether the native request actually succeeded', async () => {
    const onChange = vi.fn()
    const keyboardLock = createKeyboardLock(onChange)
    vi.stubGlobal('navigator', {})
    keyboardLock.request()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false)
    const lock = vi.fn().mockRejectedValue(new Error('Permission denied'))
    vi.stubGlobal('navigator', { keyboard: { lock } })
    onChange.mockClear()
    keyboardLock.request()
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false)
    expect(lock).toHaveBeenCalledOnce()
    onChange.mockClear()
    lock.mockResolvedValueOnce(undefined)
    keyboardLock.request()
    await Promise.resolve()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
    onChange.mockClear()
    lock.mockImplementationOnce(() => {
      throw new Error('Lock unavailable')
    })
    keyboardLock.request()
    expect(onChange).toHaveBeenCalledExactlyOnceWith(false)
    keyboardLock.release()
  })

  test('layout lookup retains the default map when unavailable or rejected', async () => {
    const keyboard = new Keyboard()
    const defaultMap = keyboard.keyboardLayoutMap()
    await keyboard.setKeyboardLayoutMap()
    await keyboard.setKeyboardLayoutMap({
      getLayoutMap: vi.fn().mockRejectedValue(new Error('Permission denied')),
    })
    expect(keyboard.keyboardLayoutMap()).toBe(defaultMap)
    const layout = new Map([['KeyQ', 'a']])
    await keyboard.setKeyboardLayoutMap({
      getLayoutMap: () => Promise.resolve(layout),
    })
    expect(keyboard.key({ code: 'KeyQ', key: 'q' })).toBe('a')
  })

  test('fullscreen remains usable when entering is unsupported or denied', async () => {
    vi.stubGlobal('document', { fullscreenElement: null, documentElement: {} })
    await expect(toggleFullscreen()).resolves.toBeUndefined()
    const requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error('Permission denied'))
    vi.stubGlobal('document', {
      fullscreenElement: null,
      documentElement: { requestFullscreen },
    })
    await expect(toggleFullscreen()).resolves.toBeUndefined()
    expect(requestFullscreen).toHaveBeenCalledOnce()
  })

  test('fullscreen exit rejection is handled', async () => {
    const exitFullscreen = vi.fn().mockRejectedValue(new Error('Cannot exit'))
    vi.stubGlobal('document', { fullscreenElement: {}, exitFullscreen })
    await expect(toggleFullscreen()).resolves.toBeUndefined()
    expect(exitFullscreen).toHaveBeenCalledOnce()
  })
})
