import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import { SCHEMA_VERSION_KEY } from '@/constants/local-storage-keys'

const LocalStorage = {
  LATEST_SCHEMA_VERSION: 0,

  get(key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE) {
    if (
      !localStorage.getItem(key) ||
      (key !== SCHEMA_VERSION_KEY && !LocalStorage.isLatestSchemaVersion())
    ) {
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }

    try {
      const json = localStorage.getItem(key) as string
      return JSON.parse(json)
    } catch {
      localStorage.removeItem(key)
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }
  },

  set<T>(key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE, value: T) {
    const json = JSON.stringify(value)
    localStorage.setItem(key, json)

    if (key !== SCHEMA_VERSION_KEY) {
      LocalStorage.set(SCHEMA_VERSION_KEY, LocalStorage.LATEST_SCHEMA_VERSION)
    }
  },

  isLatestSchemaVersion() {
    return (
      LocalStorage.get(SCHEMA_VERSION_KEY) ===
      LocalStorage.LATEST_SCHEMA_VERSION
    )
  },
}

export default LocalStorage
