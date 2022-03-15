<script setup lang="ts">
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state, shortcut } = injectStrict(GameKey)
</script>

<template>
  <div class="flex-initial h-32 flex flex-col">
    <span>{{ shortcut.app }} | {{ shortcut.category }}</span>
    <h2
      class="w-4/5 break-words text-3xl md:text-4xl font-bold m-auto"
      :class="state.isRemoveKeyPressed ? 'animate-[fadeOut_1000ms]' : ''"
    >
      {{ shortcut.action }}
    </h2>
  </div>
</template>
