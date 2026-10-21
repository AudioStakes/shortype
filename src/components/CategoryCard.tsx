import type { ButtonHTMLAttributes } from 'preact'

import IconGlyph from '@/components/IconGlyph'
import PieChartOfMasteredRate from '@/components/PieChartOfMasteredRate'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  class?: string
  name: string
  masteredRate: number
  isSelected: boolean
}

export default function CategoryCard({
  name,
  masteredRate,
  isSelected,
  class: className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      class={`ui-card ${className ?? ''}`}
      aria-pressed={isSelected}
      {...rest}
    >
      <div class="mx-2 flex min-w-0 flex-1 gap-3 text-left">
        <div class="flex h-8 w-8 shrink-0 justify-center self-center">
          {isSelected ? (
            <IconGlyph
              class="text-green-700 inline-block"
              name="check-circle"
            />
          ) : (
            <div class="self-center h-6 w-6 m-1 rounded-full border-2 border-gray-300" />
          )}
        </div>
        <h3 class="my-auto min-w-0 break-words text-xl font-bold tracking-tight">
          {name}
        </h3>
      </div>

      <div class="flex shrink-0 items-center">
        <PieChartOfMasteredRate masteredRate={masteredRate} />
      </div>
    </button>
  )
}
