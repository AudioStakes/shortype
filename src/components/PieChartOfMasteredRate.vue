<script setup lang="ts">
defineProps<{ masteredRate: number }>()

const circleAttributes = {
  cx: '50%',
  cy: '50%',
  r: 100 / Math.PI / 2,
}
</script>

<template>
  <svg
    class="origin-center -rotate-90 fill-transparent stroke-[3]"
    viewBox="0 0 48 48"
  >
    <circle
      class="stroke-green-300"
      v-bind="circleAttributes"
      :style="{
        'stroke-dasharray': `${masteredRate} ${100 - masteredRate}`,
      }"
    />
    <circle
      class="stroke-gray-200"
      v-bind="circleAttributes"
      :style="{
        'stroke-dasharray': `0 ${masteredRate} ${100 - masteredRate} 0`,
      }"
    />

    <text
      text-anchor="middle"
      dominant-baseline="central"
      class="origin-center rotate-90 fill-slate-700"
    >
      <tspan
        x="50%"
        y="49%"
        class="text-lg"
        :class="{ 'tracking-tighter': masteredRate === 100 }"
      >
        {{ masteredRate }}
      </tspan>
    </text>
  </svg>
</template>
