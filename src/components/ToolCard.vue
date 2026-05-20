<script setup lang="ts">
import IconGlyph from '@/components/IconGlyph.vue'
import PieChartOfMasteredRate from '@/components/PieChartOfMasteredRate.vue'

defineProps<{ app: string; masteredRate: number }>()
</script>

<template>
  <button
    type="button"
    class="flex justify-between w-10/12 h-20 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition duration-200 hover:ease-out"
  >
    <h3 class="my-auto mx-4 text-xl font-bold tracking-tight">{{ app }}</h3>

    <div class="flex h-20">
      <PieChartOfMasteredRate :mastered-rate="masteredRate" />
      <IconGlyph name="chevron-right" class="h-8 my-auto text-gray-500" />
    </div>
  </button>
</template>
