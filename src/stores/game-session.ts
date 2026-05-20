import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import shortcutCatalog from '@/models/shortcut-catalog'
import type { Shortcut } from '@/types/interfaces'
import LocalStorage from '@/utils/local-storage'
import sample from '@/utils/sample'
import { weightedSampleKey } from '@/utils/weighted-sample'
import toggleFullscreen from '@/utils/toggle-fullscreen'

export type GameSessionBootstrap = {
  tool: string
  categories: string[]
  shortcuts: Shortcut[]
  shortcut: Shortcut
  removedIds: string[]
  answeredHistory: Record<string, boolean[]>
  isFullscreenMode: boolean
}

export const createGameSessionBootstrap = (
  shortcuts?: Shortcut[],
): GameSessionBootstrap => {
  const selectedTool = LocalStorage.get(SELECTED_TOOL_KEY)
  const selectedCategories = LocalStorage.get(SELECTED_CATEGORIES_KEY)
  const selectedShortcuts = shortcutCatalog.where({
    tool: selectedTool,
    categories: selectedCategories,
  })
  const removedIds = [...LocalStorage.get(REMOVED_IDS_KEY)]
  const selectedAvailableShortcuts = selectedShortcuts.filter(
    (shortcut) => !removedIds.includes(shortcut.id),
  )
  const availableShortcuts = shortcuts ?? selectedAvailableShortcuts
  const shortcut =
    import.meta.env.MODE === 'test'
      ? availableShortcuts[0]
      : sample(availableShortcuts)

  return {
    tool: selectedTool,
    categories: selectedCategories,
    shortcuts: shortcuts ?? selectedShortcuts,
    shortcut,
    removedIds,
    answeredHistory: LocalStorage.get(ANSWERED_HISTORY_KEY),
    isFullscreenMode: !!document.fullscreenElement,
  }
}

export const createGameSessionDeps = () => ({
  isFullscreenMode: () => !!document.fullscreenElement,
  sample,
  weightedSampleKey,
  scheduleRestartTyping: (callback: () => void) => {
    setTimeout(callback, import.meta.env.MODE === 'test' ? 0 : 1000)
  },
  toggleFullscreen,
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
