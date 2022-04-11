<script setup lang="ts">
import Key from '@/components/Key.vue'
import SelfScoring from '@/components/SelfScoring.vue'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div v-if="!state.isShowCorrectKeyPressed">
    <div class="flex flex-col px-3">
      <span class="text-base">正解判定に未対応のため、</span>
      <div class="flex space-x-4 justify-center items-center py-3">
        <Key :key-name="'c'" class="w-14 h-14"></Key>
        <span class="text-xl font-bold">で正解を確認 & 自己採点</span>
        <span class="text-base">をお願いします</span>
      </div>
    </div>
  </div>
  <SelfScoring v-else />
</template>
