<script setup lang="ts">
import { CheckCircleIcon, CheckIcon } from '@heroicons/vue/solid'

import KeyList from '@/components/KeyList.vue'
import SelfScoring from '@/components/SelfScoring.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state } = injectStrict(GameKey)
</script>

<template>
  <div
    class="flex-initial h-44 w-fit min-w-[30rem] mx-auto p-4 flex flex-col justify-center content-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
    data-testid="pressed-key-combination"
  >
    <div class="h-16 w-16 absolute self-center -translate-y-14 text-green-500">
      <div
        v-if="state.isCorrectKeyPressed && !state.isWrongKeyPressed"
        data-testid="correct-key-pressed"
      >
        <CheckCircleIcon />
      </div>
      <div
        v-else-if="state.isCorrectKeyPressed && state.isWrongKeyPressed"
        data-testid="wrong-key-pressed"
      >
        <CheckIcon />
      </div>
      <div
        v-else-if="state.isMarkedSelfAsCorrect"
        class="-translate-x-20"
        data-testid="marked-self-as-correct"
      >
        <CheckCircleIcon />
      </div>
      <div
        v-else-if="state.isMarkedSelfAsWrong"
        class="translate-x-20 text-gray-500"
        data-testid="marked-self-as-wrong"
      >
        <CheckIcon />
      </div>
    </div>
    <SelfScoring v-if="!state.shortcut.isAvailable"></SelfScoring>
    <KeyList
      v-else-if="state.pressedKeyCombination.hasPressedSomeKey()"
      :keys="state.pressedKeyCombination.keys()"
      :class="state.isShakingKeyCombinationView ? 'animate-[shake_600ms]' : ''"
    />
    <span v-else>ショートカットキーを入力してください...</span>
  </div>
</template>
