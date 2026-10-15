import { beforeEach, describe, expect, test } from 'vitest'

import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import {
  createLocalStorageCore,
  LATEST_SCHEMA_VERSION,
  type LocalStorageLike,
} from '@/utils/local-storage-core'

const createStorage = (): LocalStorageLike & {
  state: Record<string, string>
} => {
  const state: Record<string, string> = {}

  return {
    state,
    getItem: (key: string) => state[key] ?? null,
    setItem: (key: string, value: string) => {
      state[key] = value
    },
    removeItem: (key: string) => {
      delete state[key]
    },
  }
}

describe('local-storage-core', () => {
  let storage: ReturnType<typeof createStorage>
  let localStorageCore: ReturnType<typeof createLocalStorageCore>

  beforeEach(() => {
    storage = createStorage()
    localStorageCore = createLocalStorageCore(storage)
  })

  test('returns the default value until the schema version is current', () => {
    storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify({ foo: [true] }))

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual(
      LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[ANSWERED_HISTORY_KEY],
    )
  })

  test('reads the stored value after the schema version is current', () => {
    storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
    storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify({ foo: [true] }))

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({ foo: [true] })
  })

  test('falls back to the default value when the stored JSON is broken', () => {
    storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
    storage.setItem(ANSWERED_HISTORY_KEY, '{')

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual(
      LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[ANSWERED_HISTORY_KEY],
    )
    expect(storage.state[ANSWERED_HISTORY_KEY]).toBeUndefined()
  })

  test('writes the schema version when a non-schema value is saved', () => {
    localStorageCore.set(ANSWERED_HISTORY_KEY, { foo: [true] })

    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toEqual(
      JSON.stringify({ foo: [true] }),
    )
    expect(storage.getItem(SCHEMA_VERSION_KEY)).toEqual(
      JSON.stringify(LATEST_SCHEMA_VERSION),
    )
  })

  test.each([
    [REMOVED_IDS_KEY, {}],
    [REMOVED_IDS_KEY, [12]],
    [SELECTED_CATEGORIES_KEY, 'Tabs'],
    [SELECTED_CATEGORIES_KEY, ['Tabs', false]],
    [SELECTED_TOOL_KEY, 12],
    [ANSWERED_HISTORY_KEY, []],
    [ANSWERED_HISTORY_KEY, { foo: null }],
    [ANSWERED_HISTORY_KEY, { foo: [] }],
    [ANSWERED_HISTORY_KEY, { foo: [true, 'false'] }],
  ] as const)('recovers from invalid data for %s: %j', (key, value) => {
    storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
    storage.setItem(key, JSON.stringify(value))

    expect(localStorageCore.get(key)).toEqual(
      LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key],
    )
    expect(storage.state[key]).toBeUndefined()
  })

  test('keeps working for the current session when storage is unavailable', () => {
    localStorageCore = createLocalStorageCore({
      getItem: () => {
        throw new Error('Storage is disabled')
      },
      setItem: () => {
        throw new Error('Storage is disabled')
      },
      removeItem: () => {
        throw new Error('Storage is disabled')
      },
    })

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({})
    localStorageCore.set(ANSWERED_HISTORY_KEY, { foo: [true] })
    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({ foo: [true] })
    localStorageCore.remove(ANSWERED_HISTORY_KEY)
    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({})
  })

  test('uses updated session values when storage writes exceed the quota', () => {
    storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
    storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify({ foo: [false] }))
    localStorageCore = createLocalStorageCore({
      ...storage,
      setItem: () => {
        throw new Error('Storage quota exceeded')
      },
    })

    localStorageCore.set(ANSWERED_HISTORY_KEY, { foo: [false, true] })

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({
      foo: [false, true],
    })
  })

  test('recovers from corrupt data even when it cannot be removed', () => {
    storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
    storage.setItem(ANSWERED_HISTORY_KEY, '{')
    localStorageCore = createLocalStorageCore({
      ...storage,
      removeItem: () => {
        throw new Error('Storage is read only')
      },
    })

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({})
    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual({})
  })
})
