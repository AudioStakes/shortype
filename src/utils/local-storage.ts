import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import { SCHEMA_VERSION_KEY } from '@/constants/local-storage-keys'

export default class LocalStorage {
  static LATEST_SCHEMA_VERSION = 0

  static get(key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE) {
    if (
      !localStorage.getItem(key) ||
      (key !== SCHEMA_VERSION_KEY && !LocalStorage._isLatestSchemaVersion())
    ) {
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }

    try {
      const json = localStorage.getItem(key) as string
      return JSON.parse(json)
    } catch (e) {
      localStorage.removeItem(key)
      return LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[key]
    }
  }

  static set<T>(
    key: keyof typeof LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE,
    value: T
  ) {
    const json = JSON.stringify(value)
    localStorage.setItem(key, json)

    if (key !== SCHEMA_VERSION_KEY) {
      LocalStorage.set(SCHEMA_VERSION_KEY, LocalStorage.LATEST_SCHEMA_VERSION)
    }
  }

  private static _isLatestSchemaVersion() {
    return (
      LocalStorage.get(SCHEMA_VERSION_KEY) ===
      LocalStorage.LATEST_SCHEMA_VERSION
    )
  }
}
