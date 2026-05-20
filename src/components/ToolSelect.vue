<script setup lang="ts">
import ToolCard from '@/components/ToolCard.vue'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const { masteredRateOfEachTool } = injectStrict(GameKey)

const emit = defineEmits(['select-tool'])
</script>

<template>
  <div class="w-full h-fit flex flex-col items-center gap-6 bg-white">
    <div class="flex justify-between items-start w-10/12 pb-1 border-b">
      <h2 class="my-auto text-base">ツールを選んでください</h2>
    </div>

    <ToolCard
      v-for="(toolSummary, index) in masteredRateOfEachTool()"
      :key="index"
      :tool-name="toolSummary.name"
      :mastered-rate="toolSummary.masteredRate"
      @click="emit('select-tool', toolSummary.name)"
    />
  </div>
</template>
