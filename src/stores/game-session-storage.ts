import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import shortcutCatalog from '@/models/shortcut-catalog'
import LocalStorage from '@/utils/local-storage'

export type GameSessionStorageSnapshot = {
  selectedTool: string
  selectedCategories: string[]
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
}

export const loadGameSessionStorage = (): GameSessionStorageSnapshot => {
  const storedTool = LocalStorage.get(SELECTED_TOOL_KEY) as string
  const selectedTool = shortcutCatalog.listTools().includes(storedTool)
    ? storedTool
    : LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[SELECTED_TOOL_KEY]
  const availableCategories = new Set(
    shortcutCatalog.listCategoriesOf(selectedTool),
  )
  const storedCategories = LocalStorage.get(SELECTED_CATEGORIES_KEY) as string[]

  return {
    selectedTool,
    selectedCategories:
      storedTool === selectedTool
        ? storedCategories.filter((category) =>
            availableCategories.has(category),
          )
        : [],
    removedIds: new Set(LocalStorage.get(REMOVED_IDS_KEY) as string[]),
    answeredHistory: new Map(
      Object.entries(
        LocalStorage.get(ANSWERED_HISTORY_KEY) as Record<string, boolean[]>,
      ),
    ),
  }
}

export const createGameSessionStoragePersistence = () => ({
  persistAnsweredHistory: (answeredHistory: Map<string, boolean[]>) => {
    LocalStorage.set(ANSWERED_HISTORY_KEY, Object.fromEntries(answeredHistory))
  },
  persistRemovedIds: (removedIds: Set<string>) => {
    LocalStorage.set(REMOVED_IDS_KEY, [...removedIds])
  },
  persistSelectedTool: (tool: string) => {
    LocalStorage.set(SELECTED_TOOL_KEY, tool)
  },
  persistSelectedCategories: (categories: string[]) => {
    LocalStorage.set(SELECTED_CATEGORIES_KEY, categories)
  },
})
