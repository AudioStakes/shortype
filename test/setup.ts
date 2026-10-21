import { afterEach, beforeEach, vi } from 'vitest'

import { cleanup } from './dom-helpers'

const storageState: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => storageState[key] ?? null,
  setItem: (key: string, value: string) => {
    storageState[key] = value
  },
  removeItem: (key: string) => {
    delete storageState[key]
  },
  clear: () => {
    for (const key of Object.keys(storageState)) {
      delete storageState[key]
    }
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
  writable: true,
})

Object.defineProperty(globalThis, '__TEST_LOCAL_STORAGE__', {
  configurable: true,
  value: storageState,
  writable: true,
})

beforeEach(() => {
  localStorageMock.clear()
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  )
})

afterEach(async () => {
  await cleanup()
})
