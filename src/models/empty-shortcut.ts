import type { Shortcut } from '@/types/interfaces'

export const createEmptyShortcut = (): Shortcut => ({
  id: '',
  app: '',
  os: '',
  category: '',
  action: '',
  keysDescription: '',
  keyCombinations: [],
  isAvailable: false,
  unavailableReason: null,
  needsFillInBlankMode: false,
})
