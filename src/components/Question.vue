<script setup lang="ts">
defineProps<{ question: {
  app: String,
  category: String,
  action: String,
  shortcut: String
  }
}>()
</script>

<template>
  <div>
    <span>{{ question.app }}</span>
    <br>
    <span>{{ question.category }}</span>
    <h2>{{ question.action }}</h2>

    <!-- 動作確認用に回答を表示しておく -->
    <h3>回答: {{ question.shortcut }}</h3>
  </div>
</template>
