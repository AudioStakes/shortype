import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import LocalStorage from '@/utils/local-storage'

export type GameSessionStorageSnapshot = {
  selectedTool: string
  selectedCategories: string[]
  removedIds: string[]
  answeredHistory: Record<string, boolean[]>
}

export const loadGameSessionStorage = (): GameSessionStorageSnapshot => ({
  selectedTool: LocalStorage.get(SELECTED_TOOL_KEY) as string,
  selectedCategories: LocalStorage.get(SELECTED_CATEGORIES_KEY) as string[],
  removedIds: [...(LocalStorage.get(REMOVED_IDS_KEY) as string[])],
  answeredHistory: LocalStorage.get(ANSWERED_HISTORY_KEY) as Record<
    string,
    boolean[]
  >,
})

export const createGameSessionStoragePersistence = () => ({
  persistAnsweredHistory: (answeredHistory: Record<string, boolean[]>) => {
    LocalStorage.set(ANSWERED_HISTORY_KEY, answeredHistory)
  },
  persistRemovedIds: (removedIds: string[]) => {
    LocalStorage.set(REMOVED_IDS_KEY, removedIds)
  },
  persistSelectedTool: (tool: string) => {
    LocalStorage.set(SELECTED_TOOL_KEY, tool)
  },
  persistSelectedCategories: (categories: string[]) => {
    LocalStorage.set(SELECTED_CATEGORIES_KEY, categories)
  },
})
