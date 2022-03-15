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
