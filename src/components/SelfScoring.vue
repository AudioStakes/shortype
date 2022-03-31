<script setup lang="ts">
import Key from '@/components/Key.vue'
</script>

<template>
  <div class="flex space-x-8 justify-center items-center">
    <div class="w-32 flex flex-col space-y-2 justify-center items-center">
      <span class="text-xl">正解した</span>
      <Key :key-name="'y'" class="w-14 h-14"></Key>
    </div>
    <div class="w-32 flex flex-col space-y-2 justify-center items-center">
      <span class="text-xl">不正解だった</span>
      <Key :key-name="'n'" class="w-14 h-14"></Key>
    </div>
  </div>
</template>
