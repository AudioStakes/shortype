import ToolCard from '@/components/ToolCard'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

type Props = {
  onSelectTool: (tool: string) => void
}

export default function ToolSelect({ onSelectTool }: Props) {
  const { masteredRateOfEachTool } = injectStrict(GameKey, 'GameKey')

  return (
    <div class="w-full h-fit flex flex-col items-center gap-6 bg-white">
      <div class="flex justify-between items-start w-10/12 pb-1 border-b">
        <h2 class="my-auto text-base">ツールを選んでください</h2>
      </div>

      {masteredRateOfEachTool().map((toolSummary) => (
        <ToolCard
          key={toolSummary.name}
          toolName={toolSummary.name}
          masteredRate={toolSummary.masteredRate}
          onClick={() => onSelectTool(toolSummary.name)}
        />
      ))}
    </div>
  )
}
