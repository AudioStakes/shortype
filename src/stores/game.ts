import { reactive, readonly, computed } from 'vue'

import { Shortcut, KeyCombinable } from '@/types/interfaces'
import KeyCombination from '@/models/keyCombination'
import {
  getItemFromLocalStorage,
  setItemToLocalStorage,
  loadAnsweredHistory,
  saveAnsweringHistory,
} from '@/utils'

const TimeIntervalToRestartTyping = import.meta.env.MODE === 'test' ? 0 : 1000

const gameStore = (shortcuts: Shortcut[]) => {
  const state = reactive({
    shortcuts: shortcuts,
    isListeningKeyboardEvent: true,
    isCorrectKeyPressed: false,
    isWrongKeyPressed: false,
    isRemoveKeyPressed: false,
    isShakingKeyCombinationView: false,
    pressedKeyCombination: new KeyCombination(),
    answeredHistoryMap: loadAnsweredHistory(),
  })

  const shortcut = computed(() => {
    return state.shortcuts.filter(
      (shortcut) =>
        state.questionIdSet.has(shortcut.id) &&
        !state.removedIdSet.has(shortcut.id)
    )[0]
  })
  const correctKeys = computed(() => KeyCombination.extractKeys(shortcut.value))
  const removedShortcutExists = computed(() => state.removedIdSet.size > 0)
  const isEnded = computed(() => shortcut.value === undefined)

  const keyDown = (keyCombinable: KeyCombinable) => {
    if (isEnded.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyDown(keyCombinable)
    judge()
  }

  const keyUp = (key: string) => {
    if (isEnded.value || !state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyUp(key)
  }

  const judge = () => {
    if (!state.pressedKeyCombination.hasPressedSomeKey()) return
    if (state.pressedKeyCombination.isModifierKey()) return

    if (state.pressedKeyCombination.isOnlyEnterKey()) {
      state.questionIdSet.delete(shortcut.value.id)
      resetTypingState()
    } else if (state.pressedKeyCombination.isRemoveKey()) {
      respondToRemoveKey()
    } else if (state.pressedKeyCombination.is(shortcut.value)) {
      respondToCorrectKey()
    } else if (!state.isWrongKeyPressed) {
      respondToWrongKey()
    }
  }

  const restart = () => {
    state.questionIdSet.clear()
    shortcuts.forEach((shortcut) => state.questionIdSet.add(shortcut.id))
    if (isEnded.value) {
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
    setTimeout(() => {
      state.removedIdSet.add(shortcut.value.id)
      setItemToLocalStorage('removedIds', [...state.removedIdSet])
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true
    if (!state.isWrongKeyPressed) saveResult(state.shortcut.id, true)

    setTimeout(() => {
      state.questionIdSet.delete(shortcut.value.id)
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isWrongKeyPressed = true
    state.isShakingKeyCombinationView = true
    saveResult(shortcut.value.id, false)
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
    }
  }

  return {
    state: readonly(state),

    shortcut,
    correctKeys,
    removedShortcutExists,
    isEnded,

    keyDown,
    keyUp,
    judge,
    restart,
    restoreRemovedShortcuts,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
