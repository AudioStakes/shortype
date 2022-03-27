<script setup lang="ts">
import Keyboard from '@/keyboard'
defineProps<{ keyName: string }>()
</script>

<template>
  <kbd
    class="grid h-20 w-20 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d"
    :data-testid="keyName"
  >
    <ruby
      class="grid my-auto text-3xl"
      :class="{
        'px-2 text-xl break-all':
          !Keyboard.hasSymbol(keyName) && keyName.length > 4,
      }"
    >
      <template v-if="Keyboard.hasSymbol(keyName)">
        <rt
          class="text-base leading-4"
          :class="{
            'text-sm': Keyboard.annotationOfSymbol(keyName).length > 8,
          }"
          >{{ Keyboard.annotationOfSymbol(keyName) }}</rt
        >
        {{ Keyboard.symbol(keyName) ?? keyName }}
      </template>
      <template v-else>{{
        keyName.charAt(0).toUpperCase() + keyName.slice(1)
      }}</template>
    </ruby>
  </kbd>
</template>
