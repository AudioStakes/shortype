import { createLocalStorageCore } from '@/utils/local-storage-core'

const getStorage = () => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

const LocalStorage = createLocalStorageCore(getStorage())

export default LocalStorage
