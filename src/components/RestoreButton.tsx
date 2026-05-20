import IconGlyph from '@/components/IconGlyph'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

type Props = {
  class?: string
}

export default function RestoreButton({ class: className }: Props) {
  const { removedShortcutExists, restoreRemovedShortcuts } = injectStrict(
    GameKey,
    'GameKey',
  )

  if (!removedShortcutExists) {
    return null
  }

  return (
    <button
      type="button"
      class={`mx-auto flex text-sm bg-gray-200 hover:bg-gray-300 py-0.2 px-1.5 rounded my-3 transition duration-200 hover:ease-out ${className ?? ''}`}
      onClick={restoreRemovedShortcuts}
    >
      <IconGlyph name="arrow-path" class="my-auto h-6 px-1 py-1" />
      <span class="my-auto">出題しないリストを空にする</span>
    </button>
  )
}
