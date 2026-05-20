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
    <svg
      class="origin-center -rotate-90 fill-transparent stroke-[3]"
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
        style={{ strokeDasharray: `0 ${masteredRate} ${100 - masteredRate} 0` }}
      />

      <text
        textAnchor="middle"
        dominantBaseline="central"
        class="origin-center rotate-90 fill-slate-700"
      >
        <tspan
          x="50%"
          y="49%"
          class={`text-lg ${masteredRate === 100 ? 'tracking-tighter' : ''}`}
        >
          {masteredRate}
        </tspan>
      </text>
    </svg>
  )
}
