<script setup lang="ts">
import { XIcon } from '@heroicons/vue/solid'
const props = defineProps<{ isShow: boolean }>()
const emit = defineEmits(['hide-about-modal'])
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
        v-if="props.isShow"
        class="z-10 absolute w-screen h-screen bg-black opacity-30 top-0"
        @click="emit('hide-about-modal')"
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
        v-if="props.isShow"
        class="z-10 p-5 w-4/5 max-w-[45rem] flex flex-col bg-white border border-gray-300 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute"
      >
        <XIcon
          class="self-end h-6 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition duration-200 hover:ease-out"
          @click="emit('hide-about-modal')"
        />

        <div class="w-full flex flex-col space-y-4 text-left">
          <h1 class="text-3xl font-bold text-center">Shortype について</h1>
          <p>
            Shortype は、クイズに答えるだけで自然とショートカットキーが身につく
            Web サービスです。
          </p>
          <h2 class="text-lg font-bold">
            操作はショートカットキーを入力するだけ
          </h2>
          <p>（説明用の文章を作成中）</p>
          <h2 class="text-lg font-bold">
            公式ドキュメントのショートカットキーを完全網羅
          </h2>
          <p>（説明用の文章を作成中）</p>
          <h2 class="text-lg font-bold">
            身についていないショートカットキーの出題頻度が自動的に高まる
          </h2>
          <p>（説明用の文章を作成中）</p>
          <h2 class="text-lg font-bold">
            身につけたいショートカットキーに絞って練習できる
          </h2>
          <p>（説明用の文章を作成中）</p>
        </div>
      </div>
    </transition>
  </div>
</template>
