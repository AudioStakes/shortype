import IconGlyph from '@/components/IconGlyph'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function QuestionShow() {
  const { state } = injectStrict(GameKey, 'GameKey')

  return (
    <div class="min-h-[4rem] h-fit flex flex-col space-y-2">
      <div class="flex flex-col text-base">
        <span>{state.shortcut.app}</span>
        <div>
          <span class="mr-1">{state.shortcut.category}</span>
          <span>からの出題</span>
        </div>
      </div>
      <h2
        class={`w-3/5 max-w-[54rem] min-w-[36rem] text-3xl break-words font-bold mx-auto ${
          state.isRemoveKeyPressed ? 'animate-[fadeOut_1000ms]' : ''
        }`}
      >
        {state.shortcut.action}
      </h2>
      {state.isRemoveKeyPressed ? (
        <div
          class="h-16 w-16 text-gray-500 absolute self-center translate-y-3"
          data-testid="wrong-key-pressed"
        >
          <IconGlyph name="x-circle" />
        </div>
      ) : null}
    </div>
  )
}
