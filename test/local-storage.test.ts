import { expect, test, vi } from 'vitest'

import { ANSWERED_HISTORY_KEY } from '@/constants/local-storage-keys'

test('initializes and stores session progress when localStorage access is blocked', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  vi.resetModules()

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('Access to localStorage is denied')
    },
  })

  try {
    const { default: storage } = await import('@/utils/local-storage')

    expect(storage.get(ANSWERED_HISTORY_KEY)).toEqual({})
    storage.set(ANSWERED_HISTORY_KEY, { foo: [true] })
    expect(storage.get(ANSWERED_HISTORY_KEY)).toEqual({ foo: [true] })
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'localStorage', descriptor)
    }
  }
})
