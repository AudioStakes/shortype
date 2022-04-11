<script setup lang="ts">
import { provide, ref } from 'vue'

import About from '@/components/About.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import modalStore from '@/stores/modal'
import ModalKey from '@/stores/modal-key'
import GameView from '@/views/GameView.vue'
import Unsupported from '@/views/Unsupported.vue'

const modal = modalStore()
provide(ModalKey, modal)
const { modalState } = modal

const isUnsupportedBrowser = navigator.userAgent.indexOf('Chrome') === -1
const isUnsupportedOs = navigator.userAgent.indexOf('Mac') === -1
const isUnsupported = ref(isUnsupportedBrowser || isUnsupportedOs)
const proceed = () => {
  isUnsupported.value = false
}
</script>

<template>
  <div
    class="font-sans antialiased text-slate-700 h-screen flex flex-col text-center"
  >
    <Header />
    <main class="flex-auto flex flex-col justify-center">
      <Unsupported
        v-if="isUnsupported"
        :is-unsupported-browser="isUnsupportedBrowser"
        :is-unsupported-os="isUnsupportedOs"
        @proceed="proceed"
      />
      <GameView
        v-else
        :is-show-tool-modal="modalState.isShowToolsAndCategoriesModal"
      />
      <About :is-show="modalState.isShowAboutModal" />
    </main>
    <Footer />
  </div>
</template>
