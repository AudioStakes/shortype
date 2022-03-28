<script setup lang="ts">
const emit = defineEmits(['show-tool-modal'])
</script>

<template>
  <header
    class="max-h-30 w-full flex justify-between self-center items-center px-10 py-3 bg-gray-200"
  >
    <div class="flex">
      <span class="mx-2 text-3xl font-bold text-black-900">Shortype</span>
      <span class="m-2 text-base text-black-900">ショートカットキークイズ</span>
    </div>
    <nav>
      <button
        class="border border-gray-500 rounded-full px-4 py-2 hover:bg-gray-300 hover:border-transparent"
        @click="emit('show-tool-modal')"
      >
        <span class="mx-2 font-bold" href="#">ツールを選ぶ</span>
        <kbd
          class="h-6 bg-white rounded border-[1px] border-gray-300 shadow-3d px-2 py-1"
          >T
        </kbd>
      </button>
    </nav>
  </header>
</template>
