<script setup lang="ts">
import keyNameToSymbolArray from '../constants/keyNameToSymbolArray'
import keyNameToDisplayNameArray from '../constants/keyNameToDisplayNameArray'
defineProps<{ keyName: string, index: number }>()
const keyNameToSymbolMap = new Map<string, string>(keyNameToSymbolArray)
const keyNameToDisplayNameMap = new Map<string, string>(keyNameToDisplayNameArray)
</script>

<template>
  <span v-if="index > 0" class="mx-7 my-auto">+</span>
  <kbd class="grid h-20 w-20 bg-white rounded-lg border-[1px] border-gray-300 shadow-3d">
    <ruby
      class="grid my-auto"
      :class="(keyNameToSymbolMap.get(keyName) || keyName.toUpperCase()).length > 3 ? 'px-2 text-base break-all' : 'text-3xl'"
    >
      <rt
        class="text-base leading-4"
        v-if="keyNameToDisplayNameMap.has(keyName)"
      >{{ keyNameToDisplayNameMap.get(keyName) }}</rt>
      {{ keyNameToSymbolMap.get(keyName) || keyNameToDisplayNameMap.get(keyName) || keyName.charAt(0).toUpperCase() + keyName.slice(1) }}
    </ruby>
  </kbd>
</template>
