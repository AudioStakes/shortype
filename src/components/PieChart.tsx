import { useId, useState } from 'preact/hooks'

import GameKey from '@/stores/game-key'
import { useStrictContext } from '@/utils/use-strict-context'

const CIRCUMFERENCE = 100
const RADIUS = CIRCUMFERENCE / Math.PI / 2

export default function PieChart() {
  const { countsOfEachStatus } = useStrictContext(GameKey, 'GameKey')
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const isShowCircleDescription = isHovered || isPinned
  const descriptionId = useId()

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

  let sumOfPreviousCounts = 0
  const statusOrder = ['mastered', 'unmastered', 'unanswered'] as const

  const statuses = statusOrder.map((status) => {
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

  const masteredRate = rateOf(countsOfEachStatus.mastered.included)

  return (
    <div
      class="relative h-48 w-48 mx-auto flex justify-center shrink-0"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          setIsHovered(true)
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          setIsHovered(false)
        }
      }}
    >
      {isShowCircleDescription ? (
        <section
          id={descriptionId}
          aria-label="習熟度の詳細"
          class="w-64 max-w-[calc(100vw-2rem)] flex flex-col text-left bg-white absolute z-10 left-1/2 -translate-x-1/2 top-full border border-gray-300 rounded-lg p-2"
        >
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

          <p class="text-sm mt-2">
            ※ 上記は「出題しない」ショートカットキーを含みません
          </p>
        </section>
      ) : null}

      <button
        type="button"
        class="relative h-full w-full rounded-full"
        aria-label={`習熟度 ${masteredRate}% の詳細`}
        aria-expanded={isShowCircleDescription}
        aria-controls={descriptionId}
        onClick={() => {
          setIsPinned((value) => !value)
          if (isPinned) {
            setIsHovered(false)
          }
        }}
        onBlur={() => setIsPinned(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsPinned(false)
            setIsHovered(false)
            event.stopPropagation()
          }
        }}
      >
        <svg
          class="h-full w-full origin-center -rotate-90 fill-transparent stroke-[3]"
          data-testid="pie-chart"
          role="img"
          viewBox="0 0 64 64"
        >
          <title>ショートカットの習熟度を示す円グラフ</title>
          {statuses.map((status) => (
            <circle
              key={status.strokeColor}
              {...status.attributes}
              class={status.strokeColor}
            />
          ))}
        </svg>
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            class={`translate-y-[0.04em] text-2xl font-semibold leading-none text-slate-700 ${
              masteredRate === 100 ? 'tracking-tighter' : ''
            }`}
          >
            {masteredRate}%
          </span>
        </div>
      </button>
    </div>
  )
}
