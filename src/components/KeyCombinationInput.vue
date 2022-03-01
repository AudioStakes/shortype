<script setup lang="ts">
import KeyCombination from '../../lib/keyCombination'
import KeyList from './KeyList.vue'

defineProps<{ keyCombination: KeyCombination, isShakingInput: boolean }>()

const defaultKeyCombinationValue = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key: ''
}
</script>

<template>
  <div class="flex-initial h-28 flex flex-col justify-center content-center">
    <KeyList
      v-if="keyCombination.key !== defaultKeyCombinationValue.key"
      :keyCombination="keyCombination"
      :class="isShakingInput ? 'animate-[shake_600ms]' : ''"
    ></KeyList>
    <span v-else>ショートカットキーを入力してください...</span>
  </div>
</template>
