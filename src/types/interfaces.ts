export interface NavigatorExtend extends Navigator {
  keyboard: NavigatorKeyboard
}

export interface NavigatorKeyboard {
  getLayoutMap(): Promise<Map<string, string>>
}

export interface KeyCombinable {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  key: string | undefined | null
}

export interface Shortcut {
  id: string

  app: string
  os: string
  category: string
  action: string
  shortcut: string

  keyCombinations: KeyCombinable[]

  isAvailable: boolean
  unavailableReason: string | null
  needsFillInBlankMode: boolean
}
