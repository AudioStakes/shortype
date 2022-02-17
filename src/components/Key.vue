<script setup lang="ts">
import keyNameToSymbolArray from '../constants/keyNameToSymbolArray'
defineProps<{ keyName: string, index: number }>()
const keyNameToSymbolMap = new Map<string, string>(keyNameToSymbolArray)
</script>

<template>
  <!-- span よりも kbd タグが適していそう https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd -->
  <span v-if="index > 0">+</span>
  <!-- ruby タグを使って「 ⌘ の上に command と表示」などをしたい https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby -->
  <span>{{ keyNameToSymbolMap.get(keyName) || keyName }}</span>
</template>

<style>
</style>
