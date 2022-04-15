export interface NavigatorExtend extends Navigator {
  keyboard: NavigatorKeyboard
}

export interface NavigatorKeyboard {
  getLayoutMap(): Promise<Map<string, string>>
  lock(): void
}

export interface KeyCombinable {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  key: string | undefined | null
}

export interface ShortcutDescription {
  id: string
  app: string
  os: string
  category: string
  action: string
  keysDescription: string
}

export interface Shortcut extends ShortcutDescription {
  keyCombinations: KeyCombinable[]
  isAvailable: boolean
  unavailableReason: string | null
  needsFillInBlankMode: boolean
}
