<script setup lang="ts">
import { XIcon } from '@heroicons/vue/solid'

import ToolCard from '@/components/ToolCard.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { state, updateTool, masteredRateOfEachTool, hideToolsView } =
  injectStrict(GameKey)
const props = defineProps<{ isShow: boolean }>()

const emit = defineEmits(['hide-tool-modal'])
const hide = () => {
  if (state.isSelectToolsKeyPressed) hideToolsView()
  if (props.isShow) emit('hide-tool-modal')
}
const update = (appName: string) => {
  updateTool(appName)
  if (props.isShow) emit('hide-tool-modal')
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
        v-if="state.isSelectToolsKeyPressed || props.isShow"
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
        v-if="state.isSelectToolsKeyPressed || props.isShow"
        class="z-10 p-3 w-3/4 max-w-[50rem] flex flex-col items-center gap-2 bg-white border-2 border-gray-500 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute"
      >
        <div class="flex justify-between items-start w-10/12 border-b">
          <h2 class="my-auto text-xl">ツールを選択してください</h2>
          <XIcon
            class="h-10 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5"
            @click="hide()"
          />
        </div>

        <!-- eslint-disable -->
        <template v-for="app in masteredRateOfEachTool()">
          <ToolCard
            :app="app.name"
            :mastered-rate="app.masteredRate"
            @click="update(app.name)"
          />
        </template>
        <!-- eslint-enable -->
      </div>
    </transition>
  </div>
</template>
