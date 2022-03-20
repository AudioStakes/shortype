import { inject, InjectionKey } from 'vue'

import { Shortcut } from '@/types/interfaces'

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

/**
 * Examples of arg and returnValue:
 * [true, true] -> 0.02,
 * [true] -> 0.51,
 * [true, false] -> 3.51,
 * [false] -> 5,
 * [false, false] -> 9
 */
export function weight(results: boolean[]) {
  const laterResults = results.slice(-2) // Last 2 results

  const initialWeight = 1
  const weight = laterResults.reduce(
    (previousWeight, result) => previousWeight + (result ? -0.49 : 4),
    initialWeight
  )

  return weight
}

export function weightedSampleIndex(weights: number[]) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const randomWeight = Math.random() * totalWeight
  let cumulativeWeight = 0

  const sampledIndex = weights.findIndex((weight) => {
    cumulativeWeight += weight
    return cumulativeWeight >= randomWeight
  })

  return sampledIndex
}

export function noAnsweredAvailableIds(
  shortcuts: Shortcut[],
  removedIds: string[],
  answeredHistoryMap: Map<string, boolean[]>
) {
  const answeredIds = Array.from(answeredHistoryMap.keys())

  return shortcuts
    .map((shortcut) => shortcut.id)
    .filter((id) => !answeredIds.includes(id) && !removedIds.includes(id))
}
