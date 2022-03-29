<script setup lang="ts">
import { ref } from 'vue'

import About from '@/components/About.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import chromeShortcutsJson from '@/constants/shortcuts/chrome.json'
import GameView from '@/views/GameView.vue'
import Unsupported from '@/views/Unsupported.vue'

const isUnsupportedBrowser = navigator.userAgent.indexOf('Chrome') === -1
const isUnsupportedOs = navigator.userAgent.indexOf('Mac') === -1
const isUnsupported = ref(isUnsupportedBrowser || isUnsupportedOs)
const proceed = () => {
  isUnsupported.value = false
}

const shortcuts = chromeShortcutsJson

const isShowToolModal = ref(false)
const isShowAboutModal = ref(false)
</script>

<template>
  <div
    class="font-sans antialiased text-slate-700 h-screen flex flex-col text-center"
  >
    <Header
      @show-tool-modal="isShowToolModal = true"
      @show-about-modal="isShowAboutModal = true"
    />
    <main class="flex-auto flex flex-col justify-center">
      <Unsupported
        v-if="isUnsupported"
        :is-unsupported-browser="isUnsupportedBrowser"
        :is-unsupported-os="isUnsupportedOs"
        @proceed="proceed"
      />
      <GameView
        v-else
        :shortcuts="shortcuts"
        :is-show-tool-modal="isShowToolModal"
        @hide-tool-modal="isShowToolModal = false"
      />
      <About
        :is-show="isShowAboutModal"
        @hide-about-modal="isShowAboutModal = false"
      />
    </main>
    <Footer />
  </div>
</template>
