<script setup lang="ts">
import GameKey from '../stores/gameKey'
import KeyList from './KeyList.vue'
import { injectStrict } from '../utils'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div
    class="flex-initial h-28 flex flex-col justify-center content-center"
    data-testid="pressed-key-combination"
  >
    <KeyList
      v-if="state.pressedKeyCombination.hasPressedSomeKey()"
      :keys="state.pressedKeyCombination.keys()"
      :class="state.isShakingKeyCombinationView ? 'animate-[shake_600ms]' : ''"
    />
    <span v-else>ショートカットキーを入力してください...</span>
  </div>
</template>
