import { computed, reactive, readonly } from 'vue'

import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import shortcutCatalog from '@/models/shortcut-catalog'
import {
  createShortcutTrainingSession,
  createShortcutTrainingState,
  type ShortcutTrainingSessionDeps,
  type ShortcutTrainingState,
} from '@/models/shortcut-training-session'
import type { Shortcut } from '@/types/interfaces'
import LocalStorage from '@/utils/local-storage'
import sample from '@/utils/sample'
import { weightedSampleKey } from '@/utils/weighted-sample'
import toggleFullscreen from '@/utils/toggle-fullscreen'

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

const createInitialShortcut = (
  shortcuts: Shortcut[] | undefined,
  selectedShortcuts: Shortcut[],
) => {
  const availableShortcuts = shortcuts ?? selectedShortcuts

  if (import.meta.env.MODE === 'test') {
    return availableShortcuts[0]
  }

  return sample(availableShortcuts)
}

const createTrainingSessionDeps = (): ShortcutTrainingSessionDeps => ({
  isFullscreenMode: () => !!document.fullscreenElement,
  sample,
  weightedSampleKey,
  scheduleRestartTyping: (callback) => {
    setTimeout(callback, import.meta.env.MODE === 'test' ? 0 : 1000)
  },
  toggleFullscreen,
  persistAnsweredHistory: (answeredHistory) => {
    LocalStorage.set(ANSWERED_HISTORY_KEY, answeredHistory)
  },
  persistRemovedIds: (removedIds) => {
    LocalStorage.set(REMOVED_IDS_KEY, removedIds)
  },
  persistSelectedTool: (tool) => {
    LocalStorage.set(SELECTED_TOOL_KEY, tool)
  },
  persistSelectedCategories: (categories) => {
    LocalStorage.set(SELECTED_CATEGORIES_KEY, categories)
  },
})

const gameStore = (shortcuts?: Shortcut[]) => {
  const state = reactive(
    createShortcutTrainingState({
      tool: selectedTool,
      categories: selectedCategories,
      shortcuts: shortcuts ?? selectedShortcuts,
      shortcut: createInitialShortcut(shortcuts, selectedAvailableShortcuts),
      removedIds,
      answeredHistory: LocalStorage.get(ANSWERED_HISTORY_KEY),
      isFullscreenMode: !!document.fullscreenElement,
    }),
  )

  const session = createShortcutTrainingSession(
    state as unknown as ShortcutTrainingState,
    createTrainingSessionDeps(),
  )

  const removedShortcutExists = computed(() => session.removedShortcutExists())
  const isRemovedAll = computed(() => session.isRemovedAll())
  const wordsOfDescriptionFilledByCorrectKeys = computed(() =>
    session.wordsOfDescriptionFilledByCorrectKeys(),
  )
  const wordsOfDescriptionFilledByPressedKeys = computed(() =>
    session.wordsOfDescriptionFilledByPressedKeys(),
  )
  const needsFullscreenMode = computed(() => session.needsFullscreenMode())
  const countsOfEachStatus = computed(() => session.countsOfEachStatus())

  return {
    state: readonly(state),

    removedShortcutExists,
    isRemovedAll,
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
    needsFullscreenMode,
    countsOfEachStatus,

    keyDown: session.keyDown,
    keyUp: session.keyUp,
    judge: session.judge,
    restoreRemovedShortcuts: session.restoreRemovedShortcuts,
    selectToolAndCategories: session.selectToolAndCategories,
    masteredRateOfEachTool: session.masteredRateOfEachTool,
    exitSelectionOfToolAndCategories: session.exitSelectionOfToolAndCategories,
    onFullscreenchange: session.onFullscreenchange,
    categoriesWithMasteredRate: session.categoriesWithMasteredRate,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
