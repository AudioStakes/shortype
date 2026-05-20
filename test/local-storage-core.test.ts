import { beforeEach, describe, expect, test } from 'vitest'

import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import { ANSWERED_HISTORY_KEY, SCHEMA_VERSION_KEY } from '@/constants/local-storage-keys'
import {
  LATEST_SCHEMA_VERSION,
  createLocalStorageCore,
  type LocalStorageLike,
} from '@/utils/local-storage-core'

const createStorage = (): LocalStorageLike & { state: Record<string, string> } => {
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
})
