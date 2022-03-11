<script setup lang="ts">
import { provide } from 'vue'

import {
  NavigatorExtend,
  NavigatorKeyboard,
  Shortcut,
} from '../types/interfaces'

import gameStore from '../stores/game'
import GameKey from '../stores/gameKey'

import QuestionShow from '../components/QuestionShow.vue'
import ResultShow from '../components/ResultShow.vue'
import PressedKeyCombination from '../components/PressedKeyCombination.vue'

import useKeyboardEventListener from '../composables/useKeyboardEventListener'

import Keyboard from '../keyboard'

const props = defineProps<{ shortcuts: Shortcut[] }>()

const game = gameStore(props.shortcuts)
provide(GameKey, game)
const { keyDown, keyUp, isEnded, restart } = game

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
  <div v-if="!isEnded">
    <QuestionShow />
    <ResultShow />
    <PressedKeyCombination />
    <span class="flex-initial h-16 flex flex-col justify-center"
      >Enter でスキップ</span
    >
    <div class="flex-initial h-72" />
  </div>
  <div v-else>
    <button
      class="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit mx-auto"
      @click="restart()"
    >
      もう1回
    </button>
  </div>
</template>
