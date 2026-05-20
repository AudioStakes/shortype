import shortcutCatalog from '@/models/shortcut-catalog'
import type { Shortcut } from '@/types/interfaces'
import sample from '@/utils/sample'
import { weightedSampleKey } from '@/utils/weighted-sample'
import toggleFullscreen from '@/utils/toggle-fullscreen'
import {
  createGameSessionStoragePersistence,
  loadGameSessionStorage,
} from '@/stores/game-session-storage'

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
  const {
    selectedTool,
    selectedCategories,
    removedIds,
    answeredHistory,
  } = loadGameSessionStorage()
  const selectedShortcuts = shortcutCatalog.where({
    tool: selectedTool,
    categories: selectedCategories,
  })
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
    answeredHistory,
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
  ...createGameSessionStoragePersistence(),
})
