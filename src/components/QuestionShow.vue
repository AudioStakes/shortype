<script setup lang="ts">
import { XCircleIcon } from '@heroicons/vue/outline'

import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div class="min-h-[4rem] h-fit flex flex-col space-y-2">
    <span>{{ state.shortcut.app }} | {{ state.shortcut.category }}</span>
    <h2
      class="w-4/5 text-3xl break-words font-bold mx-auto"
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
