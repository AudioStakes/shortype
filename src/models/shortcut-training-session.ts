import KeyCombination from '@/models/key-combination'
import KeyCombinations from '@/models/key-combinations'
import shortcutCatalog from '@/models/shortcut-catalog'
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
  persistAnsweredHistory: (answeredHistory: Record<string, boolean[]>) => void
  persistRemovedIds: (removedIds: string[]) => void
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
  removedIds: string[]
  answeredHistory: Record<string, boolean[]>
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
  answeredHistoryMap: new Map<string, boolean[]>(
    Object.entries(answeredHistory),
  ),
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
  deps: ShortcutTrainingSessionDeps = defaultSessionDeps,
  catalogSummary: ShortcutCatalogSummary,
) => {
  const correctKeyCombinations = () =>
    new KeyCombinations(
      state.shortcut.keyCombinations.map(
        (keyCombination) => new KeyCombination(keyCombination),
      ),
    )

  const shortcutsIds = () => state.shortcuts.map((shortcut) => shortcut.id)

  const availableIds = () =>
    shortcutsIds().filter((id) => !state.removedIdSet.has(id))

  const answeredIds = () => Array.from(state.answeredHistoryMap.keys())

  const noAnsweredAvailableIds = () =>
    availableIds().filter((id) => !answeredIds().includes(id))

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
    if (noAnsweredAvailableIds().length === 0) {
      const nextId = deps.weightedSampleKey(availableIdToWeightMap())

      return state.shortcuts.find(
        (shortcut) => shortcut.id === nextId,
      ) as Shortcut
    }

    if (noAnsweredAvailableIds().length === 1) {
      return state.shortcuts.find(
        (shortcut) => shortcut.id === noAnsweredAvailableIds()[0],
      ) as Shortcut
    }

    const noAnsweredAvailableShortcuts = state.shortcuts
      .filter((shortcut) => noAnsweredAvailableIds().includes(shortcut.id))
      .filter((shortcut) => shortcut.id !== state.shortcut.id)

    return deps.sample(noAnsweredAvailableShortcuts)
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

  const saveResult = (id: string, result: boolean) => {
    if (state.answeredHistoryMap.has(id)) {
      state.answeredHistoryMap.get(id)?.push(result)
    } else {
      state.answeredHistoryMap.set(id, [result])
    }

    deps.persistAnsweredHistory(Object.fromEntries(state.answeredHistoryMap))
  }

  const respondToSelectToolsKey = () => {
    resetTypingState()
    state.isListeningKeyboardEvent = false
    state.isSelectToolsKeyPressed = true
  }

  const respondToShowCorrectKey = () => {
    resetTypingState()
    state.isShowCorrectKeyPressed = true
  }

  const respondToRemoveKey = () => {
    state.isListeningKeyboardEvent = false
    state.isRemoveKeyPressed = true
    state.removedIdSet.add(state.shortcut.id)
    deps.persistRemovedIds([...state.removedIdSet])

    deps.scheduleRestartTyping(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    })
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true

    if (!state.isWrongKeyPressed) saveResult(state.shortcut.id, true)

    deps.scheduleRestartTyping(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    })
  }

  const respondToWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isWrongKeyPressed = true
    state.isShakingKeyCombinationView = true
    saveResult(state.shortcut.id, false)

    deps.scheduleRestartTyping(() => {
      state.isListeningKeyboardEvent = true
      state.isShakingKeyCombinationView = false
      state.pressedKeyCombination.reset()
    })
  }

  const respondToMarkSelfAsCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isMarkedSelfAsCorrect = true
    saveResult(state.shortcut.id, true)

    deps.scheduleRestartTyping(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    })
  }

  const respondToMarkSelfAsWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isMarkedSelfAsWrong = true
    saveResult(state.shortcut.id, false)

    deps.scheduleRestartTyping(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    })
  }

  const judge = () => {
    if (!state.pressedKeyCombination.hasPressedSomeKey()) return
    if (
      state.pressedKeyCombination.isModifierKey() &&
      !correctKeyCombinations().hasOnlyModifierKeys()
    ) {
      return
    }

    if (
      state.pressedKeyCombination.isOnlyEnterKey() &&
      !correctKeyCombinations().hasOnlyEnterKey()
    ) {
      state.shortcut = nextShortcut()
      resetTypingState()
      return
    }

    if (state.pressedKeyCombination.isRemoveKey()) {
      respondToRemoveKey()
      return
    }

    if (state.pressedKeyCombination.isSelectToolsKey()) {
      respondToSelectToolsKey()
      return
    }

    if (state.pressedKeyCombination.isToggleFullscreenKey()) {
      deps.toggleFullscreen()
      return
    }

    if (state.shortcut.isAvailable && !needsFullscreenMode()) {
      if (correctKeyCombinations().has(state.pressedKeyCombination)) {
        respondToCorrectKey()
      } else if (
        !state.isWrongKeyPressed &&
        !state.pressedKeyCombination.isModifierKey()
      ) {
        respondToWrongKey()
      }
    } else {
      if (
        !state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isShowCorrectKey()
      ) {
        respondToShowCorrectKey()
      } else if (
        state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isMarkedSelfAsCorrectKey()
      ) {
        respondToMarkSelfAsCorrectKey()
      } else if (
        state.isShowCorrectKeyPressed &&
        state.pressedKeyCombination.isMarkedSelfAsWrongKey()
      ) {
        respondToMarkSelfAsWrongKey()
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
    if (
      confirm(
        'すべてのショートカットキーが出題されるようになります。\nよろしいですか？',
      )
    ) {
      deps.persistRemovedIds([])
      state.removedIdSet = new Set<string>()
      resetTypingState()
      state.shortcut = state.shortcuts[0]
    }
  }

  const selectToolAndCategories = (tool: string, categories: string[]) => {
    state.tool = tool
    deps.persistSelectedTool(tool)

    state.categories = new Set(categories)
    deps.persistSelectedCategories(categories)

    state.shortcuts = shortcutCatalog.where({
      tool,
      categories,
    })

    state.shortcut =
      state.shortcuts.find(
        (shortcut) => !state.removedIdSet.has(shortcut.id),
      ) ?? state.shortcuts[0]

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
    answeredIds,
    noAnsweredAvailableIds,
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
