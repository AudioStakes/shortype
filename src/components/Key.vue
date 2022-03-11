<script setup lang="ts">
import Keyboard from '../keyboard'
defineProps<{ keyName: string }>()
</script>

<template>
  <kbd
    class="grid h-20 w-20 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d"
    :data-testid="keyName"
  >
    <ruby
      class="grid my-auto"
      :class="(Keyboard.symbol(keyName) ?? keyName.toUpperCase()).length > 3 ? 'px-2 text-base break-all' : 'text-3xl'"
    >
      <template v-if="Keyboard.toDisplayName(keyName)">
        <rt class="text-base leading-4">{{ Keyboard.toDisplayName(keyName) }}</rt>
        {{ Keyboard.symbol(keyName) }}
      </template>
      <template v-else>{{ keyName.charAt(0).toUpperCase() + keyName.slice(1) }}</template>
    </ruby>
  </kbd>
</template>
