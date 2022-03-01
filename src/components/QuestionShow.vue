<script setup lang="ts">
import Question from '../../lib/question'

defineProps<{ question: Question }>()
</script>

<template>
  <div class="flex-initial h-32 flex flex-col">
    <span>{{ question.app }} | {{ question.category }}</span>
    <h2 class="w-4/5 break-words text-3xl md:text-4xl font-bold m-auto">{{ question.action }}</h2>
  </div>
</template>
