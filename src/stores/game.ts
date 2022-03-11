import { reactive, readonly, computed } from 'vue'

import { Shortcut, KeyCombinable } from '../types/interfaces'
import KeyCombination from '../models/keyCombination'

const TimeIntervalToRestartTyping = import.meta.env.MODE === 'test' ? 0 : 1000

const gameStore = (shortcuts: Shortcut[]) => {
  const state = reactive({
    shortcuts: shortcuts,
    shortcutIndex: 0,
    isListeningKeyboardEvent: true,
    isCorrectKeyPressed: false,
    isWrongKeyPressed: false,
    isShakingKeyCombinationView: false,
    pressedKeyCombination: new KeyCombination(),
  })

  const shortcut = computed(() => state.shortcuts[state.shortcutIndex])
  const correctKeys = computed(() => KeyCombination.extractKeys(shortcut.value))
  const isEnded = computed(() => state.shortcutIndex >= state.shortcuts.length)

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
      state.shortcutIndex++
      resetTypingState()
    } else if (state.pressedKeyCombination.is(shortcut.value)) {
      respondToCorrectKey()
    } else if (!state.isWrongKeyPressed) {
      respondToWrongKey()
    }
  }

  const restart = () => {
    state.shortcutIndex = 0
    state.isListeningKeyboardEvent = true
    state.isCorrectKeyPressed = false
    state.isWrongKeyPressed = false
    state.isShakingKeyCombinationView = false
    state.pressedKeyCombination.reset()
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true
    setTimeout(() => {
      state.shortcutIndex++
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
