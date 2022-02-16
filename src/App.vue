<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CurrentKeyCombination from './components/CurrentKeyCombination.vue'

const currentKeyboardEvent = ref(new KeyboardEvent(''))

const onKeyDown = (e: KeyboardEvent) => {
  if (e.repeat) return

  console.log('onKeyDown', e.type, e)
  e.preventDefault()
  e.stopPropagation()

  currentKeyboardEvent.value = e
}

const onKeyUp = (e: KeyboardEvent) => {
  console.log('onKeyUp', e.type, e)
  e.preventDefault()
  e.stopPropagation()

  currentKeyboardEvent.value = e
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  document.onkeydown = () => false // https://stackoverflow.com/questions/37073277/how-to-disable-keyboard-shortcuts-completely-from-javascript
})
</script>

<template>
  <CurrentKeyCombination :currentKeyboardEvent="currentKeyboardEvent" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
