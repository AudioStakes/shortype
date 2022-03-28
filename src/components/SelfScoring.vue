<script setup lang="ts">
import Key from '@/components/Key.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div v-if="!state.isShowCorrectKeyPressed">
    <span class="text-base">正解判定に未対応のため、</span>
    <div class="flex space-x-4 justify-center items-center py-3">
      <Key :key-name="'c'" class="w-14 h-14"></Key>
      <span class="text-xl font-bold">で正解を確認 & 自己採点</span>
    </div>
    <span class="text-base">をお願いします</span>
  </div>
  <div v-else>
    <div class="flex space-x-8 justify-center items-center">
      <div class="w-32 flex flex-col space-y-2 justify-center items-center">
        <span class="text-xl">正解した</span>
        <Key :key-name="'y'" class="w-14 h-14"></Key>
      </div>
      <div class="w-32 flex flex-col space-y-2 justify-center items-center">
        <span class="text-xl">不正解だった</span>
        <Key :key-name="'n'" class="w-14 h-14"></Key>
      </div>
    </div>
  </div>
</template>
