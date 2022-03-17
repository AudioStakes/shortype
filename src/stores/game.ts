import { reactive, readonly, computed } from 'vue'

import { Shortcut, KeyCombinable } from '@/types/interfaces'
import KeyCombination from '@/models/keyCombination'
import {
  getItemFromLocalStorage,
  setItemToLocalStorage,
  loadAnsweredHistory,
  saveAnsweringHistory,
  weight,
  weightedSampleIndex,
} from '@/utils'

const TimeIntervalToRestartTyping = import.meta.env.MODE === 'test' ? 0 : 1000
const removedIds = [...getItemFromLocalStorage('removedIds')]

const gameStore = (shortcuts: Shortcut[]) => {
  const state = reactive({
    shortcut:
      shortcuts.find((shortcut) => !removedIds.includes(shortcut.id)) ??
      shortcuts[0],
    isListeningKeyboardEvent: true,
    isCorrectKeyPressed: false,
    isWrongKeyPressed: false,
    isRemoveKeyPressed: false,
    isShakingKeyCombinationView: false,
    pressedKeyCombination: new KeyCombination(),
    removedIdSet: new Set<string>(removedIds),
    answeredHistoryMap: loadAnsweredHistory(),
  })

  const shortcutsIds = shortcuts.map((shortcut) => shortcut.id)

  const availableIds = computed(() => {
    const removedIds = [...state.removedIdSet]

    return shortcutsIds.filter((id) => !removedIds.includes(id))
  })

  const answeredIds = computed(() => {
    return Array.from(state.answeredHistoryMap.keys())
  })

  const noAnsweredAvailableIds = computed(() => {
    return availableIds.value.filter((id) => !answeredIds.value.includes(id))
  })

  const availableIdToHistoryMap = computed(() => {
    const availableIdToHistoryMap = new Map()

    for (const [id, results] of state.answeredHistoryMap.entries()) {
      if (availableIds.value.includes(id)) {
        availableIdToHistoryMap.set(id, results)
      }
    }

    return availableIdToHistoryMap
  })

  const weightsOfAvailableIds = computed(() => {
    const results = Array.from(availableIdToHistoryMap.value.values())
    return results.map((results) => weight(results))
  })

  const currentRate = computed(() => {
    const allLength = shortcuts.length
    const removedLength = allLength - availableIds.value.length
    const noAnsweredLength = noAnsweredAvailableIds.value.length
    const skilledLength = weightsOfAvailableIds.value.filter(
      (weight) => weight <= 0.6
    ).length

    const removedRate = Math.floor((removedLength / allLength) * 100)
    const noAnsweredRate = Math.floor((noAnsweredLength / allLength) * 100)
    const skilledRate = Math.floor((skilledLength / allLength) * 100)

    return {
      removedRate: removedRate,
      noAnsweredRate: noAnsweredRate,
      skilledRate: skilledRate,
      unskilledRate: 100 - removedRate - noAnsweredRate - skilledRate,
    }
  })

  const correctKeys = computed(() => KeyCombination.extractKeys(state.shortcut))
  const removedShortcutExists = computed(() => state.removedIdSet.size > 0)
  const isAllRemoved = computed(
    () => state.removedIdSet.size >= shortcuts.length
  )

  const keyDown = (keyCombinable: KeyCombinable) => {
    if (isAllRemoved.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyDown(keyCombinable)
    judge()
  }

  const keyUp = (key: string) => {
    if (isAllRemoved.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyUp(key)
  }

  const judge = () => {
    if (!state.pressedKeyCombination.hasPressedSomeKey()) return
    if (state.pressedKeyCombination.isModifierKey()) return

    if (state.pressedKeyCombination.isOnlyEnterKey()) {
      state.shortcut = nextShortcut()
      resetTypingState()
    } else if (state.pressedKeyCombination.isRemoveKey()) {
      respondToRemoveKey()
    } else if (state.pressedKeyCombination.is(state.shortcut)) {
      respondToCorrectKey()
    } else if (!state.isWrongKeyPressed) {
      respondToWrongKey()
    }
  }

  const nextShortcut = () => {
    let nextId: string

    if (noAnsweredAvailableIds.value.length > 0) {
      nextId =
        noAnsweredAvailableIds.value.find((id) => id > state.shortcut.id) ??
        noAnsweredAvailableIds.value[0]
    } else {
      const answeredAvailableIds = Array.from(
        availableIdToHistoryMap.value.keys()
      )
      const weightedSampledIndex = weightedSampleIndex(
        weightsOfAvailableIds.value
      )

      nextId = answeredAvailableIds[weightedSampledIndex]
    }

    return shortcuts.find((shortcut) => shortcut.id === nextId) as Shortcut
  }

  const restart = () => {
    if (isAllRemoved.value) {
      restoreRemovedShortcuts(
        null,
        '出題できるショートカットキーがありません。\n出題しないリストを空にしますか？'
      )
    }
    state.isListeningKeyboardEvent = true
    state.isCorrectKeyPressed = false
    state.isWrongKeyPressed = false
    state.isShakingKeyCombinationView = false
    state.pressedKeyCombination.reset()
  }

  const respondToRemoveKey = () => {
    state.isListeningKeyboardEvent = false
    state.isRemoveKeyPressed = true
    state.removedIdSet.add(state.shortcut.id)
    setItemToLocalStorage('removedIds', [...state.removedIdSet])

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

  const saveResult = (id: string, result: boolean) => {
    if (state.answeredHistoryMap.has(id)) {
      state.answeredHistoryMap.get(id)?.push(result)
    } else {
      state.answeredHistoryMap.set(id, [result])
    }

    saveAnsweringHistory(state.answeredHistoryMap)
  }

  const resetTypingState = () => {
    state.isRemoveKeyPressed = false
    state.isCorrectKeyPressed = false
    state.isWrongKeyPressed = false
    state.pressedKeyCombination.reset()
  }

  const restoreRemovedShortcuts = (
    _e: Event | null,
    confirmationMessage?: string
  ) => {
    if (
      confirm(
        confirmationMessage ??
          'すべてのショートカットキーが出題されるようになります。\nよろしいですか？'
      )
    ) {
      localStorage.removeItem('removedIds')
      state.removedIdSet = new Set<string>()
      state.shortcut = nextShortcut()
    }
  }

  return {
    state: readonly(state),

    correctKeys,
    removedShortcutExists,
    isAllRemoved,

    keyDown,
    keyUp,
    judge,
    restart,
    restoreRemovedShortcuts,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
