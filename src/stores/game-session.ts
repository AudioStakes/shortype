import { createGameSessionStoragePersistence } from '@/stores/game-session-storage'
import type { Shortcut } from '@/types/interfaces'
import sample from '@/utils/sample'
import toggleFullscreen from '@/utils/toggle-fullscreen'
import { weightedSampleKey } from '@/utils/weighted-sample'

const createEmptyShortcut = (): Shortcut => ({
  id: '',
  app: '',
  os: '',
  category: '',
  action: '',
  keysDescription: '',
  keyCombinations: [],
  isAvailable: false,
  unavailableReason: null,
  needsFillInBlankMode: false,
})

export type GameSessionBootstrap = {
  tool: string
  categories: string[]
  shortcuts: Shortcut[]
  shortcut: Shortcut
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
  isFullscreenMode: boolean
}

export type GameSessionBootstrapInput = {
  tool: string
  categories: string[]
  selectedShortcuts: Shortcut[]
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
  isFullscreenMode: boolean
  shortcuts?: Shortcut[]
}

export const createGameSessionBootstrap = ({
  tool,
  categories,
  selectedShortcuts,
  removedIds,
  answeredHistory,
  isFullscreenMode,
  shortcuts,
}: GameSessionBootstrapInput): GameSessionBootstrap => {
  const availableSelectedShortcuts = selectedShortcuts.filter(
    (shortcut) => !removedIds.has(shortcut.id),
  )
  const availableShortcuts = shortcuts ?? availableSelectedShortcuts
  const initialShortcut =
    import.meta.env.MODE === 'test'
      ? availableShortcuts[0]
      : sample(availableShortcuts)

  return {
    tool,
    categories,
    shortcuts: shortcuts ?? selectedShortcuts,
    shortcut: initialShortcut ?? createEmptyShortcut(),
    removedIds,
    answeredHistory,
    isFullscreenMode,
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
