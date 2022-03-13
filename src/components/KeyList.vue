<script setup lang="ts">
import Key from './Key.vue'

defineProps<{ keys: string[] }>()
</script>

<template>
  <div class="flex justify-center align-center">
    <Key v-for="(key, index) in keys" :keyName="key" :index="index"></Key>
  </div>
</template>
