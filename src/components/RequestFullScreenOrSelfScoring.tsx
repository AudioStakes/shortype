import Key from '@/components/Key'
import SelfScoring from '@/components/SelfScoring'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function RequestFullScreenOrSelfScoring() {
  const { state, needsFullscreenMode } = injectStrict(GameKey, 'GameKey')

  return !state.isShowCorrectKeyPressed && needsFullscreenMode ? (
    <div class="flex flex-col space-y-4">
      <div class="flex flex-col -space-y-1 px-10 text-left">
        <span class="text-base">正解判定できるようにするため、</span>
        <div class="flex space-x-2 items-center">
          <Key keyName="f" class="w-12 h-12 scale-[0.7]" />
          <span class="text-lg font-bold">で全画面モードを ON</span>
          <span class="text-base">にしてください</span>
        </div>
      </div>
      <div class="flex flex-col -space-y-1 px-10 text-left">
        <span class="text-base">このまま続ける場合、</span>
        <div class="flex space-x-2 items-center">
          <Key keyName="c" class="w-12 h-12 scale-[0.7]" />
          <span class="text-lg font-bold">で正解を確認 & 自己採点</span>
          <span class="text-base">をお願いします</span>
        </div>
      </div>
    </div>
  ) : (
    <SelfScoring />
  )
}
