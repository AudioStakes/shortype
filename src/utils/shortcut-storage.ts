import TOOL_TO_SHORTCUTS_MAP from '@/constants/tool-to-shortcuts-map'
import { Shortcut } from '@/types/interfaces'

const shortcutStorage = {
  where: ({ tool, categories }: { tool: string; categories?: string[] }) => {
    const shortcuts = TOOL_TO_SHORTCUTS_MAP.get(tool) as Shortcut[]

    if (!categories || !categories.length) {
      return shortcuts.map((shortcut) => shortcut)
    }

    return shortcuts
      .filter((shortcut) => categories.includes(shortcut.category))
      .map((shortcut) => shortcut)
  },
}

export default shortcutStorage
