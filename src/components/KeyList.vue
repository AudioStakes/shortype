<script setup lang="ts">
import Key from '@/components/Key.vue'

defineProps<{ keys: string[] }>()
</script>

<template>
  <div class="flex justify-center align-center">
    <div v-for="(keyName, index) in keys" :key="index" class="flex">
      <span v-if="index > 0" class="mx-4 my-auto">+</span>
      <Key :key-name="keyName" />
    </div>
  </div>
</template>
