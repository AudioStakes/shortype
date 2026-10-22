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
import { createKeyboardLock } from '@/utils/lock-keyboard'

const createGameStore = (
  shortcuts?: readonly Shortcut[],
  onChange: () => void = () => undefined,
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
    ...(shortcuts ? { shortcuts: [...shortcuts] } : {}),
  })
  const state: ShortcutTrainingState = createShortcutTrainingState(bootstrap)

  const notify = () => onChange()
  const deps = createGameSessionDeps()
  let keyboardLockStarted = false
  let keyboardLockRequested = false
  const keyboardLock = createKeyboardLock((acquired) => {
    state.isKeyboardLocked = acquired
    notify()
  })
  const requestKeyboardLock = () => {
    keyboardLockRequested = true
    state.isKeyboardLocked = false
    keyboardLock.request()
  }
  const releaseKeyboardLock = () => {
    keyboardLockRequested = false
    state.isKeyboardLocked = false
    keyboardLock.release()
  }
  const toggleFullscreen = deps.toggleFullscreen
  deps.toggleFullscreen = () => {
    if (keyboardLockStarted && !document.fullscreenElement) {
      requestKeyboardLock()
    }
    return toggleFullscreen()
  }
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
  const startProgressSync = () =>
    deps.subscribeProgress((progress) => {
      trainingSession.applyProgress(progress)
      notify()
    })
  const startKeyboardLock = () => {
    keyboardLockStarted = true
    if (state.isFullscreenMode && !keyboardLockRequested) {
      requestKeyboardLock()
    }
    return () => {
      keyboardLockStarted = false
      releaseKeyboardLock()
    }
  }
  const onFullscreenchange = () => {
    trainingSession.onFullscreenchange()
    if (!state.isFullscreenMode) {
      releaseKeyboardLock()
    } else if (keyboardLockStarted && !keyboardLockRequested) {
      requestKeyboardLock()
    }
  }

  return {
    state,
    startProgressSync,
    startKeyboardLock,

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
    onFullscreenchange: wrap(onFullscreenchange),
    categoriesWithMasteredRate,
  }
}

export default createGameStore
export type GameStore = ReturnType<typeof createGameStore>
