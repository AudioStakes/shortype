<script setup lang="ts">
import { provide } from 'vue'

import CorrectAnswer from '@/components/CorrectAnswer.vue'
import PieChart from '@/components/PieChart.vue'
import PressedKeyCombination from '@/components/PressedKeyCombination.vue'
import QuestionShow from '@/components/QuestionShow.vue'
import RestoreButton from '@/components/RestoreButton.vue'
import ShortcutsShow from '@/components/ShortcutsShow.vue'
import ToolList from '@/components/ToolList.vue'
import useKeyboardEventListener from '@/composables/useKeyboardEventListener'
import Keyboard from '@/keyboard'
import gameStore from '@/stores/game'
import GameKey from '@/stores/gameKey'
import {
  NavigatorExtend,
  NavigatorKeyboard,
  Shortcut,
} from '@/types/interfaces'

const props = withDefaults(
  defineProps<{ shortcuts: Shortcut[]; isShowToolModal?: boolean }>(),
  {
    isShowToolModal: false,
  }
)
const emit = defineEmits(['hide-tool-modal'])

const game = gameStore(props.shortcuts)
provide(GameKey, game)
const { keyDown, keyUp, isAllRemoved, restart } = game

const keyboard = new Keyboard()
if ('keyboard' in navigator)
  keyboard.setKeyboardLayoutMap(
    (navigator as NavigatorExtend).keyboard as NavigatorKeyboard
  )

const handleKeyDown = (e: KeyboardEvent) => {
  const { altKey, metaKey, shiftKey, ctrlKey } = e
  const key = keyboard.key(e) as string

  keyDown({ altKey, metaKey, shiftKey, ctrlKey, key })
}

const handleKeyUp = (e: KeyboardEvent) => {
  const key = keyboard.key(e) as string

  keyUp(key)
}

useKeyboardEventListener('keydown', handleKeyDown)
useKeyboardEventListener('keyup', handleKeyUp)
</script>

<template>
  <div v-if="!isAllRemoved" class="flex-1 flex flex-col">
    <PieChart />
    <QuestionShow />
    <CorrectAnswer />
    <PressedKeyCombination />
    <div class="my-auto">
      <ShortcutsShow />
      <RestoreButton />
    </div>
    <ToolList
      :is-show="isShowToolModal"
      @hide-tool-modal="emit('hide-tool-modal')"
    />
  </div>
  <div v-else>
    <button
      class="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit mx-auto"
      @click="restart()"
    >
      出題しないリストを空にする
    </button>
  </div>
</template>
