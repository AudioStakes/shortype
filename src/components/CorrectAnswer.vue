<script setup lang="ts">
import KeyList from '@/components/KeyList.vue'
import ShortcutDescription from '@/components/ShortcutDescription.vue'
import { FUNCTION_KEY_DESCRIPTION_REGEXP } from '@/constants/key-description-regexp'
import KeyCombination from '@/models/key-combination'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const { state } = injectStrict(GameKey)
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
      <div
        v-if="
          state.shortcut.isAvailable &&
          !state.shortcut.needsFillInBlankMode &&
          !FUNCTION_KEY_DESCRIPTION_REGEXP.test(state.shortcut.keysDescription)
        "
        class="flex"
      >
        <div
          v-for="(keyCombination, index) in state.shortcut.keyCombinations"
          :key="index"
          class="flex"
        >
          <span v-if="index > 0" class="mx-8 my-auto text-xl">もしくは</span>
          <KeyList :keys="KeyCombination.extractKeys(keyCombination)" />
        </div>
      </div>

      <ShortcutDescription
        v-else
        :shortcut-description="state.shortcut.keysDescription"
      ></ShortcutDescription>
    </div>
  </div>
</template>
