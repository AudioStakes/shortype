import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'

export type LocalStorageLike = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>

export const LATEST_SCHEMA_VERSION = 0

type StorageKey = keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE

const isStringArray = (value: unknown) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isValidStoredValue = (key: StorageKey, value: unknown) => {
  switch (key) {
    case SCHEMA_VERSION_KEY:
      return Number.isInteger(value)
    case SELECTED_TOOL_KEY:
      return typeof value === 'string'
    case SELECTED_CATEGORIES_KEY:
    case REMOVED_IDS_KEY:
      return isStringArray(value)
    case ANSWERED_HISTORY_KEY:
      return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.values(value).every(
          (results) =>
            Array.isArray(results) &&
            results.length > 0 &&
            results.every((result) => typeof result === 'boolean'),
        )
      )
  }
}

export const createLocalStorageCore = (storage?: LocalStorageLike) => {
  const unsavedValues = new Map<string, string | null>()

  const readItem = (key: string) => {
    if (unsavedValues.has(key)) {
      return unsavedValues.get(key)
    }

    try {
      return storage?.getItem(key)
    } catch {
      return undefined
    }
  }

  const remove = (key: StorageKey) => {
    unsavedValues.set(key, null)

    try {
      storage?.removeItem(key)
      if (storage) {
        unsavedValues.delete(key)
      }
    } catch {
      // Keep the removed value hidden for the rest of this session.
    }
  }

  const readJson = (key: StorageKey, cleanup: boolean) => {
    const json = readItem(key)
    if (!json) {
      return undefined
    }

    try {
      const value: unknown = JSON.parse(json)
      if (isValidStoredValue(key, value)) {
        return value
      }
    } catch {
      // Invalid JSON uses the same recovery as an invalid stored shape.
    }

    if (cleanup) {
      remove(key)
    }
    return undefined
  }

  const isLatestSchemaVersion = (cleanup = true) =>
    readJson(SCHEMA_VERSION_KEY, cleanup) === LATEST_SCHEMA_VERSION

  const get = (key: StorageKey, { cleanup = true } = {}) => {
    if (key !== SCHEMA_VERSION_KEY && !isLatestSchemaVersion(cleanup)) {
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }

    const value = readJson(key, cleanup)
    return value ?? LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
  }

  const getPersisted = (key: StorageKey) => {
    const readPersistedJson = (storedKey: StorageKey) => {
      if (!storage) {
        throw new Error('Storage is unavailable')
      }
      const json = storage.getItem(storedKey)
      if (json === null) {
        return undefined
      }
      try {
        const value: unknown = JSON.parse(json)
        return isValidStoredValue(storedKey, value) ? value : undefined
      } catch {
        return undefined
      }
    }

    if (
      key !== SCHEMA_VERSION_KEY &&
      readPersistedJson(SCHEMA_VERSION_KEY) !== LATEST_SCHEMA_VERSION
    ) {
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }
    return readPersistedJson(key) ?? LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
  }

  const set = <T>(key: StorageKey, value: T): boolean => {
    const json = JSON.stringify(value)
    unsavedValues.set(key, json)
    let saved = false

    try {
      storage?.setItem(key, json)
      if (storage) {
        unsavedValues.delete(key)
        saved = true
      }
    } catch {
      // Training remains usable when storage is disabled or full.
    }

    if (key !== SCHEMA_VERSION_KEY) {
      const schemaSaved = set(SCHEMA_VERSION_KEY, LATEST_SCHEMA_VERSION)
      return saved && schemaSaved
    }
    return saved
  }

  return {
    get,
    getPersisted,
    set,
    remove,
    isLatestSchemaVersion,
  }
}
