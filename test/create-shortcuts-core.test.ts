import { expect, test } from 'vitest'

import { createShortcutsFromRecords } from '@/../data/create-shortcuts-core'
import type { ShortcutDescription } from '@/types/interfaces'

test('create shortcuts from shortcut descriptions in order', () => {
  const records: ShortcutDescription[] = [
    {
      id: '1',
      app: 'Google Chrome',
      os: 'macOS',
      category: 'Tabs',
      action: 'Move to the last tab',
      keysDescription: '⌘+9',
    },
    {
      id: '2',
      app: 'Google Chrome',
      os: 'macOS',
      category: 'Tabs',
      action: 'Minimize window',
      keysDescription: '⌘+m',
    },
  ]

  const shortcuts = createShortcutsFromRecords(records)

  expect(shortcuts.map((shortcut) => shortcut.id)).toEqual(['1', '2'])
  expect(shortcuts[0]?.isAvailable).toBe(true)
  expect(shortcuts[1]?.isAvailable).toBe(true)
})

test('requires each CSV field before producing shortcuts', () => {
  const record: Partial<ShortcutDescription> = {
    id: '1',
    app: 'Example',
    os: 'macOS',
    category: 'Tabs',
    action: 'Move',
    keysDescription: 'Command + m',
  }
  for (const field of [
    'id',
    'app',
    'os',
    'category',
    'action',
    'keysDescription',
  ] as const) {
    const incomplete = { ...record }
    delete incomplete[field]
    expect(() => createShortcutsFromRecords([incomplete])).toThrow(
      'missing a required field',
    )
  }
  expect(createShortcutsFromRecords([])).toEqual([])
})
