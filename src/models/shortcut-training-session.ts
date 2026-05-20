import KeyCombination from '@/models/key-combination'
import KeyCombinations from '@/models/key-combinations'
import shortcutCatalog from '@/models/shortcut-catalog'
import { createShortcutTrainingSessionEffects } from '@/models/shortcut-training-session-effects'
import {
  getAvailableIdToWeightMap,
  getCountsOfEachStatus,
} from '@/models/shortcut-training-session-status'
import createShortcutTrainingSessionSummary, {
  type ShortcutCatalogSummary,
} from '@/models/shortcut-training-session-summary'
import type { KeyCombinable, Shortcut } from '@/types/interfaces'
import Keyboard from '@/utils/keyboard'
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

export type ShortcutTrainingState = {
  tool: string
  categories: Set<string>
  shortcuts: Shortcut[]
  shortcut: Shortcut

  isListeningKeyboardEvent: boolean
  isCorrectKeyPressed: boolean
  isWrongKeyPressed: boolean
  isRemoveKeyPressed: boolean
  isSelectToolsKeyPressed: boolean
  isShowCorrectKeyPressed: boolean
  isMarkedSelfAsCorrect: boolean
  isMarkedSelfAsWrong: boolean
  isShakingKeyCombinationView: boolean
  isFullscreenMode: boolean

  pressedKeyCombination: KeyCombination
  removedIdSet: Set<string>
  answeredHistoryMap: Map<string, boolean[]>
}

export type ShortcutTrainingSessionDeps = {
  isFullscreenMode: () => boolean
  sample: typeof sample
  weightedSampleKey: typeof weightedSampleKey
  scheduleRestartTyping: (callback: () => void) => void
  toggleFullscreen: () => void
  persistAnsweredHistory: (answeredHistory: Map<string, boolean[]>) => void
  persistRemovedIds: (removedIds: Set<string>) => void
  persistSelectedTool: (tool: string) => void
  persistSelectedCategories: (categories: string[]) => void
}

export const createShortcutTrainingState = ({
  tool,
  categories,
  shortcuts,
  shortcut,
  removedIds,
  answeredHistory,
  isFullscreenMode,
}: {
  tool: string
  categories: string[]
  shortcuts: Shortcut[]
  shortcut: Shortcut
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
  isFullscreenMode: boolean
}): ShortcutTrainingState => ({
  tool,
  categories: new Set(categories),
  shortcuts,
  shortcut,

  isListeningKeyboardEvent: true,
  isCorrectKeyPressed: false,
  isWrongKeyPressed: false,
  isRemoveKeyPressed: false,
  isSelectToolsKeyPressed: false,
  isShowCorrectKeyPressed: false,
  isMarkedSelfAsCorrect: false,
  isMarkedSelfAsWrong: false,
  isShakingKeyCombinationView: false,
  isFullscreenMode,

  pressedKeyCombination: new KeyCombination(),
  removedIdSet: new Set<string>(removedIds),
  answeredHistoryMap: new Map<string, boolean[]>(answeredHistory),
})

const defaultSessionDeps: ShortcutTrainingSessionDeps = {
  isFullscreenMode: () =>
    !!document.fullscreenElement && document.fullscreenElement !== null,
  sample,
  weightedSampleKey,
  scheduleRestartTyping: (callback) => {
    setTimeout(callback, import.meta.env.MODE === 'test' ? 0 : 1000)
  },
  toggleFullscreen,
  persistAnsweredHistory: () => undefined,
  persistRemovedIds: () => undefined,
  persistSelectedTool: () => undefined,
  persistSelectedCategories: () => undefined,
}

