<script setup lang="ts">
import Key from '@/components/Key.vue'
import SelfScoring from '@/components/SelfScoring.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state, needsFullscreenMode } = injectStrict(GameKey)
</script>

<template>
  <div
    v-if="!state.isShowCorrectKeyPressed && needsFullscreenMode"
    class="flex flex-col space-y-4"
  >
    <div class="flex flex-col -space-y-1 px-10 text-left">
      <span class="text-base">正解判定できるようにするため、</span>
      <div class="flex space-x-2 items-center">
        <Key :key-name="'f'" class="w-12 h-12 scale-[0.7]"></Key>
        <span class="text-lg font-bold">で全画面モードを ON</span>
        <span class="text-base">にしてください</span>
      </div>
    </div>
    <div class="flex flex-col -space-y-1 px-10 text-left">
      <span class="text-base">このまま続ける場合、</span>
      <div class="flex space-x-2 items-center">
        <Key :key-name="'c'" class="w-12 h-12 scale-[0.7]"></Key>
        <span class="text-lg font-bold">で正解を確認 & 自己採点</span>
        <span class="text-base">をお願いします</span>
      </div>
    </div>
  </div>
  <SelfScoring v-else />
</template>
