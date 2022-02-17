<script setup lang="ts">
import KeyCombination from '../../lib/keyCombination'
import KeyList from './KeyList.vue'

defineProps<{ keyCombination: KeyCombination }>()

const defaultKeyCombinationValue = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key: ''
}
</script>

<template>
  <div style="height: 30px">
    <KeyList v-if="keyCombination !== defaultKeyCombinationValue" :keyCombination="keyCombination"></KeyList>
    <span v-else style="font-size: 14px">ショートカットキーを入力してください...</span>
  </div>
</template>
