import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'

import CorrectAnswer from '@/components/CorrectAnswer'
import KeyCombinationForm from '@/components/KeyCombinationForm'
import PieChart from '@/components/PieChart'
import QuestionShow from '@/components/QuestionShow'
import RestoreButton from '@/components/RestoreButton'
import ShortcutsShow from '@/components/ShortcutsShow'
import ToolsAndCategoriesModal from '@/components/ToolsAndCategoriesModal'
import useEventListener from '@/composables/use-event-listener'
import useKeyboardEventListener from '@/composables/use-keyboard-event-listener'
import createGameStore from '@/stores/game'
import GameKey from '@/stores/game-key'
import ModalKey from '@/stores/modal-key'
import type {
  NavigatorExtend,
  NavigatorKeyboard,
  Shortcut,
} from '@/types/interfaces'
import { injectStrict } from '@/utils/inject-strict'
import Keyboard from '@/utils/keyboard'
import lockKeyboard from '@/utils/lock-keyboard'

type Props = {
  shortcuts?: readonly Shortcut[]
}

export default function GameView({ shortcuts }: Props) {
  const [, forceUpdate] = useState(0)
  const game = useMemo(
    () => createGameStore(shortcuts, () => forceUpdate((value) => value + 1)),
    [shortcuts],
  )

  const keyboard = useMemo(() => new Keyboard(), [])
  const { modalState } = injectStrict(ModalKey, 'ModalKey')
  const isModalVisible =
    modalState.isAboutModalVisible ||
    modalState.isPrivacyModalVisible ||
    modalState.isToolsAndCategoriesModalVisible ||
    game.state.isSelectToolsKeyPressed

  useEffect(() => {
    if ('keyboard' in navigator) {
      void keyboard.setKeyboardLayoutMap(
        (navigator as NavigatorExtend).keyboard as NavigatorKeyboard,
      )
      lockKeyboard()
    }
  }, [keyboard])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { altKey, metaKey, shiftKey, ctrlKey } = e
      const key = keyboard.key(e) as string

      if (
        key === 'Tab' &&
        !game.state.shortcut.keyCombinations.some(
          (combination) =>
            combination.key === 'Tab' &&
            combination.altKey === altKey &&
            combination.metaKey === metaKey &&
            combination.shiftKey === shiftKey &&
            combination.ctrlKey === ctrlKey,
        )
      )
        return

      game.keyDown({ altKey, metaKey, shiftKey, ctrlKey, key })
    },
    [game, keyboard],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = keyboard.key(e) as string

      game.keyUp(key)
    },
    [game, keyboard],
  )

  useEventListener('fullscreenchange', game.onFullscreenchange)
  useKeyboardEventListener(
    'keydown',
    handleKeyDown,
    !isModalVisible && !game.isRemovedAll,
  )
  useKeyboardEventListener('keyup', handleKeyUp)

  return (
    <GameKey.Provider value={game}>
      <div class="flex-1 flex flex-col">
        {!game.isRemovedAll ? (
          <div class="flex-1 flex flex-col items-center overflow-x-hidden px-4">
            <PieChart />
            <QuestionShow />
            <CorrectAnswer />
            <KeyCombinationForm />
            <div class="my-4 w-full sm:my-auto">
              <ShortcutsShow />
              <RestoreButton />
            </div>
          </div>
        ) : (
          <div>
            <span>出題できるショートカットキーがありません。</span>
            <RestoreButton class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4" />
          </div>
        )}
        <ToolsAndCategoriesModal />
      </div>
    </GameKey.Provider>
  )
}
