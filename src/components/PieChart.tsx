import { useMemo, useState } from 'preact/hooks'

import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const CIRCUMFERENCE = 100
const RADIUS = CIRCUMFERENCE / Math.PI / 2

export default function PieChart() {
  const { countsOfEachStatus } = injectStrict(GameKey, 'GameKey')
  const [isShowCircleDescription, setIsShowCircleDescription] = useState(false)

  const styleOfEachStatus = {
    mastered: {
      name: '身についた',
      included: {
        bgColor: 'bg-green-300',
        strokeColor: 'stroke-green-300',
      },
    },
    unmastered: {
      name: '身についていない',
      included: {
        bgColor: 'bg-red-300',
        strokeColor: 'stroke-red-300',
      },
    },
    unanswered: {
      name: '未回答',
      included: {
        bgColor: 'bg-gray-300',
        strokeColor: 'stroke-gray-300',
      },
    },
  } as const

  const totalCountOfIncluded = Object.values(countsOfEachStatus).reduce(
    (previous, { included }) => previous + included,
    0,
  )

  const rateOf = (count: number, totalCount: number = totalCountOfIncluded) =>
    Math.floor((count / totalCount) * 100)

  const strokeDashArray = (
    sumOfPreviousCounts: number,
    count: number,
    totalCount: number = totalCountOfIncluded,
  ) => {
    const alreadyPaintedSize = (sumOfPreviousCounts / totalCount) * 100
    const paintSize = (count / totalCount) * 100

    if (sumOfPreviousCounts + count === totalCount) {
      return `0 ${alreadyPaintedSize} ${100 - alreadyPaintedSize} 0`
    }

    return `0 ${alreadyPaintedSize} ${paintSize} ${
      100 - (alreadyPaintedSize + paintSize)
    }`
  }

  const statuses = useMemo(() => {
    let sumOfPreviousCounts = 0
    const statusOrder = ['mastered', 'unmastered', 'unanswered'] as const

    return statusOrder.map((status) => {
      const count = countsOfEachStatus[status].included
      const previousCounts = sumOfPreviousCounts
      sumOfPreviousCounts += count

      return {
        strokeColor: styleOfEachStatus[status].included.strokeColor,
        attributes: {
          cx: '50%',
          cy: '50%',
          r: RADIUS,
          style: {
            strokeDasharray: strokeDashArray(previousCounts, count),
          },
        },
      }
    })
  }, [countsOfEachStatus])

  const masteredRate = rateOf(countsOfEachStatus.mastered.included)

  return (
    <div class="h-48 w-48 mx-auto flex justify-center">
      {isShowCircleDescription ? (
        <div class="w-64 flex flex-col text-left bg-white absolute z-10 left-1/2 translate-x-[5rem] top-[10%] border border-gray-300 rounded-lg p-2">
          <table class="border-separate" style={{ borderSpacing: '0 0.25rem' }}>
            <thead class="text-sm">
              <tr>
                <th colSpan={2} class="border-b p-1">
                  ステータス
                </th>
                <th class="border-b px-2 py-0.5 text-right">個数</th>
                <th class="border-b pr-4 py-0.5 text-right">比率</th>
              </tr>
            </thead>
            <tbody>
              {(['mastered', 'unmastered', 'unanswered'] as const).map(
                (status) => (
                  <tr
                    key={status}
                    class={`text-base ${styleOfEachStatus[status].included.bgColor}`}
                  >
                    <td class="px-1 py-1.5">
                      {styleOfEachStatus[status].name}
                    </td>
                    <td class="px-1 py-1.5" />
                    <td class="px-2 py-1.5 text-right">
                      {countsOfEachStatus[status].included}
                    </td>
                    <td class="px-2 py-1.5 text-right">
                      {rateOf(countsOfEachStatus[status].included)}
                      <span class="p-0.5 text-xs">%</span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          <ul class="list-none text-sm mt-2">
            <li class="mx-2 break-all" />※
            上記は「出題しない」ショートカットキーを含みません
          </ul>
        </div>
      ) : null}

      <svg
        class="origin-center -rotate-90 fill-transparent stroke-[3]"
        data-testid="pie-chart"
        role="img"
        viewBox="0 0 64 64"
        onMouseEnter={() => setIsShowCircleDescription(true)}
        onMouseLeave={() => setIsShowCircleDescription(false)}
      >
        <title>ショートカットの習熟度を示す円グラフ</title>
        {statuses.map((status, index) => (
          <circle
            key={index}
            {...status.attributes}
            class={status.strokeColor}
          />
        ))}

        <text
          textAnchor="middle"
          dominantBaseline="central"
          class="origin-center rotate-90 fill-slate-700"
        >
          <tspan
            x={masteredRate === 100 ? '49%' : '50%'}
            y="50%"
            class={`text-[0.8rem] font-semibold ${
              masteredRate === 100 ? 'tracking-tighter' : ''
            }`}
          >
            {masteredRate}
          </tspan>
          <tspan
            x={`${masteredRate.toString().length * 2.5 + 60}%`}
            y="54%"
            class="text-[0.25rem]"
          >
            %
          </tspan>
        </text>
      </svg>
    </div>
  )
}
