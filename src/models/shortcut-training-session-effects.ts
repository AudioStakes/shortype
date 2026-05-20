import { createEmptyShortcut } from '@/models/empty-shortcut'
import type {
  ShortcutTrainingSessionDeps,
  ShortcutTrainingState,
} from '@/models/shortcut-training-session'

export const createShortcutTrainingSessionEffects = (
  state: ShortcutTrainingState,
  deps: ShortcutTrainingSessionDeps,
  nextShortcut: () => ShortcutTrainingState['shortcut'],
  resetTypingState: () => void,
) => {
  const saveResult = (id: string, result: boolean) => {
    if (state.answeredHistoryMap.has(id)) {
      state.answeredHistoryMap.get(id)?.push(result)
    } else {
      state.answeredHistoryMap.set(id, [result])
    }

    deps.persistAnsweredHistory(state.answeredHistoryMap)
  }

  const restartTyping = (afterRestart: () => void) => {
    deps.scheduleRestartTyping(() => {
      afterRestart()
      resetTypingState()
      state.isListeningKeyboardEvent = true
    })
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
    deps.persistRemovedIds(state.removedIdSet)

    restartTyping(() => {
      state.shortcut = nextShortcut()
    })
  }

  const respondToCorrectKey = () => {
    state.isListeningKeyboardEvent = false
    state.isCorrectKeyPressed = true

    if (!state.isWrongKeyPressed) {
      saveResult(state.shortcut.id, true)
    }

    restartTyping(() => {
      state.shortcut = nextShortcut()
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

    restartTyping(() => {
      state.shortcut = nextShortcut()
    })
  }

  const respondToMarkSelfAsWrongKey = () => {
    state.isListeningKeyboardEvent = false
    state.isMarkedSelfAsWrong = true
    saveResult(state.shortcut.id, false)

    restartTyping(() => {
      state.shortcut = nextShortcut()
    })
  }

  const toggleFullscreen = () => {
    deps.toggleFullscreen()
  }

  const restoreRemovedShortcuts = () => {
    if (
      confirm(
        'すべてのショートカットキーが出題されるようになります。\nよろしいですか？',
      )
    ) {
      deps.persistRemovedIds(new Set())
      state.removedIdSet = new Set<string>()
      resetTypingState()
      state.shortcut = state.shortcuts[0] ?? createEmptyShortcut()
    }
  }

  const selectToolAndCategories = (tool: string, categories: string[]) => {
    state.tool = tool
    deps.persistSelectedTool(tool)

    state.categories = new Set(categories)
    deps.persistSelectedCategories(categories)
  }

  return {
    saveResult,
    respondToSelectToolsKey,
    respondToShowCorrectKey,
    respondToRemoveKey,
    respondToCorrectKey,
    respondToWrongKey,
    respondToMarkSelfAsCorrectKey,
    respondToMarkSelfAsWrongKey,
    toggleFullscreen,
    restoreRemovedShortcuts,
    selectToolAndCategories,
  }
}
