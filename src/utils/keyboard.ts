import DEFAULT_KEYBOARD_LAYOUT_MAP from '@/constants/default-keyboard-layout-map'
import KEY_DESCRIPTION_TO_KEY_MAP from '@/constants/key-description-to-key-map'
import KEY_TO_ANNOTATION_MAP from '@/constants/key-to-annotation-map'
import KEY_TO_ICON_ANNOTATION_MAP from '@/constants/key-to-icon-annotation-map'
import KEY_TO_SYMBOL_MAP from '@/constants/key-to-symbol-map'
import { KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP } from '@/constants/keyDescriptionRegexp'
import KEY_REGEXP, {
  DENY_LIST_OF_KEY_REGEXP,
  UNDETECTABLE_KEY_REGEXP,
} from '@/constants/keyRegexp'
import SYMBOLIC_KEY_TO_ANNOTATION_MAP from '@/constants/symbolic-key-to-annotation-map'
import UNDEFINED_CODE_TO_KEY_MAP from '@/constants/undefined-code-to-key-map'
import { NavigatorKeyboard } from '@/types/interfaces'

export default class Keyboard {
  static isKey(word: string) {
    return !DENY_LIST_OF_KEY_REGEXP.test(word) && KEY_REGEXP.test(word)
  }

  static isUndetectableKey(word: string) {
    return UNDETECTABLE_KEY_REGEXP.test(word)
  }

  static hasSymbol(key: string) {
    return KEY_TO_SYMBOL_MAP.has(key) || SYMBOLIC_KEY_TO_ANNOTATION_MAP.has(key)
  }

  static hasIcon(key: string) {
    return KEY_TO_ICON_ANNOTATION_MAP.has(key)
  }

  static annotationOfIcon(key: string) {
    return KEY_TO_ICON_ANNOTATION_MAP.get(key)
  }

  static symbol(key: string) {
    return KEY_TO_SYMBOL_MAP.get(key)
  }

  static annotationOfSymbol(key: string) {
    return (
      KEY_TO_ANNOTATION_MAP.get(key) ?? SYMBOLIC_KEY_TO_ANNOTATION_MAP.get(key)
    )
  }

  static splitByKeyDescription(description: string) {
    return description
      .split(KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP)
      .filter(Boolean)
  }

  static keyOfKeyDescription(keyDescription: string) {
    return KEY_DESCRIPTION_TO_KEY_MAP.get(keyDescription)
  }

  constructor(private keyboardMap?: Map<string, string>) {}

  key({ code, key }: { code: string; key: string }) {
    return (
      UNDEFINED_CODE_TO_KEY_MAP.get(code) ??
      this.keyboardLayoutMap().get(code) ??
      key
    )
  }

  keyboardLayoutMap() {
    return this.keyboardMap ?? DEFAULT_KEYBOARD_LAYOUT_MAP
  }

  async setKeyboardLayoutMap(keyboard: NavigatorKeyboard) {
    const keyboardMap = await keyboard.getLayoutMap()
    this.keyboardMap = keyboardMap
  }
}
