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
const LATEST_SCHEMA_VERSION = 0
const KEY_OF_SCHEMA_VERSION = 'schemaVersion'
const KEY_OF_REMOVED_IDS = 'removedIds'
const KEY_OF_ANSWERED_HISTORY = 'answeredHistory'

export function loadRemovedIds(
  key: string = KEY_OF_REMOVED_IDS,
  defaultValue: string[] = []
): string[] {
  if (!isLatestSchemaVersion()) {
    localStorage.removeItem(key)
    return defaultValue
  }

  return loadFromLocalStorage(key, defaultValue)
}

export function saveRemovedIds(
  value: string[],
  key: string = KEY_OF_REMOVED_IDS
) {
  saveToLocalStorage(key, value)
  saveSchemaVersion()
}

export function loadAnsweredHistory(
  key: string = KEY_OF_ANSWERED_HISTORY,
  defaultValue: { [key: string]: boolean[] } = {}
): Map<string, boolean[]> {
  if (!isLatestSchemaVersion()) {
    localStorage.removeItem(key)
    return new Map(Object.entries(defaultValue))
  }

  const parsedJson = loadFromLocalStorage(key, defaultValue)
  return new Map(Object.entries(parsedJson))
}

export function saveAnsweredHistory(
  answeredHistory: Map<string, boolean[]>,
  key: string = KEY_OF_ANSWERED_HISTORY
) {
  saveToLocalStorage(key, Object.fromEntries(answeredHistory))
  saveSchemaVersion()
}

const loadSchemaVersion = (
  key: string = KEY_OF_SCHEMA_VERSION,
  defaultValue = -1
) => loadFromLocalStorage(key, defaultValue)

const isLatestSchemaVersion = () =>
  loadSchemaVersion() === LATEST_SCHEMA_VERSION

const saveSchemaVersion = (
  key: string = KEY_OF_SCHEMA_VERSION,
  value: number = LATEST_SCHEMA_VERSION
) => {
  saveToLocalStorage(key, value)
}

const loadFromLocalStorage = (
  key: string,
  defaultValue: number | string[] | { [key: string]: boolean[] }
) => {
  if (!localStorage.getItem(key)) return defaultValue

  try {
    const json = localStorage.getItem(key) as string
    const parsedJson = JSON.parse(json)
    return parsedJson
  } catch (e) {
    localStorage.removeItem(key)
    return defaultValue
  }
}

const saveToLocalStorage = (
  key: string,
  value: number | string[] | { [k: string]: boolean[] }
) => {
  const parsed = JSON.stringify(value)
  localStorage.setItem(key, parsed)
}

export function sampleShortcut(shortcuts: Shortcut[], removedIds: string[]) {
  const targetShortcuts = shortcuts.filter(
    (shortcut) => !removedIds.includes(shortcut.id)
  )

  if (import.meta.env.MODE === 'test') {
    // 出題順に依存しているテストがあるため
    return targetShortcuts[0]
  } else {
    return sample(targetShortcuts) as Shortcut
  }
}

const sample = (array: string[] | Shortcut[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

export function weightedSampleKey(keyWeightMap: Map<string, number>) {
  const keys = Array.from(keyWeightMap.keys())
  const weights = Array.from(keyWeightMap.values())

  return keys[weightedSampleIndex(weights)]
}

const weightedSampleIndex = (weights: number[]) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const randomWeight = Math.random() * totalWeight
  let cumulativeWeight = 0

  const sampledIndex = weights.findIndex((weight) => {
    cumulativeWeight += weight
    return cumulativeWeight >= randomWeight
  })

  return sampledIndex
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

import chrome from '@/constants/shortcuts/chrome.json'
import terminal from '@/constants/shortcuts/terminal.json'

export function loadShortcutsByTool(tool: string) {
  let json

  switch (tool) {
    case 'Google Chrome':
      json = chrome as Shortcut[]
      break

    case 'Terminal (macOS)':
      json = terminal as Shortcut[]
      break

    default:
      json = chrome as Shortcut[]
      break
  }

  return json
}

export function loadAllTools() {
  return [
    {
      name: 'Google Chrome',
      shortcuts: chrome as Shortcut[],
    },
    {
      name: 'Terminal (macOS)',
      shortcuts: terminal as Shortcut[],
    },
  ]
}

export function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}
