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

  test('loads legacy histories and persists only their latest two results', () => {
    const legacyHistory = {
      'legacy-id': [...Array<boolean>(100).fill(false), true, true],
      'unmastered-id': [true, false, true],
      'single-id': [false],
    }
    const boundedHistory = {
      'legacy-id': [true, true],
      'unmastered-id': [false, true],
      'single-id': [false],
    }
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify(legacyHistory))

    expect(localStorageCore.get(ANSWERED_HISTORY_KEY)).toEqual(boundedHistory)
    expect(localStorageCore.getPersisted(ANSWERED_HISTORY_KEY)).toEqual(
      boundedHistory,
    )
    expect(localStorageCore.set(ANSWERED_HISTORY_KEY, legacyHistory)).toBe(true)
    expect(JSON.parse(storage.getItem(ANSWERED_HISTORY_KEY) ?? '{}')).toEqual(
      boundedHistory,
    )
    expect(createLocalStorageCore(storage).get(ANSWERED_HISTORY_KEY)).toEqual(
      boundedHistory,
    )
    expect(legacyHistory['legacy-id']).toHaveLength(102)
    expect(storage.getItem(SCHEMA_VERSION_KEY)).toBe('0')
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

test('unavailable storage retains values and schema in memory until removed', () => {
  const core = createLocalStorageCore()
  expect(core.isLatestSchemaVersion()).toBe(false)
  core.set(SELECTED_TOOL_KEY, 'Terminal (macOS)')
  expect(core.isLatestSchemaVersion()).toBe(true)
  expect(core.get(SELECTED_TOOL_KEY)).toBe('Terminal (macOS)')
  core.remove(SELECTED_TOOL_KEY)
  expect(core.get(SELECTED_TOOL_KEY)).toBe('Google Chrome')
})

test.each([
  null,
  true,
  0.1,
  '0',
  {},
  [],
])('invalid schema versions are removed: %j', (version) => {
  const storage = createStorage()
  storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(version))
  const core = createLocalStorageCore(storage)
  expect(core.isLatestSchemaVersion()).toBe(false)
  expect(storage.getItem(SCHEMA_VERSION_KEY)).toBeNull()
})

test.each([
  null,
  true,
  1,
  'history',
  { example: [true], invalid: [false, null] },
])('invalid answer-history shapes recover: %j', (value) => {
  const storage = createStorage()
  storage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(LATEST_SCHEMA_VERSION))
  storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify(value))
  const core = createLocalStorageCore(storage)
  expect(core.get(ANSWERED_HISTORY_KEY)).toEqual({})
  expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBeNull()
})

