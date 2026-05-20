import { computed, reactive, readonly } from 'vue'

import {
  createShortcutTrainingSession,
  createShortcutTrainingState,
  type ShortcutTrainingState,
} from '@/models/shortcut-training-session'
import createShortcutTrainingSessionSummary from '@/models/shortcut-training-session-summary'
import {
  createGameSessionBootstrap,
  createGameSessionDeps,
} from '@/stores/game-session'
import type { Shortcut } from '@/types/interfaces'

type TrainingSessionSummarySource = Pick<
  ShortcutTrainingState,
  'shortcuts' | 'removedIdSet' | 'answeredHistoryMap'
>

const createTrainingSessionSummary = (state: TrainingSessionSummarySource) =>
  createShortcutTrainingSessionSummary({
    shortcuts: state.shortcuts,
    removedIds: new Set(state.removedIdSet),
    answeredHistory: new Map(state.answeredHistoryMap),
  })

const gameStore = (shortcuts?: Shortcut[]) => {
  const bootstrap = createGameSessionBootstrap(shortcuts)
  const state = reactive(createShortcutTrainingState(bootstrap))

  const session = createShortcutTrainingSession(
    state as unknown as ShortcutTrainingState,
    createGameSessionDeps(),
  )
  const sessionSummary = computed(() => createTrainingSessionSummary(state))

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
  const masteredRateOfEachTool = () =>
    sessionSummary.value.masteredRateOfEachTool()
  const categoriesWithMasteredRate = (tool: string) =>
    sessionSummary.value.categoriesWithMasteredRate(tool)

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
