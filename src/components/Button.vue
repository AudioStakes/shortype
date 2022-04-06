<script setup lang="ts">
defineProps<{ name: string; isDisabled?: boolean }>()
</script>

<template>
  <button
    class="flex items-center space-x-2 border rounded-full p-2 hover:bg-gray-200 text-gray-700 transition duration-200 hover:ease-out"
    :disabled="isDisabled"
    :class="{
      'cursor-not-allowed': isDisabled,
      'opacity-50': isDisabled,
    }"
  >
    <slot name="icon"></slot>
    <span>{{ name }}</span>
  </button>
</template>
