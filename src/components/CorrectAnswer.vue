<script setup lang="ts">
import KeyList from '@/components/KeyList.vue'
import ShortcutDescription from '@/components/ShortcutDescription.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state, correctKeys } = injectStrict(GameKey)
</script>

<template>
  <div
    class="h-fit min-h-[9rem] flex flex-col justify-center content-center relative"
  >
    <div
      v-if="state.isWrongKeyPressed || state.isShowCorrectKeyPressed"
      class="scale-[0.8] w-fit px-12 py-4 self-center text-green-700 bg-green-100/50 rounded-lg"
      data-testid="correct-key-combination"
    >
      <span class="text-xl my-2">正解</span>
      <KeyList v-if="state.shortcut.isAvailable" :keys="correctKeys" />

      <ShortcutDescription
        v-else
        :shortcut-description="state.shortcut.shortcut"
      ></ShortcutDescription>
    </div>
  </div>
</template>
