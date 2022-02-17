<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import KeyCombination from '../../lib/keyCombination'
import KeyList from '../components/KeyList.vue'

const props = defineProps<{ pressedKeyCombination: KeyCombination, correctKeyCombination: KeyCombination }>()
const { pressedKeyCombination, correctKeyCombination } = toRefs(props)

const isCorrectKeyCombinationPressed = ref(false)
const isWrongKeyCombinationPressed = ref(false)

const modifiers = ['Alt', 'Shift', 'Meta', 'Control']
const isOnlyModifierKey = (keyCombination: KeyCombination) => modifiers.includes(keyCombination.key)
const isEqual = (a: KeyCombination, b: KeyCombination) => (Object.keys(a) as (keyof KeyCombination)[]).every(key => a[key] === b[key])

const emit = defineEmits<{
  (e: 'press-wrong-key-combination'): void
}>()

const checkKeyCombination = () => {
  if (!props.pressedKeyCombination.key) return

  if (isEqual(props.pressedKeyCombination, props.correctKeyCombination)) {
    isCorrectKeyCombinationPressed.value = true
  } else if (!isWrongKeyCombinationPressed.value && !isOnlyModifierKey(props.pressedKeyCombination)) {
    isWrongKeyCombinationPressed.value = true
    emit('press-wrong-key-combination')
  }
}

const resetState = () => {
  isCorrectKeyCombinationPressed.value = false
  isWrongKeyCombinationPressed.value = false
}
defineExpose({ resetState });

watch(pressedKeyCombination, checkKeyCombination)
</script>

<template>
  <div style="height: 30px">
    <span v-if="isCorrectKeyCombinationPressed">正解!</span>
  </div>
</template>
