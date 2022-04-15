import { computed, reactive, readonly } from 'vue'

import TOOL_TO_SHORTCUTS_MAP from '@/constants/tool-to-shortcuts-map'
import KeyCombination from '@/models/key-combination'
import KeyCombinations from '@/models/key-combinations'
import { KeyCombinable, Shortcut } from '@/types/interfaces'
import Keyboard from '@/utils/keyboard'
import {
  loadAnsweredHistory,
  loadRemovedIds,
  loadSelectedCategories,
  loadSelectedTool,
  saveAnsweredHistory,
  saveRemovedIds,
  saveSelectedCategories,
  saveSelectedTool,
} from '@/utils/local-storage'
import sample from '@/utils/sample'
import shortcutStorage from '@/utils/shortcut-storage'
import toggleFullscreen from '@/utils/toggle-fullscreen'
import { weight, weightedSampleKey } from '@/utils/weighted-sample'

const selectedTool = loadSelectedTool()
const selectedCategories = loadSelectedCategories()
const selectedShortcuts = shortcutStorage.where({
  tool: selectedTool,
  categories: selectedCategories,
})

const removedIds = [...loadRemovedIds()]

const selectedAvailableShortcuts = selectedShortcuts.filter(
  (shortcut) => !removedIds.includes(shortcut.id)
)

const TimeIntervalToRestartTyping = import.meta.env.MODE === 'test' ? 0 : 1000

