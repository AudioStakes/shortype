<script setup lang="ts">
import { KeyCombination } from '../../lib/interfaces'
import Key from './Key.vue'

defineProps<{ keyCombination: KeyCombination }>()

const extractKeys = (keyCombination: KeyCombination) => {
  let keys = []

  if (keyCombination.metaKey) keys.push('Meta') // Mac の場合は command ⌘ キー
  if (keyCombination.altKey) keys.push('Alt')
  if (keyCombination.shiftKey) keys.push('Shift')
  if (keyCombination.ctrlKey) keys.push('Control')
  if (!['Alt', 'Shift', 'Meta', 'Control', '', undefined].includes(keyCombination.key)) keys.push(keyCombination.key) // 修飾キー以外

  return keys
}
</script>

<template>
  <div class="flex justify-center align-center">
    <Key v-for="(key, index) in extractKeys(keyCombination)" :keyName="key" :index="index"></Key>
  </div>
</template>
