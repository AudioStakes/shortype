<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ currentKeyboardEvent: KeyboardEvent }>()

const keyCombination = (e: KeyboardEvent) => {
  let keyCombination = []

  if (e.metaKey) keyCombination.push('Meta') // Mac の場合は command ⌘ キー
  if (e.altKey) keyCombination.push('Alt')
  if (e.shiftKey) keyCombination.push('Shift')
  if (e.ctrlKey) keyCombination.push('Control')
  if (!['Alt', 'Shift', 'Meta', 'Control'].includes(e.key)) keyCombination.push(e.key) // 修飾キー以外

  return keyCombination.map(key => replaceKeyNameToMac(key))
}

const keyCombinationOnKeyDown = (e: KeyboardEvent) => {
  let _keyCombination: string[] = keyCombination(e)

  for (let i = 0; i < _keyCombination.length; i++) {
    if (_keyCombination[i] === replaceKeyNameToMac(e.key)) {
      _keyCombination.splice(i, 1);
    }
  }

  return _keyCombination
}

const replaceKeyNameToMac = (keyName: String) => {
  return keyName.replace('Meta', '⌘').replace('Alt', 'Option')
}

const currentKeyCombination = computed(() => {
  if (props.currentKeyboardEvent.type === 'keydown') {
    return keyCombination(props.currentKeyboardEvent)
  } else if (props.currentKeyboardEvent.type === 'keyup') {
    return keyCombinationOnKeyDown(props.currentKeyboardEvent)
  } else {
    return []
  }
})
</script>

<template>
  <div style="font-size: 20px">
    <kbd v-if="currentKeyCombination.length" v-for="(key, index) in currentKeyCombination">
      <span v-if="index > 0"> + </span>
      <!-- ruby タグを使って「 ⌘ の上に command と表示」などをしたい https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby -->
      {{ key }}
    </kbd>
    <span v-else>ショートカットキーを入力してください...</span>
  </div>
</template>
