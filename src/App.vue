<script setup lang="ts">
import { ref } from 'vue'

import GameView from './views/GameView.vue'
import Unsupported from './views/Unsupported.vue'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

import chromeShortcutsJson from './assets/chrome.json'

const isUnsupportedBrowser = navigator.userAgent.indexOf('Chrome') === -1
const isUnsupportedOs = navigator.userAgent.indexOf("Mac") === -1
const isUnsupported = ref(isUnsupportedBrowser || isUnsupportedOs)
const proceed = () => {
  isUnsupported.value = false
}

const shortcuts = chromeShortcutsJson.filter((shortcut) => shortcut.isAvailable)
</script>

<template>
  <div class="font-mono antialiased text-slate-700 h-screen flex flex-col text-center">
    <Header />
    <main class="flex-auto flex flex-col justify-center">
      <Unsupported
        v-if="isUnsupported"
        :isUnsupportedBrowser="isUnsupportedBrowser"
        :isUnsupportedOs="isUnsupportedOs"
        @proceed="proceed"
      />
      <GameView v-else :shortcuts="shortcuts" />
    </main>
    <Footer />
  </div>
</template>