describe('persisted storage access', () => {
  test('reads durable values without a failed local write shadowing them', () => {
    const storage = createStorage()
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    storage.setItem(ANSWERED_HISTORY_KEY, JSON.stringify({ remote: [false] }))
    const core = createLocalStorageCore({
      ...storage,
      setItem: () => {
        throw new Error('Quota exceeded')
      },
    })

    expect(core.set(ANSWERED_HISTORY_KEY, { local: [true] })).toBe(false)
    expect(core.get(ANSWERED_HISTORY_KEY)).toEqual({ local: [true] })
    expect(core.getPersisted(ANSWERED_HISTORY_KEY)).toEqual({ remote: [false] })
  })

  test.each([
    '{',
    '[]',
    '{"invalid":[]}',
    'null',
  ])('defaults invalid durable JSON without deleting it: %s', (json) => {
    const storage = createStorage()
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    storage.setItem(ANSWERED_HISTORY_KEY, json)
    const core = createLocalStorageCore(storage)

    expect(core.getPersisted(ANSWERED_HISTORY_KEY)).toEqual({})
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe(json)
  })

  test.each([
    undefined,
    '{',
    '1',
    'null',
  ])('defaults incompatible or absent schema without cleanup: %s', (version) => {
    const storage = createStorage()
    if (version !== undefined) {
      storage.setItem(SCHEMA_VERSION_KEY, version)
    }
    storage.setItem(ANSWERED_HISTORY_KEY, '{"id":[true]}')
    const core = createLocalStorageCore(storage)

    expect(core.getPersisted(ANSWERED_HISTORY_KEY)).toEqual({})
    expect(storage.getItem(SCHEMA_VERSION_KEY)).toBe(version ?? null)
  })

  test('defaults missing values and reads schema itself', () => {
    const storage = createStorage()
    const core = createLocalStorageCore(storage)
    expect(core.getPersisted(SCHEMA_VERSION_KEY)).toBe(-1)
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    expect(core.getPersisted(SCHEMA_VERSION_KEY)).toBe(0)
    expect(core.getPersisted(ANSWERED_HISTORY_KEY)).toEqual({})
  })

  test('throws when native storage cannot be read or does not exist', () => {
    expect(() =>
      createLocalStorageCore().getPersisted(ANSWERED_HISTORY_KEY),
    ).toThrow()
    const storage = createStorage()
    const core = createLocalStorageCore({
      ...storage,
      getItem: () => {
        throw new Error('Storage disabled')
      },
    })
    expect(() => core.getPersisted(ANSWERED_HISTORY_KEY)).toThrow(
      'Storage disabled',
    )
  })

  test('reports durable value and schema writes separately', () => {
    const storage = createStorage()
    const core = createLocalStorageCore({
      ...storage,
      setItem: (key, value) => {
        if (key === SCHEMA_VERSION_KEY) {
          throw new Error('Schema write failed')
        }
        storage.setItem(key, value)
      },
    })
    expect(core.set(ANSWERED_HISTORY_KEY, { id: [true] })).toBe(false)
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true]}')
    expect(core.get(SCHEMA_VERSION_KEY)).toBe(0)
    expect(createLocalStorageCore(storage).set(REMOVED_IDS_KEY, ['id'])).toBe(
      true,
    )
    expect(createLocalStorageCore().set(REMOVED_IDS_KEY, ['id'])).toBe(false)
  })

  test('still writes the schema after the value write fails', () => {
    const storage = createStorage()
    const core = createLocalStorageCore({
      ...storage,
      setItem: (key, value) => {
        if (key === ANSWERED_HISTORY_KEY) {
          throw new Error('Value write failed')
        }
        storage.setItem(key, value)
      },
    })
    expect(core.set(ANSWERED_HISTORY_KEY, { id: [true] })).toBe(false)
    expect(storage.getItem(SCHEMA_VERSION_KEY)).toBe('0')
    expect(core.get(ANSWERED_HISTORY_KEY)).toEqual({ id: [true] })
  })

  test('successful removal permits a later replacement from another tab', () => {
    const storage = createStorage()
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    storage.setItem(REMOVED_IDS_KEY, '["old"]')
    const core = createLocalStorageCore(storage)
    core.remove(REMOVED_IDS_KEY)
    storage.setItem(REMOVED_IDS_KEY, '["new"]')
    expect(core.get(REMOVED_IDS_KEY)).toEqual(['new'])
  })

  test('failed removal keeps its tombstone over an external replacement', () => {
    const storage = createStorage()
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    const core = createLocalStorageCore({
      ...storage,
      removeItem: () => {
        throw new Error('Read only')
      },
    })
    core.remove(REMOVED_IDS_KEY)
    storage.setItem(REMOVED_IDS_KEY, '["new"]')
    expect(core.get(REMOVED_IDS_KEY)).toEqual([])
    expect(core.getPersisted(REMOVED_IDS_KEY)).toEqual(['new'])
  })
})

test('read-only preference reads retain failed writes and never clean up corrupt data', () => {
  const storage = createStorage()
  const core = createLocalStorageCore({
    ...storage,
    setItem: () => {
      throw new Error('Storage full')
    },
  })
  core.set(SELECTED_TOOL_KEY, 'Terminal (macOS)')
  expect(core.get(SELECTED_TOOL_KEY, { cleanup: false })).toBe(
    'Terminal (macOS)',
  )

  const reader = createLocalStorageCore(storage)
  storage.setItem(SCHEMA_VERSION_KEY, '{')
  expect(reader.get(SELECTED_TOOL_KEY, { cleanup: false })).toBe(
    'Google Chrome',
  )
  expect(storage.getItem(SCHEMA_VERSION_KEY)).toBe('{')
  storage.setItem(SCHEMA_VERSION_KEY, '0')
  storage.setItem(SELECTED_CATEGORIES_KEY, '{')
  expect(reader.get(SELECTED_CATEGORIES_KEY, { cleanup: false })).toEqual(
    LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[SELECTED_CATEGORIES_KEY],
  )
  expect(storage.getItem(SELECTED_CATEGORIES_KEY)).toBe('{')
})
