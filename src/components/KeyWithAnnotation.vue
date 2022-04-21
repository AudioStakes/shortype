<script setup lang="ts">
import { computed } from '@vue/reactivity'

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
    class="grid h-20 w-20 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d text-center text-3xl"
    :data-testid="keyName"
    :class="{
      'w-[6rem]': maxLength > 9,
      'w-[6.5rem]': lineLength > 2,
      'h-[6rem]': lineLength > 2,
    }"
  >
    <ruby class="grid my-auto">
      <rt
        class="text-base leading-4 whitespace-pre-line my-auto"
        :class="{
          'text-[0.85rem]': 8 < maxLength,
        }"
        >{{ formattedAnnotation }}</rt
      >
      <span v-if="Keyboard.hasSymbol(props.keyName)">{{
        Keyboard.symbol(keyName) ?? keyName
      }}</span>
      <KeyIcons v-else class="mx-auto" :icon-name="annotation"></KeyIcons>
    </ruby>
  </kbd>
</template>