export const createShortcutTrainingSession = (
  state: ShortcutTrainingState,
  catalogSummary: ShortcutCatalogSummary,
  deps: ShortcutTrainingSessionDeps = defaultSessionDeps,
) => {
  const correctKeyCombinations = () =>
    new KeyCombinations(
      state.shortcut.keyCombinations.map(
        (keyCombination) => new KeyCombination(keyCombination),
      ),
    )

  const shortcutIds = () => state.shortcuts.map((shortcut) => shortcut.id)

  const availableIds = () =>
    shortcutIds().filter((id) => !state.removedIdSet.has(id))

  const answeredIdSet = () => new Set(state.answeredHistoryMap.keys())

  const unansweredAvailableIds = () =>
    availableIds().filter((id) => !answeredIdSet().has(id))

  const availableIdToWeightMap = () => {
    return getAvailableIdToWeightMap({
      shortcuts: state.shortcuts,
      removedIds: state.removedIdSet,
      answeredHistory: state.answeredHistoryMap,
    })
  }

  const countsOfEachStatus = () => {
    return getCountsOfEachStatus({
      shortcuts: state.shortcuts,
      removedIds: state.removedIdSet,
      answeredHistory: state.answeredHistoryMap,
    })
  }

  const createSummary = () =>
    createShortcutTrainingSessionSummary(
      {
        shortcuts: state.shortcuts,
        removedIds: new Set(state.removedIdSet),
        answeredHistory: new Map(state.answeredHistoryMap),
      },
      catalogSummary,
    )

  const wordsOfDescriptionFilledByCorrectKeys = () =>
    Keyboard.splitByKeyDescription(state.shortcut.keysDescription).map(
      (word) => Keyboard.keyOfKeyDescription(word) ?? word,
    )

  const wordsOfDescriptionFilledByPressedKeys = () => {
    const pressedKeys = state.pressedKeyCombination.keys()

    return Keyboard.splitByKeyDescription(state.shortcut.keysDescription)
      .map((word) => Keyboard.keyOfKeyDescription(word) ?? word)
      .map((word) => {
        if (Keyboard.isKey(word) && !Keyboard.isUndetectableKey(word)) {
          return pressedKeys.shift() ?? ''
        }

        return word
      })
  }

  const needsFullscreenMode = () =>
    correctKeyCombinations().hasOnlyAvailableInFullscreen() &&
    !state.isFullscreenMode

  const removedShortcutExists = () => state.removedIdSet.size > 0
  const isRemovedAll = () =>
    state.shortcuts.every((shortcut) => state.removedIdSet.has(shortcut.id))

  const nextShortcut = () => {
    const unansweredAvailableIdList = unansweredAvailableIds()
    const unansweredAvailableIdSet = new Set(unansweredAvailableIdList)
    const shortcutByIdMap = new Map(
      state.shortcuts.map((shortcut) => [shortcut.id, shortcut] as const),
    )

    if (unansweredAvailableIdList.length === 0) {
      const nextId = deps.weightedSampleKey(availableIdToWeightMap())

      return (
        shortcutByIdMap.get(nextId) ??
        state.shortcuts[0] ??
        createEmptyShortcut()
      )
    }

    if (unansweredAvailableIdList.length === 1) {
      return (
        shortcutByIdMap.get(unansweredAvailableIdList[0]) ??
        state.shortcuts[0] ??
        createEmptyShortcut()
      )
    }

    const unansweredAvailableShortcuts = state.shortcuts
      .filter((shortcut) => unansweredAvailableIdSet.has(shortcut.id))
      .filter((shortcut) => shortcut.id !== state.shortcut.id)

    return deps.sample(unansweredAvailableShortcuts)
  }

  const resetTypingState = () => {
    state.isRemoveKeyPressed = false
    state.isCorrectKeyPressed = false
    state.isWrongKeyPressed = false
    state.isSelectToolsKeyPressed = false
    state.isShowCorrectKeyPressed = false
    state.isMarkedSelfAsCorrect = false
    state.isMarkedSelfAsWrong = false
    state.pressedKeyCombination.reset()
  }

  const effects = createShortcutTrainingSessionEffects(
    state,
    deps,
    nextShortcut,
    resetTypingState,
  )

  const judge = () => {
    if (!state.pressedKeyCombination.hasPressedSomeKey()) return
    const currentCorrectKeyCombinations = correctKeyCombinations()
    const isFullscreenOnlyShortcut =
      currentCorrectKeyCombinations.hasOnlyAvailableInFullscreen() &&
      !state.isFullscreenMode

    if (
      state.pressedKeyCombination.isModifierKey() &&
      !currentCorrectKeyCombinations.hasOnlyModifierKeys()
    ) {
      return
    }

    if (
      state.pressedKeyCombination.isOnlyEnterKey() &&
      !currentCorrectKeyCombinations.hasOnlyEnterKey()
    ) {
      state.shortcut = nextShortcut()
      resetTypingState()
      return
    }

    if (state.pressedKeyCombination.isRemoveKey()) {
      effects.respondToRemoveKey()
      return
    }

    if (state.pressedKeyCombination.isSelectToolsKey()) {
      effects.respondToSelectToolsKey()
      return
    }

    if (state.pressedKeyCombination.isToggleFullscreenKey()) {
      effects.toggleFullscreen()
      return
    }

    if (state.shortcut.isAvailable && !isFullscreenOnlyShortcut) {
      if (currentCorrectKeyCombinations.has(state.pressedKeyCombination)) {
        effects.respondToCorrectKey()
      } else if (
        !state.isWrongKeyPressed &&
        !state.pressedKeyCombination.isModifierKey()
      ) {
        effects.respondToWrongKey()
      }
    } else {
      if (
        !state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isShowCorrectKey()
      ) {
        effects.respondToShowCorrectKey()
      } else if (
        state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isMarkedSelfAsCorrectKey()
      ) {
        effects.respondToMarkSelfAsCorrectKey()
      } else if (
        state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isMarkedSelfAsWrongKey()
      ) {
        effects.respondToMarkSelfAsWrongKey()
      }
    }
  }

  const keyDown = (keyCombinable: KeyCombinable) => {
    if (isRemovedAll() || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyDown(keyCombinable)
    judge()
  }

  const keyUp = (key: string) => {
    if (isRemovedAll() || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyUp(key)
  }

  const restoreRemovedShortcuts = () => {
    effects.restoreRemovedShortcuts()
  }

  const selectToolAndCategories = (tool: string, categories: string[]) => {
    effects.selectToolAndCategories(tool, categories)

    state.shortcuts = shortcutCatalog.searchShortcuts({
      tool,
      categories,
    })

    state.shortcut =
      state.shortcuts.find(
        (shortcut) => !state.removedIdSet.has(shortcut.id),
      ) ??
      state.shortcuts[0] ??
      createEmptyShortcut()

    exitSelectionOfToolAndCategories()
  }

  const exitSelectionOfToolAndCategories = () => {
    resetTypingState()
    state.isListeningKeyboardEvent = true
  }

  const onFullscreenchange = () => {
    state.isFullscreenMode = deps.isFullscreenMode()
    state.pressedKeyCombination.reset()
  }

  const masteredRateOfEachTool = () => createSummary().masteredRateOfEachTool()
  const categoriesWithMasteredRate = (tool: string) =>
    createSummary().categoriesWithMasteredRate(tool)

  return {
    correctKeyCombinations,
    availableIds,
    unansweredAvailableIds,
    availableIdToWeightMap,
    countsOfEachStatus,
    masteredRateOfEachTool,
    categoriesWithMasteredRate,
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
    needsFullscreenMode,
    removedShortcutExists,
    isRemovedAll,
    keyDown,
    keyUp,
    judge,
    restoreRemovedShortcuts,
    selectToolAndCategories,
    exitSelectionOfToolAndCategories,
    onFullscreenchange,
  }
}

export default createShortcutTrainingSession
