import { InjectionKey, inject } from 'vue'

// https://logaretm.com/blog/type-safe-provide-inject/
export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
  const resolved = inject(key, fallback)
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`)
  }
  return resolved
}

export function getItemFromLocalStorage(key: string): string[] {
  if (!localStorage.getItem(key)) return []

  try {
    const json = localStorage.getItem(key) as string
    return JSON.parse(json)
  } catch (e) {
    localStorage.removeItem(key)
    return []
  }
}

export function setItemToLocalStorage(key: string, value: string[]) {
  const parsed = JSON.stringify(value)
  localStorage.setItem(key, parsed)
}

const KEY_OF_RESULT_HISTORY = 'answeredHistory_Version_0_0_0'

export function loadAnsweredHistory(): Map<string, boolean[]> {
  if (!localStorage.getItem(KEY_OF_RESULT_HISTORY)) return new Map()

  try {
    const json = localStorage.getItem(KEY_OF_RESULT_HISTORY) as string
    const parsedJson = JSON.parse(json)
    return new Map(Object.entries(parsedJson))
  } catch (e) {
    localStorage.removeItem(KEY_OF_RESULT_HISTORY)
    return new Map()
  }
}

export function saveAnsweringHistory(answeredHistory: Map<string, boolean[]>) {
  const parsed = JSON.stringify(Object.fromEntries(answeredHistory))
  localStorage.setItem(KEY_OF_RESULT_HISTORY, parsed)
}
