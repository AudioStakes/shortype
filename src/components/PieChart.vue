<script setup lang="ts">
import { computed, ref } from 'vue'

import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils'

const { countsOfEachStatus } = injectStrict(GameKey)

const CIRCUMFERENCE = 100
const RADIUS = CIRCUMFERENCE / Math.PI / 2

const isShowCircleDescription = ref(false)
const showCircleDescription = () => {
  isShowCircleDescription.value = true
}
const hideCircleDescription = () => {
  isShowCircleDescription.value = false
}

const strokeDashArray = (
  sumOfPreviousCounts: number,
  count: number,
  totalCount: number = totalCountOfIncluded.value
) => {
  const alreadyPaintedSize = (sumOfPreviousCounts / totalCount) * 100
  const paintSize = (count / totalCount) * 100

  if (sumOfPreviousCounts + count === totalCount) {
    return `0 ${alreadyPaintedSize} ${100 - alreadyPaintedSize} 0`
  } else {
    return `0 ${alreadyPaintedSize} ${paintSize} ${
      100 - (alreadyPaintedSize + paintSize)
    }`
  }
}

type status = 'mastered' | 'unmastered' | 'noAnswered'
type subStatus = 'included' | 'removed'
const styleOfEachStatus = {
  mastered: {
    name: '身についた',
    included: {
      bgColor: 'bg-green-300',
      strokeColor: 'stroke-green-300',
    },
    removed: {
      bgColor: 'bg-gray-700',
      strokeColor: 'stroke-gray-700',
    },
  },
  unmastered: {
    name: '身についていない',
    included: {
      bgColor: 'bg-red-300',
      strokeColor: 'stroke-red-300',
    },
    removed: {
      bgColor: 'bg-gray-700',
      strokeColor: 'stroke-gray-700',
    },
  },
  noAnswered: {
    name: '未回答',
    included: {
      bgColor: 'bg-gray-300',
      strokeColor: 'stroke-gray-300',
    },
    removed: {
      bgColor: 'bg-gray-700',
      strokeColor: 'stroke-gray-700',
    },
  },
}

const totalCountOfIncluded = computed(() => {
  return Object.values(countsOfEachStatus.value).reduce(
    (previous, { included }) => previous + included,
    0
  )
})

const totalCountOfRemoved = computed(() => {
  return Object.values(countsOfEachStatus.value).reduce(
    (previous, { removed }) => previous + removed,
    0
  )
})

const rateOf = (
  count: number,
  totalCount: number = totalCountOfIncluded.value
) => {
  return Math.floor((count / totalCount) * 100)
}

const isAllMastered = computed(
  () =>
    countsOfEachStatus.value.mastered.included === totalCountOfIncluded.value
)

const subStatusOrder = ['included', 'removed']
const statuses = computed(() => {
  let sumOfPreviousCounts = 0

  const statuses = Object.entries(countsOfEachStatus.value)
    .flatMap(([status, { included, removed }]) => {
      return [
        {
          status,
          subStatus: 'included',
          count: included,
        },
        {
          status,
          subStatus: 'removed',
          count: removed,
        },
      ]
    })
    .sort((a, b) => {
      return (
        subStatusOrder.indexOf(a.subStatus) -
        subStatusOrder.indexOf(b.subStatus)
      )
    })
    .filter(({ subStatus }) => subStatus === 'included')
    .map(({ status, subStatus, count }) => {
      sumOfPreviousCounts += count
      return {
        count,
        strokeColor:
          styleOfEachStatus[status as status][subStatus as subStatus]
            .strokeColor,
        attributes: {
          cx: '50%',
          cy: '50%',
          r: RADIUS,
          style: {
            'stroke-dasharray': strokeDashArray(
              sumOfPreviousCounts - count,
              count
            ),
          },
        },
      }
    })

  return statuses
})
</script>

<template>
  <div class="flex-initial h-48 flex justify-center">
    <svg
      class="origin-center -rotate-90 fill-transparent stroke-[3]"
      data-testid="pie-chart"
      viewBox="0 0 64 64"
      @mouseleave="hideCircleDescription"
      @mouseover="showCircleDescription"
    >
      <!-- eslint-disable -->
      <template v-for="(status, key, index) in statuses">
        <circle v-bind="status.attributes" :class="status.strokeColor" />
      </template>
      <!-- eslint-enable -->

      <text
        text-anchor="middle"
        dominant-baseline="central"
        class="origin-center rotate-90 fill-slate-700"
      >
        <tspan x="50%" y="45%" class="text-[0.8rem] font-sans">
          {{ rateOf(countsOfEachStatus.mastered.included) }}
        </tspan>
        <tspan :x="isAllMastered ? '69%' : '66%'" y="50%" class="text-[0.3rem]">
          %
        </tspan>
        <tspan x="50%" y="60%" class="text-[0.25rem]">身についた</tspan>
      </text>
    </svg>
  </div>
</template>
