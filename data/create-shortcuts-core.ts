import type { Shortcut, ShortcutDescription } from '@/types/interfaces'

import { createShortcut } from './create-shortcut'

export const createShortcutsFromRecords = (
  records: ShortcutDescription[],
): Shortcut[] => records.map((record) => createShortcut(record))
