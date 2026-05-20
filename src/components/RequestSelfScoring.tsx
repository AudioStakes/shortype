import Key from '@/components/Key'
import SelfScoring from '@/components/SelfScoring'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

export default function RequestSelfScoring() {
  const { state } = injectStrict(GameKey, 'GameKey')

  return !state.isShowCorrectKeyPressed ? (
    <div>
      <div class="flex flex-col px-3">
        <span class="text-base">正解判定に未対応のため、</span>
        <div class="flex space-x-4 justify-center items-center py-3">
          <Key keyName="c" class="w-14 h-14" />
          <span class="text-xl font-bold">で正解を確認 & 自己採点</span>
          <span class="text-base">をお願いします</span>
        </div>
      </div>
    </div>
  ) : (
    <SelfScoring />
  )
}
