<script setup lang="ts">
import Key from '@/components/Key.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils/injectStrict'
import Keyboard from '@/utils/keyboard'

const {
  wordsOfDescriptionFilledByCorrectKeys,
  wordsOfDescriptionFilledByPressedKeys,
} = injectStrict(GameKey)

withDefaults(defineProps<{ isFillInBlankMode?: boolean }>(), {
  isFillInBlankMode: false,
})
</script>

<template>
  <div
    class="flex flex-wrap justify-center items-center align-center space-x-2"
  >
    <div
      v-for="(word, index) in isFillInBlankMode
        ? wordsOfDescriptionFilledByPressedKeys
        : wordsOfDescriptionFilledByCorrectKeys"
      :key="index"
    >
      <!-- 正規表現に含まれていないのに key と判定される（Keyboard.isKey が true を返す）文字をガード -->
      <span
        v-if="['+', '＋', '～', '）'].includes(word)"
        :key="word"
        class="text-base"
        >{{ word }}</span
      >
      <Key
        v-else-if="Keyboard.isKey(word) || word === ''"
        :key-name="word"
        class="scale-[0.8]"
      ></Key>
      <span v-else class="text-xl">{{ word }}</span>
    </div>
  </div>
</template>
