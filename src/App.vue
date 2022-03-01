<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import QuestionShow from './components/QuestionShow.vue'
import ResultShow from './components/ResultShow.vue'
import KeyCombinationInput from './components/KeyCombinationInput.vue'

import chromeShortcutsJson from './assets/chrome.json'
import specialCodeToKeyArray from './constants/specialCodeToKeyArray'

import Shortcut from '../lib/shortcut'
import Question from '../lib/question'
import NavigatorExtend from '../lib/navigatorExtend'
import KeyboardLayoutMap from '../lib/keyboardLayoutMap'
import KeyCombination from '../lib/keyCombination'

const isListeningKeyboardEvent = ref(true)
const isAnsweredAllQuestions = ref(false)

const shortcuts = chromeShortcutsJson
const shortcut = computed<Shortcut>(() => shortcuts[shortcutIndex.value])
const shortcutIndex = ref(0)

const extractQuestion = (shortcut: Shortcut): Question => {
  return {
    app: shortcut.app,
    category: shortcut.category,
    action: shortcut.action
  }
}
const question = computed<Question>(() => extractQuestion(shortcut.value))

let keyboardMap: KeyboardLayoutMap
(async () => {
  const keyboard = (navigator as NavigatorExtend).keyboard
  keyboardMap = await keyboard.getLayoutMap()
})()
const specialCodeToKeyMap = new Map<string, string>(specialCodeToKeyArray)
const convertToKey = (code: string) => specialCodeToKeyMap.get(code) || keyboardMap.get(code)

const keyboardEvent = ref<KeyboardEvent>(new KeyboardEvent(''))

const extractKeyCombination = (eventOrShortcut: KeyboardEvent | Shortcut) => {
  return {
    altKey: eventOrShortcut.altKey,
    ctrlKey: eventOrShortcut.ctrlKey,
    metaKey: eventOrShortcut.metaKey,
    shiftKey: eventOrShortcut.shiftKey,
    key: eventOrShortcut instanceof KeyboardEvent ? convertToKey(eventOrShortcut.code) : eventOrShortcut.key as string
  }
}

const defaultKeyCombinationValue = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key: ''
}
const pressedKeyCombination = ref<KeyCombination>(defaultKeyCombinationValue)

const isOnlyEnterKey = (keyCombination: KeyCombination) => !keyCombination.altKey && !keyCombination.ctrlKey && !keyCombination.metaKey && !keyCombination.shiftKey && keyCombination.key === 'Enter'

const onKeyDown = (e: KeyboardEvent) => {
  if (e.repeat || !isListeningKeyboardEvent.value) return

  e.preventDefault()
  e.stopPropagation()

  const _pressedKeyCombination = extractKeyCombination(e)

  if (isOnlyEnterKey(_pressedKeyCombination)) {
    nextQuestionIndex()
    return
  }

  pressedKeyCombination.value = _pressedKeyCombination
}

const onKeyUp = (e: KeyboardEvent) => {
  if (!isListeningKeyboardEvent.value) return

  e.preventDefault()
  e.stopPropagation()

  const releasedKey = convertToKey(e.code)

  if (releasedKey === 'Meta') pressedKeyCombination.value.metaKey = false
  if (releasedKey === 'Alt') pressedKeyCombination.value.altKey = false
  if (releasedKey === 'Shift') pressedKeyCombination.value.shiftKey = false
  if (releasedKey === 'Control') pressedKeyCombination.value.ctrlKey = false
  if (releasedKey === pressedKeyCombination.value.key) pressedKeyCombination.value.key = ''
}

const nextQuestionIndex = () => {
  const shortcut = shortcuts.slice(shortcutIndex.value + 1).find(shortcut => shortcut.isAvailable)

  if (!shortcut) {
    isAnsweredAllQuestions.value = true
  } else {
    shortcutIndex.value = shortcuts.indexOf(shortcut)
    startNewQuestion()
  }
}

const resultShow = ref()
const startNewQuestion = () => {
  if (!shortcut.value.isAvailable) nextQuestionIndex()
  pressedKeyCombination.value = defaultKeyCombinationValue
  resultShow.value.resetState()
}

const restart = () => {
  shortcutIndex.value = 0
  isAnsweredAllQuestions.value = false
  startNewQuestion()
}

const waitNextQuestion = () => {
  isListeningKeyboardEvent.value = false
  setTimeout(() => {
    isListeningKeyboardEvent.value = true
    nextQuestionIndex()
  }, 1000)
}

const waitUntilKeyCombinationIsReset = () => {
  isListeningKeyboardEvent.value = false
  setTimeout(() => {
    isListeningKeyboardEvent.value = true
    pressedKeyCombination.value = defaultKeyCombinationValue
  }, 1000)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.onkeydown = () => false // https://stackoverflow.com/shortcuts/37073277/how-to-disable-keyboard-shortcuts-completely-from-javascript
  startNewQuestion()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.onkeydown = null
})
</script>

<template>
  <Header />
  <main>
    <button v-if="isAnsweredAllQuestions" @click="restart">もう1回</button>
    <div v-else>
      <QuestionShow :question="question" />
      <br />
      <ResultShow
        :pressedKeyCombination="pressedKeyCombination"
        :correctKeyCombination="extractKeyCombination(shortcut)"
        @press-correct-key-combination="waitNextQuestion"
        @press-wrong-key-combination="waitUntilKeyCombinationIsReset"
        ref="resultShow"
      />
      <br />
      <KeyCombinationInput :keyCombination="pressedKeyCombination" />
      <br />
      <span style="font-size: 14px;" @click="nextQuestionIndex">Enter でスキップ</span>
    </div>
  </main>
    <Footer />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
