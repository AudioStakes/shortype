import defaultKeyboardLayoutArray from '@/constants/defaultKeyboardLayoutArray'
import keyToDisplayNameArray from '@/constants/keyToDisplayNameArray'
import keyToSymbolArray from '@/constants/keyToSymbolArray'
import specialCodeToKeyArray from '@/constants/specialCodeToKeyArray'
import { NavigatorKeyboard } from '@/types/interfaces'

const specialCodeToKeyMap = new Map<string, string>(specialCodeToKeyArray)
const defaultCodeToKeyMap = new Map<string, string>(defaultKeyboardLayoutArray)
const keyNameToSymbolMap = new Map<string, string>(keyToSymbolArray)
const keyNameToDisplayNameMap = new Map<string, string>(keyToDisplayNameArray)

export default class Keyboard {
  static symbol(key: string) {
    return keyNameToSymbolMap.get(key)
  }

  static toDisplayName(key: string) {
    return keyNameToDisplayNameMap.get(key)
  }

  constructor(private keyboardMap?: Map<string, string>) {}

  key({ code, key }: { code: string; key: string }) {
    return (
      specialCodeToKeyMap.get(code) ?? this.keyboardLayoutMap().get(code) ?? key
    )
  }

  keyboardLayoutMap() {
    return this.keyboardMap ?? defaultCodeToKeyMap
  }

  async setKeyboardLayoutMap(keyboard: NavigatorKeyboard) {
    const keyboardMap = await keyboard.getLayoutMap()
    this.keyboardMap = keyboardMap
  }
}
