import { computed, reactive, readonly } from 'vue'

import shortcutCatalog from '@/models/shortcut-catalog'
import { createShortcutCatalogSummary } from '@/models/shortcut-catalog-summary'
import {
  createShortcutTrainingSession,
  createShortcutTrainingState,
  type ShortcutTrainingState,
} from '@/models/shortcut-training-session'
import {
  createGameSessionBootstrap,
  createGameSessionDeps,
} from '@/stores/game-session'
import { loadGameSessionStorage } from '@/stores/game-session-storage'
import type { Shortcut } from '@/types/interfaces'

const createGameStore = (shortcuts?: Shortcut[]) => {
  const { selectedTool, selectedCategories, removedIds, answeredHistory } =
    loadGameSessionStorage()
  const selectedShortcuts = shortcutCatalog.searchShortcuts({
    tool: selectedTool,
    categories: selectedCategories,
  })
  const bootstrap = createGameSessionBootstrap({
    tool: selectedTool,
    categories: selectedCategories,
    selectedShortcuts,
    removedIds,
    answeredHistory,
    isFullscreenMode: !!document.fullscreenElement,
    shortcuts,
  })
  const state = reactive(createShortcutTrainingState(bootstrap))

  const trainingSession = createShortcutTrainingSession(
    state as unknown as ShortcutTrainingState,
    createShortcutCatalogSummary(),
    createGameSessionDeps(),
  )

  const removedShortcutExists = computed(() =>
    trainingSession.removedShortcutExists(),
  )
  const isRemovedAll = computed(() => trainingSession.isRemovedAll())
  const wordsOfDescriptionFilledByCorrectKeys = computed(() =>
    trainingSession.wordsOfDescriptionFilledByCorrectKeys(),
  )
  const wordsOfDescriptionFilledByPressedKeys = computed(() =>
    trainingSession.wordsOfDescriptionFilledByPressedKeys(),
  )
  const needsFullscreenMode = computed(() =>
    trainingSession.needsFullscreenMode(),
  )
  const countsOfEachStatus = computed(() =>
    trainingSession.countsOfEachStatus(),
  )
  const masteredRateOfEachTool = trainingSession.masteredRateOfEachTool
  const categoriesWithMasteredRate = trainingSession.categoriesWithMasteredRate

  return {
    state: readonly(state),

    removedShortcutExists,
    isRemovedAll,
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
    needsFullscreenMode,
    countsOfEachStatus,

    keyDown: trainingSession.keyDown,
    keyUp: trainingSession.keyUp,
    judge: trainingSession.judge,
    restoreRemovedShortcuts: trainingSession.restoreRemovedShortcuts,
    selectToolAndCategories: trainingSession.selectToolAndCategories,
    masteredRateOfEachTool,
    exitSelectionOfToolAndCategories:
      trainingSession.exitSelectionOfToolAndCategories,
    onFullscreenchange: trainingSession.onFullscreenchange,
    categoriesWithMasteredRate,
  }
}

export default createGameStore
export type GameStore = ReturnType<typeof createGameStore>
