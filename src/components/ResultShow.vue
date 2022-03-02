<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { CheckCircleIcon, CheckIcon } from '@heroicons/vue/solid'
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
  (e: string): void // 引数の型指定を 'press-correct-key-combination' | 'press-wrong-key-combination' にすると $ vue-tsc --noEmit が通らなくなるため
}>()

const checkKeyCombination = () => {
  if (!props.pressedKeyCombination.key) return

  if (isEqual(props.pressedKeyCombination, props.correctKeyCombination)) {
    isCorrectKeyCombinationPressed.value = true
    emit('press-correct-key-combination')
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
  <div class="flex-initial h-28 flex flex-col justify-center content-center relative">
    <template v-if="isCorrectKeyCombinationPressed">
      <CheckCircleIcon
        v-if="!isWrongKeyCombinationPressed"
        class="h-16 w-16 text-green-500 self-center"
      />
      <CheckIcon
        v-else="isWrongKeyCombinationPressed"
        class="h-16 w-16 text-green-500 absolute -bottom-8 left-1/2 -translate-x-1/2"
      />
    </template>
    <KeyList v-if="isWrongKeyCombinationPressed" :keyCombination="correctKeyCombination"></KeyList>
  </div>
</template>
