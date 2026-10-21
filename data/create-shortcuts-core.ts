import type { Shortcut, ShortcutDescription } from '@/types/interfaces'

import { createShortcut } from './create-shortcut'

export const createShortcutsFromRecords = (
  records: Partial<ShortcutDescription>[],
): Shortcut[] =>
  records.map((record) => {
    const { id, app, os, category, action, keysDescription } = record
    if (
      id === undefined ||
      app === undefined ||
      os === undefined ||
      category === undefined ||
      action === undefined ||
      keysDescription === undefined
    ) {
      throw new Error('Shortcut CSV is missing a required field')
    }
    return createShortcut({ id, app, os, category, action, keysDescription })
  })
