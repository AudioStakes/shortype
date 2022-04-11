<script setup lang="ts">
import { RefreshIcon } from '@heroicons/vue/outline'

import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const { removedShortcutExists, restoreRemovedShortcuts } = injectStrict(GameKey)
</script>

<template>
  <button
    v-if="removedShortcutExists"
    class="mx-auto flex text-sm bg-gray-200 hover:bg-gray-300 py-0.2 px-1.5 rounded my-3 transition duration-200 hover:ease-out"
    @click="restoreRemovedShortcuts"
  >
    <RefreshIcon class="my-auto h-6 px-1 py-1" />
    <span class="my-auto">出題しないリストを空にする</span>
  </button>
</template>
