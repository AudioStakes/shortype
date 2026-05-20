import shortcutCatalog from '@/models/shortcut-catalog'
import type { ShortcutCatalogSummary } from '@/models/shortcut-training-session-summary'

export const createShortcutCatalogSummary = (): ShortcutCatalogSummary => ({
  tools: shortcutCatalog.tools().map((tool) => ({
    name: tool,
    shortcuts: shortcutCatalog.where({ tool }),
    categories: shortcutCatalog.categoriesOf(tool).map((categoryName) => ({
      name: categoryName,
      shortcuts: shortcutCatalog.where({
        tool,
        categories: [categoryName],
      }),
    })),
  })),
})
