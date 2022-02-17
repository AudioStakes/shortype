<script setup lang="ts">
import Question from '../../lib/question'

defineProps<{ question: Question }>()
</script>

<template>
  <div>
    <span>{{ question.app }}</span>
    <br>
    <span>{{ question.category }}</span>
    <h2>{{ question.action }}</h2>
  </div>
</template>
