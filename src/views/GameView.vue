<script setup lang="ts">
import { provide } from 'vue'

import CorrectAnswer from '@/components/CorrectAnswer.vue'
import PieChart from '@/components/PieChart.vue'
import PressedKeyCombination from '@/components/PressedKeyCombination.vue'
import QuestionShow from '@/components/QuestionShow.vue'
import RestoreButton from '@/components/RestoreButton.vue'
import ShortcutsShow from '@/components/ShortcutsShow.vue'
import ToolsAndCategoriesModal from '@/components/ToolsAndCategoriesModal.vue'
import useEventListener from '@/composables/use-event-listener'
import useKeyboardEventListener from '@/composables/use-keyboard-event-listener'
import gameStore from '@/stores/game'
import GameKey from '@/stores/game-key'
import {
  NavigatorExtend,
  NavigatorKeyboard,
  Shortcut,
} from '@/types/interfaces'
import Keyboard from '@/utils/keyboard'
import lockKeyboard from '@/utils/lock-keyboard'

const props = withDefaults(
  defineProps<{
    shortcuts?: Shortcut[] | undefined
    isShowToolModal?: boolean
  }>(),
  {
    shortcuts: undefined,
    isShowToolModal: false,
  }
)
const emit = defineEmits(['hide-modal'])

const game = gameStore(props.shortcuts)
provide(GameKey, game)
const { keyDown, keyUp, isRemovedAll, onFullscreenchange } = game

const keyboard = new Keyboard()
if ('keyboard' in navigator) {
  keyboard.setKeyboardLayoutMap(
    (navigator as NavigatorExtend).keyboard as NavigatorKeyboard
  )
  lockKeyboard()
}

const handleKeyDown = (e: KeyboardEvent) => {
  const { altKey, metaKey, shiftKey, ctrlKey } = e
  const key = keyboard.key(e) as string

  keyDown({ altKey, metaKey, shiftKey, ctrlKey, key })
}

const handleKeyUp = (e: KeyboardEvent) => {
  const key = keyboard.key(e) as string

  keyUp(key)
}

useEventListener('fullscreenchange', onFullscreenchange)
useKeyboardEventListener('keydown', handleKeyDown)
useKeyboardEventListener('keyup', handleKeyUp)
</script>

<template>
  <div v-if="!isRemovedAll" class="flex-1 flex flex-col">
    <PieChart />
    <QuestionShow />
    <CorrectAnswer />
    <PressedKeyCombination />
    <div class="my-auto">
      <ShortcutsShow />
      <RestoreButton />
    </div>
    <ToolsAndCategoriesModal
      :is-show="isShowToolModal"
      @hide-modal="emit('hide-modal')"
    />
  </div>
  <div v-else>
    <span>出題できるショートカットキーがありません。</span>
    <RestoreButton
      class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4"
    />
  </div>
</template>