const gameStore = (shortcuts?: Shortcut[]) => {
  const state = reactive({
    tool: selectedTool,
    categories: new Set(selectedCategories),
    shortcuts: shortcuts ?? selectedShortcuts,
    shortcut:
      import.meta.env.MODE === 'test'
        ? (shortcuts ?? selectedAvailableShortcuts)[0] // 出題順に依存しているテストがあるため
        : sample(shortcuts ?? selectedAvailableShortcuts),

    isListeningKeyboardEvent: true,
    isCorrectKeyPressed: false,
    isWrongKeyPressed: false,
    isRemoveKeyPressed: false,
    isSelectToolsKeyPressed: false,
    isShowCorrectKeyPressed: false,
    isMarkedSelfAsCorrect: false,
    isMarkedSelfAsWrong: false,
    isShakingKeyCombinationView: false,
    isFullscreenMode:
      !!document.fullscreenElement && document.fullscreenElement !== null,

    pressedKeyCombination: new KeyCombination(),
    removedIdSet: new Set<string>(removedIds),
    answeredHistoryMap: loadAnsweredHistory(),
  })

  const correctKeyCombinations = computed(
    () =>
      new KeyCombinations(
        state.shortcut.keyCombinations.map(
          (keyCombination) => new KeyCombination(keyCombination)
        )
      )
  )

  const shortcutsIds = computed(() =>
    state.shortcuts.map((shortcut) => shortcut.id)
  )

  const availableIds = computed(() =>
    shortcutsIds.value.filter((id) => !state.removedIdSet.has(id))
  )

  const answeredIds = computed(() => {
    return Array.from(state.answeredHistoryMap.keys())
  })

  const noAnsweredAvailableIds = computed(() => {
    return availableIds.value.filter((id) => !answeredIds.value.includes(id))
  })

  const idToWeightMap = computed(() => {
    const idToWeightMap = new Map()

    for (const [id, results] of state.answeredHistoryMap.entries()) {
      if (shortcutsIds.value.includes(id)) {
        idToWeightMap.set(id, weight(results))
      }
    }

    return idToWeightMap
  })

  const availableIdToWeightMap = computed(() => {
    const availableIdToWeightMap = new Map()

    for (const [id, weight] of idToWeightMap.value.entries()) {
      if (availableIds.value.includes(id)) {
        availableIdToWeightMap.set(id, weight)
      }
    }

    return availableIdToWeightMap
  })

  const countsOfEachStatus = computed(() => {
    const [masteredIds, unmasteredIds]: [string[], string[]] = [
      ...idToWeightMap.value,
    ].reduce(
      ([masteredIds, unmasteredIds], [id, weight]) =>
        weight <= 0.6
          ? [[...masteredIds, id], unmasteredIds]
          : [masteredIds, [...unmasteredIds, id]],
      [[], []]
    )

    const noAnsweredIds = shortcutsIds.value.filter(
      (id) => !answeredIds.value.includes(id)
    )

    return {
      mastered: {
        included: masteredIds.filter((id) => availableIds.value.includes(id))
          .length,
        removed: masteredIds.filter((id) => !availableIds.value.includes(id))
          .length,
      },
      unmastered: {
        included: unmasteredIds.filter((id) => availableIds.value.includes(id))
          .length,
        removed: unmasteredIds.filter((id) => !availableIds.value.includes(id))
          .length,
      },
      noAnswered: {
        included: noAnsweredIds.filter((id) => availableIds.value.includes(id))
          .length,
        removed: noAnsweredIds.filter((id) => !availableIds.value.includes(id))
          .length,
      },
    }
  })

  const wordsOfDescriptionFilledByCorrectKeys = computed(() =>
    Keyboard.splitByKeyDescription(state.shortcut.keysDescription).map(
      (word) => Keyboard.keyOfKeyDescription(word) ?? word
    )
  )

  const wordsOfDescriptionFilledByPressedKeys = computed(() => {
    const pressedKeys = state.pressedKeyCombination.keys()

    return Keyboard.splitByKeyDescription(state.shortcut.keysDescription)
      .map((word) => Keyboard.keyOfKeyDescription(word) ?? word)
      .map((word) => {
        if (Keyboard.isKey(word) && !Keyboard.isUndetectableKey(word)) {
          return pressedKeys.shift() ?? ''
        } else {
          return word
        }
      })
  })

  const needsFullscreenMode = computed(() => {
    return (
      correctKeyCombinations.value.hasOnlyAvailableInFullscreen() &&
      !state.isFullscreenMode
    )
  })

  const removedShortcutExists = computed(() => state.removedIdSet.size > 0)
  const isRemovedAll = computed(() =>
    state.shortcuts.every((shortcut) => state.removedIdSet.has(shortcut.id))
  )

  const keyDown = (keyCombinable: KeyCombinable) => {
    if (isRemovedAll.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyDown(keyCombinable)
    judge()
  }

  const keyUp = (key: string) => {
    if (isRemovedAll.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyUp(key)
  }

  const judge = () => {
    if (!state.pressedKeyCombination.hasPressedSomeKey()) return
    if (
      state.pressedKeyCombination.isModifierKey() &&
      !correctKeyCombinations.value.hasOnlyModifierKeys()
    )
      return

    if (
      state.pressedKeyCombination.isOnlyEnterKey() &&
      !correctKeyCombinations.value.hasOnlyEnterKey()
    ) {
      state.shortcut = nextShortcut()
      resetTypingState()
      return
    } else if (state.pressedKeyCombination.isRemoveKey()) {
      respondToRemoveKey()
      return
    } else if (state.pressedKeyCombination.isSelectToolsKey()) {
      respondToSelectToolsKey()
      return
    } else if (state.pressedKeyCombination.isToggleFullscreenKey()) {
      toggleFullscreen()
      return
    }

    if (state.shortcut.isAvailable && !needsFullscreenMode.value) {
      if (
        correctKeyCombinations.value.has(
          state.pressedKeyCombination as KeyCombination
        )
      ) {
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

  const nextShortcut = () => {
    if (noAnsweredAvailableIds.value.length === 0) {
      const nextId = weightedSampleKey(availableIdToWeightMap.value)

      return state.shortcuts.find(
        (shortcut) => shortcut.id === nextId
      ) as Shortcut
    } else if (noAnsweredAvailableIds.value.length === 1) {
      return state.shortcuts.find(
        (shortcut) => shortcut.id === noAnsweredAvailableIds.value[0]
      ) as Shortcut
    } else {
      const noAnsweredAvailableShortcuts = state.shortcuts
        .filter((shortcut) =>
          noAnsweredAvailableIds.value.includes(shortcut.id)
        )
        .filter((shortcut) => shortcut.id !== state.shortcut.id)

      return sample(noAnsweredAvailableShortcuts)
    }
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
    saveRemovedIds([...state.removedIdSet])

    setTimeout(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true
    if (!state.isWrongKeyPressed) saveResult(state.shortcut.id, true)

    setTimeout(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isWrongKeyPressed = true
    state.isShakingKeyCombinationView = true
    saveResult(state.shortcut.id, false)

    setTimeout(() => {
      state.isListeningKeyboardEvent = true
      state.isShakingKeyCombinationView = false
      state.pressedKeyCombination.reset()
    }, TimeIntervalToRestartTyping)
  }

  const respondToMarkSelfAsCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isMarkedSelfAsCorrect = true
    saveResult(state.shortcut.id, true)

    setTimeout(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToMarkSelfAsWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isMarkedSelfAsWrong = true
    saveResult(state.shortcut.id, false)

    setTimeout(() => {
      state.shortcut = nextShortcut()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const saveResult = (id: string, result: boolean) => {
    if (state.answeredHistoryMap.has(id)) {
      state.answeredHistoryMap.get(id)?.push(result)
    } else {
      state.answeredHistoryMap.set(id, [result])
    }

    saveAnsweredHistory(state.answeredHistoryMap)
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

  const restoreRemovedShortcuts = () => {
    if (
      confirm(
        'すべてのショートカットキーが出題されるようになります。\nよろしいですか？'
      )
    ) {
      localStorage.removeItem('removedIds')
      state.removedIdSet = new Set<string>()
      resetTypingState()
      state.shortcut = state.shortcuts[0]
    }
  }

  const selectToolAndCategories = (tool: string, categories: string[]) => {
    state.tool = tool
    saveSelectedTool(tool)

    state.categories = new Set(categories)
    saveSelectedCategories(categories)

    state.shortcuts = shortcutStorage.where({
      tool,
      categories,
    })

    state.shortcut =
      state.shortcuts.find((shortcut) => !removedIds.includes(shortcut.id)) ??
      state.shortcuts[0]

    exitSelectionOfToolAndCategories()
  }

  const exitSelectionOfToolAndCategories = () => {
    resetTypingState()
    state.isListeningKeyboardEvent = true
  }

  const masteredRateOfEachTool = (): {
    name: string
    masteredRate: number
  }[] => {
    const masteredIds = [...state.answeredHistoryMap]
      .map(([id, results]) => [id, weight(results)])
      .filter(([, weight]) => weight <= 0.6)
      .map(([id]) => id)

    const masteredRateOfEachTool: { name: string; masteredRate: number }[] = []

    TOOL_TO_SHORTCUTS_MAP.forEach((shortcuts, name) => {
      const countOfShortcut = shortcuts.filter(
        (shortcut) => !state.removedIdSet.has(shortcut.id)
      ).length
      const countOfMastered = shortcuts.filter(
        (shortcut) =>
          masteredIds.includes(shortcut.id) &&
          !state.removedIdSet.has(shortcut.id)
      ).length

      masteredRateOfEachTool.push({
        name,
        masteredRate: Math.floor((countOfMastered / countOfShortcut) * 100),
      })
    })

    return masteredRateOfEachTool
  }

  const categoriesWithMasteredRate = (
    tool: string
  ): {
    name: string
    masteredRate: number
  }[] => {
    const shortcutsOfTool = shortcutStorage.where({ tool })
    const categoriesOfTool = new Set(
      shortcutsOfTool.map((shortcut) => shortcut.category)
    )
    const masteredIds = [...state.answeredHistoryMap]
      .map(([id, results]) => [id, weight(results)])
      .filter(([, weight]) => weight <= 0.6)
      .map(([id]) => id)

    return Object.values([...categoriesOfTool]).map((categoryName) => {
      const shortcutsOfCategory = shortcutsOfTool.filter(
        (shortcut) =>
          shortcut.category === categoryName &&
          !state.removedIdSet.has(shortcut.id)
      )
      const masteredShortcutsOfCategory = shortcutsOfCategory.filter(
        (shortcut) => masteredIds.includes(shortcut.id)
      )

      return {
        name: categoryName,
        masteredRate: Math.floor(
          (masteredShortcutsOfCategory.length / shortcutsOfCategory.length) *
            100
        ),
      }
    })
  }

  const onFullscreenchange = () => {
    state.isFullscreenMode = !!document.fullscreenElement
    state.pressedKeyCombination.reset()
  }

  return {
    state: readonly(state),

    removedShortcutExists,
    isRemovedAll,
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
    needsFullscreenMode,
    countsOfEachStatus,

    keyDown,
    keyUp,
    judge,
    restoreRemovedShortcuts,
    selectToolAndCategories,
    masteredRateOfEachTool,
    exitSelectionOfToolAndCategories,
    onFullscreenchange,
    categoriesWithMasteredRate,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
