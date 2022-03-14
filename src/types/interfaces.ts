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
  key: string | undefined
}

export interface Shortcut {
  action: string
  altKey: boolean
  app: string
  category: string
  ctrlKey: boolean
  isAvailable: boolean
  key: string
  metaKey: boolean
  os: string
  shiftKey: boolean
  shortcut: string
}
