<script setup lang="ts">
import { computed } from 'vue'

import formatKeyName from '@/utils/format-key-name'
import Keyboard from '@/utils/keyboard'

import KeyIcons from './KeyIcons.vue'

const props = defineProps<{ keyName: string }>()
const annotation = computed(
  () =>
    (Keyboard.annotationOfIcon(props.keyName) ||
      Keyboard.annotationOfSymbol(props.keyName)) ??
    props.keyName
)

const formattedAnnotation = computed(() => formatKeyName(annotation.value))
const maxLength = computed(() =>
  Math.max(...formattedAnnotation.value.split('\n').map((word) => word.length))
)
const lineLength = computed(() => formattedAnnotation.value.split('\n').length)
</script>

<template>
  <kbd
    class="flex h-20 w-20 flex-col items-center justify-center gap-1 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d text-center text-3xl leading-none"
    :data-testid="keyName"
    :class="{
      'w-[6rem]': maxLength > 9,
      'w-[6.5rem]': lineLength > 2,
      'h-[6rem]': lineLength > 2,
    }"
  >
    <span
      class="text-base leading-none whitespace-pre-line"
      :class="{
        'text-[0.85rem]': 8 < maxLength,
      }"
    >
      {{ formattedAnnotation }}
    </span>
    <span v-if="Keyboard.hasSymbol(props.keyName)">{{
      Keyboard.symbol(keyName) ?? keyName
    }}</span>
    <KeyIcons v-else class="mx-auto" :icon-name="annotation"></KeyIcons>
  </kbd>
</template>
