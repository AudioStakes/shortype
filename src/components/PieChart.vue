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

const rateOf = (
  count: number,
  totalCount: number = totalCountOfIncluded.value
) => {
  return Math.floor((count / totalCount) * 100)
}

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
          styleOfEachStatus[status as 'mastered' | 'unmastered' | 'noAnswered'][
            subStatus as 'included' | 'removed'
          ].strokeColor,
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
  <div class="h-48 w-48 mx-auto flex justify-center">
    <transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-1"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-1"
      leave-to-class="transform opacity-0"
    >
      <div
        v-if="isShowCircleDescription"
        class="w-64 flex flex-col text-left bg-white absolute z-10 left-1/2 translate-x-[5rem] top-[10%] border border-gray-300 rounded-lg p-2"
      >
        <table class="border-separate" style="border-spacing: 0 0.25rem">
          <thead class="text-sm">
            <tr>
              <th colspan="2" class="border-b p-1">ステータス</th>
              <th class="border-b px-2 py-0.5 text-right">個数</th>
              <th class="border-b pr-4 py-0.5 text-right">比率</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(_, status, index) in countsOfEachStatus"
              :key="index"
              class="text-base"
              :class="styleOfEachStatus[status].included.bgColor"
            >
              <td class="px-1 py-1.5">
                {{ styleOfEachStatus[status].name }}
              </td>

              <td class="px-1 py-1.5"></td>
              <td class="px-2 py-1.5 text-right">
                {{ countsOfEachStatus[status].included }}
              </td>
              <td class="px-2 py-1.5 text-right">
                {{ rateOf(countsOfEachStatus[status].included)
                }}<span class="p-0.5 text-xs">%</span>
              </td>
            </tr>
          </tbody>
        </table>

        <ul class="list-none text-sm mt-2">
          <li class="mx-2 break-all"></li>
          ※ 上記は「出題しない」ショートカットキーを含みません
        </ul>
      </div>
    </transition>

    <svg
      class="origin-center -rotate-90 fill-transparent stroke-[3]"
      data-testid="pie-chart"
      viewBox="0 0 64 64"
      @mouseleave="hideCircleDescription"
      @mouseover="showCircleDescription"
    >
      <circle
        v-for="(status, index) in statuses"
        :key="index"
        v-bind="status.attributes"
        :class="status.strokeColor"
      />

      <text
        text-anchor="middle"
        dominant-baseline="central"
        class="origin-center rotate-90 fill-slate-700"
      >
        <tspan x="50%" y="50%" class="text-[0.8rem] font-bold">
          {{ rateOf(countsOfEachStatus.mastered.included) }}
        </tspan>
        <tspan
          :x="
            `${
              rateOf(countsOfEachStatus.mastered.included).toString().length *
                3 +
              60
            }` + '%'
          "
          y="54%"
          class="text-[0.25rem]"
        >
          %
        </tspan>
      </text>
    </svg>
  </div>
</template>
