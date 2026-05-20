import TOOL_TO_SHORTCUTS_MAP from '@/constants/tool-to-shortcuts-map'
import type { Shortcut } from '@/types/interfaces'

export type ShortcutCatalogCategoryGroup = {
  name: string
  shortcuts: Shortcut[]
}

export type ShortcutCatalogToolGroup = {
  name: string
  shortcuts: Shortcut[]
  categories: ShortcutCatalogCategoryGroup[]
}

const TOOL_GROUPS: ShortcutCatalogToolGroup[] = Array.from(
  TOOL_TO_SHORTCUTS_MAP.entries(),
).map(([tool, shortcuts]) => {
  const categoryMap = new Map<string, Shortcut[]>()

  for (const shortcut of shortcuts) {
    const groupedShortcuts = categoryMap.get(shortcut.category)

    if (groupedShortcuts) {
      groupedShortcuts.push(shortcut)
    } else {
      categoryMap.set(shortcut.category, [shortcut])
    }
  }

  return {
    name: tool,
    shortcuts,
    categories: Array.from(categoryMap.entries()).map(
      ([name, groupedShortcuts]) => ({
        name,
        shortcuts: groupedShortcuts,
      }),
    ),
  }
})

const TOOL_GROUP_MAP = new Map(
  TOOL_GROUPS.map((toolGroup) => [toolGroup.name, toolGroup] as const),
)

const getToolGroup = (tool: string): ShortcutCatalogToolGroup | undefined =>
  TOOL_GROUP_MAP.get(tool)

export type ShortcutCatalog = {
  searchShortcuts: (args: { tool: string; categories?: string[] }) => Shortcut[]
  listTools: () => string[]
  listCategoriesOf: (tool: string) => string[]
  listToolGroups: () => ShortcutCatalogToolGroup[]
}

const shortcutCatalog: ShortcutCatalog = {
  searchShortcuts: ({
    tool,
    categories,
  }: {
    tool: string
    categories?: string[]
  }) => {
    const toolGroup = getToolGroup(tool)

    if (!toolGroup) {
      return []
    }

    if (!categories?.length) {
      return [...toolGroup.shortcuts]
    }

    const categorySet = new Set(categories)

    return toolGroup.shortcuts.filter((shortcut) =>
      categorySet.has(shortcut.category),
    )
  },

  listTools: () => TOOL_GROUPS.map(({ name }) => name),

  listCategoriesOf: (tool: string) => {
    return getToolGroup(tool)?.categories.map(({ name }) => name) ?? []
  },

  listToolGroups: () => TOOL_GROUPS,
}

export default shortcutCatalog
