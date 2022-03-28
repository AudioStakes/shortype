<script setup lang="ts">
const props = defineProps<{ app: string; masteredRate: number }>()

const masteredAttributes = {
  cx: '50%',
  cy: '50%',
  r: 100 / Math.PI / 2,
  style: {
    'stroke-dasharray': `${props.masteredRate} ${100 - props.masteredRate}`,
  },
}

const unmasteredAttributes = {
  cx: '50%',
  cy: '50%',
  r: 100 / Math.PI / 2,
  style: {
    'stroke-dasharray': `0 ${props.masteredRate} ${100 - props.masteredRate} 0`,
  },
}
</script>

<template>
  <button
    class="flex justify-between w-10/12 h-20 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
  >
    <h3 class="my-auto mx-4 text-3xl font-bold tracking-tight">
      {{ app }}
    </h3>

    <div class="flex h-20">
      <svg
        class="origin-center -rotate-90 fill-transparent stroke-[3]"
        viewBox="0 0 48 48"
      >
        <circle v-bind="masteredAttributes" class="stroke-green-300" />
        <circle v-bind="unmasteredAttributes" class="stroke-gray-200" />

        <text
          text-anchor="middle"
          dominant-baseline="central"
          class="origin-center rotate-90 fill-slate-700"
        >
          <tspan x="50%" y="50%" class="text-lg">
            {{ masteredRate }}
          </tspan>
        </text>
      </svg>
    </div>
  </button>
</template>
