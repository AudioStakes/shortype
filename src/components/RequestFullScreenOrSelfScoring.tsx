import Key from '@/components/Key'
import SelfScoring from '@/components/SelfScoring'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function RequestFullScreenOrSelfScoring() {
  const { state, needsFullscreenMode } = injectStrict(GameKey, 'GameKey')

  return !state.isShowCorrectKeyPressed && needsFullscreenMode ? (
    <div class="flex w-full max-w-full flex-col gap-3 px-2 text-center sm:px-6">
      <div class="flex flex-col gap-2">
        <span class="text-sm sm:text-base">正解判定できるようにするため、</span>
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Key keyName="f" class="w-11 h-11 sm:w-12 sm:h-12" />
          <span class="text-base sm:text-lg font-bold">で全画面モードを ON</span>
          <span class="text-sm sm:text-base">にしてください</span>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm sm:text-base">このまま続ける場合、</span>
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Key keyName="c" class="w-11 h-11 sm:w-12 sm:h-12" />
          <span class="text-base sm:text-lg font-bold">
            で正解を確認 &amp; 自己採点
          </span>
          <span class="text-sm sm:text-base">をお願いします</span>
        </div>
      </div>
    </div>
  ) : (
    <SelfScoring />
  )
}
