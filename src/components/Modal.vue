<script setup lang="ts">
import { XIcon } from '@heroicons/vue/solid'

import GameKey from '@/stores/game-key'
import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

const { hideAboutModal, hideToolsAndCategoriesModal } = injectStrict(ModalKey)

const { exitSelectionOfToolAndCategories } = injectStrict(GameKey)
defineProps<{ isShow: boolean }>()

const hide = () => {
  exitSelectionOfToolAndCategories()
  hideAboutModal()
  hideToolsAndCategoriesModal()
}
</script>

<template>
  <div data-testid="modal">
    <transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-1"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-1"
      leave-to-class="transform opacity-0"
    >
      <div
        v-if="isShow"
        class="z-10 absolute w-screen h-screen bg-black opacity-30 top-0"
        @click="hide()"
      />
    </transition>

    <transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="transform opacity-0 translate-y-0.5"
      enter-to-class="opacity-1"
      leave-active-class="duration-300 ease-in"
      leave-from-class="opacity-1"
      leave-to-class="transform opacity-0 translate-y-0.5"
    >
      <div
        v-if="isShow"
        class="z-10 p-5 w-4/5 max-w-[45rem] min-h-fit max-h-fit flex flex-col bg-white border border-gray-300 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute"
      >
        <XIcon
          class="self-end h-6 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition duration-200 hover:ease-out"
          @click="hide()"
        />
        <slot @hide-modal="hide()"></slot>
      </div>
    </transition>
  </div>
</template>
