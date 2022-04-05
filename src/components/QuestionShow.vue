<script setup lang="ts">
import { XCircleIcon } from '@heroicons/vue/outline'

import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div class="min-h-[4rem] h-fit flex flex-col space-y-2">
    <div class="flex flex-col text-base">
      <span>{{ state.shortcut.app }}</span>
      <div>
        <span class="mr-1">{{ state.shortcut.category }}</span>
        <span>からの出題</span>
      </div>
    </div>
    <h2
      class="w-3/5 max-w-[54rem] min-w-[36rem] text-3xl break-words font-bold mx-auto"
      :class="{ 'animate-[fadeOut_1000ms]': state.isRemoveKeyPressed }"
    >
      {{ state.shortcut.action }}
    </h2>
    <div
      v-if="state.isRemoveKeyPressed"
      class="h-16 w-16 text-gray-500 absolute self-center translate-y-3"
      data-testid="wrong-key-pressed"
    >
      <XCircleIcon />
    </div>
  </div>
</template>
