<script setup lang="ts">
import GameKey from '../stores/gameKey'
import { CheckCircleIcon, CheckIcon } from '@heroicons/vue/solid'
import KeyList from '../components/KeyList.vue'
import { injectStrict } from '../utils'

const { state, correctKeys } = injectStrict(GameKey)
</script>

<template>
  <div class="flex-initial h-28 flex flex-col justify-center content-center relative">
    <template v-if="state.isCorrectKeyPressed">
      <template v-if="!state.isWrongKeyPressed">
        <div
          class="h-16 w-16 text-green-500 self-center"
          data-testid="check-circle-icon"
        >
          <CheckCircleIcon />
        </div>
      </template>
      <template v-else>
        <div
          class="h-16 w-16 text-green-500 absolute -bottom-8 left-1/2 -translate-x-1/2"
          data-testid="check-icon"
        >
          <CheckIcon />
        </div>
      </template>
    </template>
    <KeyList
      v-if="state.isWrongKeyPressed"
      :keys="correctKeys"
      data-testid="correct-key-combination"
    />
  </div>
</template>
