type Props = {
  masteredRate: number
}

export default function PieChartOfMasteredRate({ masteredRate }: Props) {
  const circleAttributes = {
    cx: '50%',
    cy: '50%',
    r: 100 / Math.PI / 2,
  }

  return (
    <div class="relative h-12 w-12 shrink-0">
      <svg
        class="h-full w-full origin-center -rotate-90 fill-transparent stroke-[3]"
        role="img"
        viewBox="0 0 48 48"
      >
        <title>身についた割合 {masteredRate}%</title>
        <circle
          class="stroke-green-300"
          {...circleAttributes}
          style={{ strokeDasharray: `${masteredRate} ${100 - masteredRate}` }}
        />
        <circle
          class="stroke-gray-200"
          {...circleAttributes}
          style={{
            strokeDasharray: `0 ${masteredRate} ${100 - masteredRate} 0`,
          }}
        />
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
    </div>
  )
}
