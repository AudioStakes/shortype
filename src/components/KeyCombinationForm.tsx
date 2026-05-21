import IconGlyph from '@/components/IconGlyph'
import KeyList from '@/components/KeyList'
import RequestFullScreenOrSelfScoring from '@/components/RequestFullScreenOrSelfScoring'
import RequestSelfScoring from '@/components/RequestSelfScoring'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

import ShortcutDescription from './ShortcutDescription'

export default function KeyCombinationForm() {
  const { state, needsFullscreenMode } = injectStrict(GameKey, 'GameKey')

  return (
    <div
      class="min-h-44 h-auto w-full max-w-[30rem] mx-auto p-3 sm:p-4 flex flex-col justify-center content-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
      data-testid="pressed-key-combination"
    >
      <div class="h-16 w-16 absolute self-center -translate-y-14 text-green-500">
        {state.isCorrectKeyPressed && !state.isWrongKeyPressed ? (
          <div data-testid="correct-key-pressed">
            <IconGlyph name="check-circle" />
          </div>
        ) : null}
        {state.isCorrectKeyPressed && state.isWrongKeyPressed ? (
          <div data-testid="wrong-key-pressed">
            <IconGlyph name="check" />
          </div>
        ) : null}
        {state.isMarkedSelfAsCorrect ? (
          <div class="-translate-x-20" data-testid="marked-self-as-correct">
            <IconGlyph name="check-circle" />
          </div>
        ) : null}
        {state.isMarkedSelfAsWrong ? (
          <div
            class="translate-x-20 text-gray-500"
            data-testid="marked-self-as-wrong"
          >
            <IconGlyph name="check" />
          </div>
        ) : null}
      </div>
      {!state.shortcut.isAvailable ? (
        <RequestSelfScoring />
      ) : needsFullscreenMode ? (
        <RequestFullScreenOrSelfScoring />
      ) : state.shortcut.needsFillInBlankMode ? (
        <ShortcutDescription isFillInBlankMode={true} />
      ) : state.pressedKeyCombination.hasPressedSomeKey() ? (
        <KeyList keys={state.pressedKeyCombination.keys()} />
      ) : state.isWrongKeyPressed ? (
        <span>正解を入力してみましょう</span>
      ) : (
        <span>ショートカットキーを入力してください...</span>
      )}
    </div>
  )
}
