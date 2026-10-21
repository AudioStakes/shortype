import type { ButtonHTMLAttributes } from 'preact'

import IconGlyph from '@/components/IconGlyph'
import PieChartOfMasteredRate from '@/components/PieChartOfMasteredRate'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  class?: string
  toolName: string
  masteredRate: number
}

export default function ToolCard({
  toolName,
  masteredRate,
  class: className,
  ...rest
}: Props) {
  return (
    <button type="button" class={`ui-card ${className ?? ''}`} {...rest}>
      <h3 class="my-auto mx-4 min-w-0 break-words text-left text-xl font-bold tracking-tight">
        {toolName}
      </h3>

      <div class="flex shrink-0 items-center">
        <PieChartOfMasteredRate masteredRate={masteredRate} />
        <IconGlyph name="chevron-right" class="h-8 my-auto text-gray-500" />
      </div>
    </button>
  )
}
