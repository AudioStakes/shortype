<script setup lang="ts">
defineProps<{ isShow?: boolean; isEnterFromRight?: boolean }>()
</script>

<template>
  <transition
    enter-active-class="duration-200 ease-in"
    :enter-from-class="`transform opacity-0 ${
      isEnterFromRight ? '-translate-x-6' : 'translate-x-6'
    }`"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-out"
    leave-from-class="opacity-0 absolute"
    leave-to-class="opacity-0 absolute"
  >
    <slot v-if="isShow"></slot>
  </transition>
</template>
