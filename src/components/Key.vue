<script setup lang="ts">
import KeyWithAnnotation from '@/components/KeyWithAnnotation.vue'
import formatKeyName from '@/utils/format-key-name'
import Keyboard from '@/utils/keyboard'

defineProps<{ keyName: string }>()
</script>

<template>
  <KeyWithAnnotation
    v-if="Keyboard.hasSymbol(keyName) || Keyboard.hasIcon(keyName)"
    :key-name="keyName"
  >
  </KeyWithAnnotation>
  <kbd
    v-else
    class="flex h-20 w-20 flex-col items-center justify-center bg-white rounded-lg border-[1px] border-gray-300 shadow-3d text-center text-3xl leading-none"
    :data-testid="keyName"
    :class="{
      'text-2xl': 4 < keyName.length && keyName.length <= 6,
      'text-lg': 6 < keyName.length && keyName.length <= 8,
      'text-sm': 8 < keyName.length,
    }"
  >
    {{ formatKeyName(keyName) }}
  </kbd>
</template>
