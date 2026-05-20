import TOOL_TO_SHORTCUTS_MAP from '@/constants/tool-to-shortcuts-map'
import type { Shortcut } from '@/types/interfaces'

const shortcutCatalog = {
  where: ({ tool, categories }: { tool: string; categories?: string[] }) => {
    const shortcuts = TOOL_TO_SHORTCUTS_MAP.get(tool) as Shortcut[]

    if (!categories?.length) {
      return shortcuts.map((shortcut) => shortcut)
    }

    return shortcuts
      .filter((shortcut) => categories.includes(shortcut.category))
      .map((shortcut) => shortcut)
  },

  tools: () => Array.from(TOOL_TO_SHORTCUTS_MAP.keys()),

  categoriesOf: (tool: string) => {
    const shortcuts = TOOL_TO_SHORTCUTS_MAP.get(tool) ?? []

    return Array.from(new Set(shortcuts.map((shortcut) => shortcut.category)))
  },
}

export default shortcutCatalog
