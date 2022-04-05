import defaultKeyboardLayoutArray from '@/constants/defaultKeyboardLayoutArray'
import { KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP } from '@/constants/keyDescriptionRegexp'
import keyDescriptionToKeyArray from '@/constants/keyDescriptionToKeyArray'
import KEY_REGEXP from '@/constants/keyRegexp'
import keyToAnnotationArray from '@/constants/keyToAnnotationArray'
import keyToSymbolArray from '@/constants/keyToSymbolArray'
import symbolicKeyToAnnotationArray from '@/constants/symbolicKeyToAnnotationArray'
import undefinedCodeToKeyArray from '@/constants/undefinedCodeToKeyArray'
import { NavigatorKeyboard } from '@/types/interfaces'

const undefinedCodeToKeyMap = new Map<string, string>(undefinedCodeToKeyArray)
const defaultCodeToKeyMap = new Map<string, string>(defaultKeyboardLayoutArray)

const keyToAnnotationMap = new Map<string, string>(keyToAnnotationArray)
const keyToSymbolMap = new Map<string, string>(keyToSymbolArray)
const symbolicKeyToAnnotationMap = new Map<string, string>(
  symbolicKeyToAnnotationArray
)

const keyDescriptionToKeyMap = new Map<string, string>(keyDescriptionToKeyArray)

export default class Keyboard {
  static isKey(word: string) {
    return KEY_REGEXP.test(word)
  }

  static hasSymbol(key: string) {
    return Keyboard.symbol(key) ?? symbolicKeyToAnnotationMap.get(key)
  }

  static symbol(key: string) {
    return keyToSymbolMap.get(key)
  }

  static annotationOfSymbol(key: string) {
    return (
      keyToAnnotationMap.get(key) ?? symbolicKeyToAnnotationMap.get(key) ?? key
    )
  }

  static splitByKey(description: string) {
    return description
      .split(KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP)
      .filter(Boolean)
      .map((word) => keyDescriptionToKeyMap.get(word) ?? word)
  }

  constructor(private keyboardMap?: Map<string, string>) {}

  key({ code, key }: { code: string; key: string }) {
    return (
      undefinedCodeToKeyMap.get(code) ??
      this.keyboardLayoutMap().get(code) ??
      key
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
