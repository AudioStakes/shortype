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

const createGameStore = (
  shortcuts?: readonly Shortcut[],
  onChange: () => void = () => {},
) => {
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
    shortcuts: shortcuts ? [...shortcuts] : undefined,
  })
  const state: ShortcutTrainingState = createShortcutTrainingState(bootstrap)

  const notify = () => onChange()
  const deps = createGameSessionDeps()
  deps.scheduleRestartTyping = (callback) => {
    setTimeout(
      () => {
        callback()
        notify()
      },
      import.meta.env.MODE === 'test' ? 0 : 1000,
    )
  }

  const trainingSession = createShortcutTrainingSession(
    state,
    createShortcutCatalogSummary(),
    deps,
  )

  const wrap =
    <A extends unknown[], R>(fn: (...args: A) => R) =>
    (...args: A) => {
      const result = fn(...args)
      notify()
      return result
    }

  const masteredRateOfEachTool = trainingSession.masteredRateOfEachTool
  const categoriesWithMasteredRate = trainingSession.categoriesWithMasteredRate

  return {
    state,

    get removedShortcutExists() {
      return trainingSession.removedShortcutExists()
    },
    get isRemovedAll() {
      return trainingSession.isRemovedAll()
    },
    get wordsOfDescriptionFilledByCorrectKeys() {
      return trainingSession.wordsOfDescriptionFilledByCorrectKeys()
    },
    get wordsOfDescriptionFilledByPressedKeys() {
      return trainingSession.wordsOfDescriptionFilledByPressedKeys()
    },
    get needsFullscreenMode() {
      return trainingSession.needsFullscreenMode()
    },
    get countsOfEachStatus() {
      return trainingSession.countsOfEachStatus()
    },

    keyDown: wrap(trainingSession.keyDown),
    keyUp: wrap(trainingSession.keyUp),
    judge: wrap(trainingSession.judge),
    restoreRemovedShortcuts: wrap(trainingSession.restoreRemovedShortcuts),
    selectToolAndCategories: wrap(trainingSession.selectToolAndCategories),
    masteredRateOfEachTool,
    exitSelectionOfToolAndCategories: wrap(
      trainingSession.exitSelectionOfToolAndCategories,
    ),
    onFullscreenchange: wrap(trainingSession.onFullscreenchange),
    categoriesWithMasteredRate,
  }
}

export default createGameStore
export type GameStore = ReturnType<typeof createGameStore>
