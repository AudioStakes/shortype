import { computed, reactive, readonly } from 'vue'

import {
  createShortcutTrainingSession,
  createShortcutTrainingState,
  type ShortcutTrainingState,
} from '@/models/shortcut-training-session'
import {
  createGameSessionBootstrap,
  createGameSessionDeps,
} from '@/stores/game-session'
import type { Shortcut } from '@/types/interfaces'

const gameStore = (shortcuts?: Shortcut[]) => {
  const bootstrap = createGameSessionBootstrap(shortcuts)
  const state = reactive(createShortcutTrainingState(bootstrap))

  const session = createShortcutTrainingSession(
    state as unknown as ShortcutTrainingState,
    createGameSessionDeps(),
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
  const masteredRateOfEachTool = session.masteredRateOfEachTool
  const categoriesWithMasteredRate = session.categoriesWithMasteredRate

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
    masteredRateOfEachTool,
    exitSelectionOfToolAndCategories: session.exitSelectionOfToolAndCategories,
    onFullscreenchange: session.onFullscreenchange,
    categoriesWithMasteredRate,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
