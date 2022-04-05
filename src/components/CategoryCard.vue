<script setup lang="ts">
import { CheckCircleIcon } from '@heroicons/vue/solid'

import PieChartOfMasteredRate from '@/components/PieChartOfMasteredRate.vue'

defineProps<{ name: string; masteredRate: number; isSelected: boolean }>()
</script>

<template>
  <button
    class="flex justify-between items-center w-10/12 h-20 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition duration-200 hover:ease-out"
  >
    <div class="mx-2 flex space-x-3 text-left">
      <div class="flex h-8 w-8 justify-center self-center">
        <CheckCircleIcon
          v-if="isSelected"
          class="text-green-400 inline-block"
        />

        <div
          v-else
          class="self-center h-6 w-6 m-1 rounded-full border-2 border-gray-300"
        />
      </div>
      <h3 class="my-auto text-xl font-bold tracking-tight">
        {{ name }}
      </h3>
    </div>

    <div class="flex h-20">
      <PieChartOfMasteredRate :mastered-rate="masteredRate" />
    </div>
  </button>
</template>
