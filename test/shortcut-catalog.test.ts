import { expect, test } from 'vitest'
import shortcutCatalog from '@/models/shortcut-catalog'

test('a removed tool has no selectable categories or shortcuts', () => {
  expect(shortcutCatalog.listCategoriesOf('Removed tool')).toEqual([])
  expect(shortcutCatalog.searchShortcuts({ tool: 'Removed tool' })).toEqual([])
})
