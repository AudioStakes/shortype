<script setup lang="ts">
import KeyWithAnnotation from '@/components/KeyWithAnnotation.vue'
import formatKeyName from '@/utils/formatKeyName'
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
    class="grid h-20 w-20 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d text-center text-3xl"
    :data-testid="keyName"
    :class="{
      'text-2xl': 4 < keyName.length && keyName.length <= 6,
      'text-lg': 6 < keyName.length && keyName.length <= 8,
      'text-sm': 8 < keyName.length,
    }"
  >
    <div class="my-auto">
      {{ formatKeyName(keyName) }}
    </div>
  </kbd>
</template>
