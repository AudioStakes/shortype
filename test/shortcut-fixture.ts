import { createEmptyShortcut } from '@/models/empty-shortcut'
import type { Shortcut } from '@/types/interfaces'

export const shortcutFixture = (
  id: string,
  overrides: Partial<Shortcut> = {},
): Shortcut => ({
  ...createEmptyShortcut(),
  id,
  app: 'Google Chrome',
  os: 'macOS',
  category: 'Tabs',
  action: `Action ${id}`,
  keysDescription: '⌘+m',
  keyCombinations: [
    { altKey: false, ctrlKey: false, metaKey: true, shiftKey: false, key: 'm' },
  ],
  isAvailable: true,
  ...overrides,
})
