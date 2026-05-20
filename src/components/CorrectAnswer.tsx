import KeyList from '@/components/KeyList'
import ShortcutDescription from '@/components/ShortcutDescription'
import { FUNCTION_KEY_DESCRIPTION_REGEXP } from '@/constants/key-description-regexp'
import KeyCombination from '@/models/key-combination'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function CorrectAnswer() {
  const { state } = injectStrict(GameKey, 'GameKey')

  return (
    <div class="h-fit min-h-[9rem] flex flex-col justify-center content-center relative">
      {state.isWrongKeyPressed || state.isShowCorrectKeyPressed ? (
        <div
          class="scale-[0.8] w-fit px-12 py-4 self-center text-green-700 bg-green-100/50 rounded-lg"
          data-testid="correct-key-combination"
        >
          <span class="text-xl my-2">正解</span>
          {state.shortcut.isAvailable &&
          !state.shortcut.needsFillInBlankMode &&
          !FUNCTION_KEY_DESCRIPTION_REGEXP.test(
            state.shortcut.keysDescription,
          ) ? (
            <div class="flex">
              {state.shortcut.keyCombinations.map((keyCombination, index) => (
                <div key={index} class="flex">
                  {index > 0 ? (
                    <span class="mx-8 my-auto text-xl">もしくは</span>
                  ) : null}
                  <KeyList keys={KeyCombination.extractKeys(keyCombination)} />
                </div>
              ))}
            </div>
          ) : (
            <ShortcutDescription />
          )}
        </div>
      ) : null}
    </div>
  )
}
