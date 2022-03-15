import { reactive, readonly, computed } from 'vue'

import { Shortcut, KeyCombinable } from '@/types/interfaces'
import KeyCombination from '@/models/keyCombination'

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
    questionIdSet: new Set(shortcuts.map((shortcut) => shortcut.id)),
    removedIdSet: new Set(),
  })

  const shortcut = computed(() => {
    return state.shortcuts.filter(
      (shortcut) =>
        state.questionIdSet.has(shortcut.id) &&
        !state.removedIdSet.has(shortcut.id)
    )[0]
  })
  const correctKeys = computed(() => KeyCombination.extractKeys(shortcut.value))
  const isEnded = computed(() => shortcut.value === undefined)

  const keyDown = (keyCombinable: KeyCombinable) => {
    if (!state.isListeningKeyboardEvent) return

    state.pressedKeyCombination.keyDown(keyCombinable)
    judge()
  }

  const keyUp = (key: string) => {
    if (!state.isListeningKeyboardEvent) return

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
      resetTypingState()
      state.isListeningKeyboardEvent = true
    }, TimeIntervalToRestartTyping)
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true
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
    setTimeout(() => {
      state.isListeningKeyboardEvent = true
      state.isShakingKeyCombinationView = false
      state.pressedKeyCombination.reset()
    }, TimeIntervalToRestartTyping)
  }

  const resetTypingState = () => {
    state.isRemoveKeyPressed = false
    state.isCorrectKeyPressed = false
    state.isWrongKeyPressed = false
    state.pressedKeyCombination.reset()
  }

  return {
    state: readonly(state),

    shortcut,
    correctKeys,
    isEnded,

    keyDown,
    keyUp,
    judge,
    restart,
  }
}

export default gameStore
export type GameStore = ReturnType<typeof gameStore>
