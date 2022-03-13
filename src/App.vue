<script setup lang="ts">
import { ref } from 'vue'

import Unsupported from './views/Unsupported.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import GameView from './views/GameView.vue'

const isUnsupportedBrowser = navigator.userAgent.indexOf('Chrome') === -1
const isUnsupportedOs = navigator.userAgent.indexOf("Mac") === -1
const isUnsupported = ref(isUnsupportedBrowser || isUnsupportedOs)
const proceed = () => {
  isUnsupported.value = false
}
</script>

<template>
  <div class="font-mono antialiased text-slate-700 h-screen flex flex-col text-center">
    <Unsupported
      v-if="isUnsupported"
      :isUnsupportedBrowser="isUnsupportedBrowser"
      :isUnsupportedOs="isUnsupportedOs"
      @proceed="proceed"
    ></Unsupported>
    <Header />
    <main class="flex-auto flex flex-col justify-center">
      <GameView />
    </main>
    <Footer />
  </div>
</template>
