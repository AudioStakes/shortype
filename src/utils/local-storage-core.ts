import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import { SCHEMA_VERSION_KEY } from '@/constants/local-storage-keys'

export type LocalStorageLike = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
>

export const LATEST_SCHEMA_VERSION = 0

const readJson = <T>(storage: LocalStorageLike, key: string) => {
  const json = storage.getItem(key)

  if (!json) {
    return undefined
  }

  try {
    return JSON.parse(json) as T
  } catch {
    storage.removeItem(key)
    return undefined
  }
}

export const createLocalStorageCore = (storage: LocalStorageLike) => {
  const isLatestSchemaVersion = () =>
    readJson<number>(storage, SCHEMA_VERSION_KEY) === LATEST_SCHEMA_VERSION

  const get = (key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE) => {
    if (key !== SCHEMA_VERSION_KEY && !isLatestSchemaVersion()) {
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }

    const value = readJson(storage, key)
    return value ?? LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
  }

  const set = <T>(
    key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE,
    value: T,
  ) => {
    storage.setItem(key, JSON.stringify(value))

    if (key !== SCHEMA_VERSION_KEY) {
      set(SCHEMA_VERSION_KEY, LATEST_SCHEMA_VERSION)
    }
  }

  const remove = (key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE) => {
    storage.removeItem(key)
  }

  return {
    get,
    set,
    remove,
    isLatestSchemaVersion,
  }
}
