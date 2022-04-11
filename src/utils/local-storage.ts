const LATEST_SCHEMA_VERSION = 0
const KEY_OF_SCHEMA_VERSION = 'schemaVersion'
const KEY_OF_REMOVED_IDS = 'removedIds'
const KEY_OF_ANSWERED_HISTORY = 'answeredHistory'
const KEY_OF_SELECTED_TOOL = 'selectedTool'
const KEY_OF_SELECTED_CATEGORIES = 'selectedCategories'

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

export function loadSelectedTool(
  key: string = KEY_OF_SELECTED_TOOL,
  defaultValue = 'Google Chrome'
): string {
  if (!isLatestSchemaVersion()) {
    localStorage.removeItem(key)
    return defaultValue
  }

  return loadFromLocalStorage(key, defaultValue)
}

export function saveSelectedTool(
  value: string,
  key: string = KEY_OF_SELECTED_TOOL
) {
  saveToLocalStorage(key, value)
  saveSchemaVersion()
}

export function loadSelectedCategories(
  key: string = KEY_OF_SELECTED_CATEGORIES,
  defaultValue = [
    'タブとウィンドウのショートカット',
    'Google Chrome 機能のショートカット',
    'アドレスバーのショートカット',
    'ウェブページのショートカット',
    'マウスのショートカット',
  ]
): string[] {
  if (!isLatestSchemaVersion()) {
    localStorage.removeItem(key)
    return defaultValue
  }

  return loadFromLocalStorage(key, defaultValue)
}

export function saveSelectedCategories(
  value: string[],
  key: string = KEY_OF_SELECTED_CATEGORIES
) {
  saveToLocalStorage(key, value)
  saveSchemaVersion()
}

const loadFromLocalStorage = (
  key: string,
  defaultValue:
    | number
    | string
    | string[]
    | { [key: string]: boolean[] }
    | { toolName: string; selectedCategories: string[] }[]
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
  value:
    | number
    | string
    | string[]
    | { [k: string]: boolean[] }
    | { toolName: string; selectedCategories: string[] }[]
) => {
  const parsed = JSON.stringify(value)
  localStorage.setItem(key, parsed)
}
