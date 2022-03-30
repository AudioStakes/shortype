<script setup lang="ts">
import Key from '@/components/Key.vue'
import Keyboard from '@/keyboard'

const props = defineProps<{ shortcutDescription: string }>()
const words = Keyboard.splitByKey(props.shortcutDescription)
</script>

<template>
  <div class="flex justify-center items-center align-center space-x-2">
    <div v-for="(word, index) in words" :key="index">
      <!-- 正規表現に含まれていないのに key と判定される（Keyboard.isKey が true を返す）文字をガード -->
      <span
        v-if="['+', '＋', '～', '）'].includes(word)"
        :key="word"
        class="text-base"
        >{{ word }}</span
      >
      <Key
        v-else-if="Keyboard.isKey(word)"
        :key-name="word"
        class="scale-[0.8]"
      ></Key>
      <span v-else class="text-xl">{{ word }}</span>
    </div>
  </div>
</template>
