<script setup lang="ts">
import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

const { showAboutModal, showToolsAndCategoriesModal } = injectStrict(ModalKey)
</script>

<template>
  <header
    class="max-h-30 w-full flex justify-between self-center items-center px-10 py-3 bg-gray-200"
  >
    <div class="flex">
      <span class="mx-2 text-3xl font-bold">Shortype</span>
      <span class="m-2 text-base">ショートカットキークイズ</span>
    </div>
    <nav>
      <a
        class="px-4 py-2 cursor-pointer hover:text-black transition duration-200 hover:ease-out"
        @click="showAboutModal()"
      >
        About
      </a>
      <button
        class="border rounded-full px-4 py-2 bg-white hover:bg-gray-300 transition duration-200 hover:ease-out"
        @click="showToolsAndCategoriesModal()"
      >
        <span class="mx-2 font-bold text-[14px]" href="#">ツールを選ぶ</span>
        <kbd
          class="h-6 bg-white text-[12px] rounded border-[1px] border-gray-300 shadow-3d-sm px-2 py-1 relative -top-px"
          >T
        </kbd>
      </button>
    </nav>
  </header>
</template>
