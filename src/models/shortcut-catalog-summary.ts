import shortcutCatalog from '@/models/shortcut-catalog'
import type { ShortcutCatalogSummary } from '@/models/shortcut-training-session-summary'

export const createShortcutCatalogSummary = (): ShortcutCatalogSummary => ({
  tools: shortcutCatalog.listToolGroups(),
})
