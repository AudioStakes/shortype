import Key from '@/components/Key'
import SelfScoring from '@/components/SelfScoring'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function RequestSelfScoring() {
  const { state } = injectStrict(GameKey, 'GameKey')

  return !state.isShowCorrectKeyPressed ? (
    <div>
      <div class="flex flex-col gap-2 px-2 text-center">
        <span class="text-sm sm:text-base">正解判定に未対応のため、</span>
        <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 py-2">
          <Key keyName="c" class="w-12 h-12 sm:w-14 sm:h-14" />
          <span class="text-base sm:text-xl font-bold">
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
