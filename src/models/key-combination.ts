import { KEY_COMBINATIONS_ONLY_AVAILABLE_IN_FULL_SCREEN_MODE } from '@/constants/key-combinations'
import type { KeyCombinable } from '@/types/interfaces'

const MODIFIER_KEY_SET = new Set(['Alt', 'Shift', 'Meta', 'Control'])
const NON_KEY_SET = new Set([
  'Alt',
  'Shift',
  'Meta',
  'Control',
  undefined,
  null,
])

const signatureOf = (keyCombinable: KeyCombinable) =>
  `${keyCombinable.altKey}-${keyCombinable.ctrlKey}-${keyCombinable.metaKey}-${keyCombinable.shiftKey}-${keyCombinable.key ?? ''}`

const FULL_SCREEN_ONLY_SIGNATURE_SET = new Set(
  KEY_COMBINATIONS_ONLY_AVAILABLE_IN_FULL_SCREEN_MODE.map((keyCombination) =>
    signatureOf(keyCombination),
  ),
)

export default class KeyCombination {
  static defaultValue = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: null,
  }

  static isDefaultValue(keyCombinable: KeyCombinable) {
    return new KeyCombination(keyCombinable).is(KeyCombination.defaultValue)
  }

  static isOnlyEnterKey(keyCombinable: KeyCombinable) {
    const onlyEnterKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'Enter',
    }
    return new KeyCombination(keyCombinable).is(onlyEnterKey)
  }

  static isOnlyModifierKeys(keyCombinable: KeyCombinable) {
    return (
      (KeyCombination.isModifierKey(keyCombinable) ||
        keyCombinable.key === null ||
        keyCombinable === undefined) &&
      KeyCombination.isModified(keyCombinable)
    )
  }

  static isModifierKey(keyCombinable: KeyCombinable) {
    return (
      keyCombinable.key !== undefined &&
      keyCombinable.key !== null &&
      MODIFIER_KEY_SET.has(keyCombinable.key)
    )
  }

  static isModified(keyCombinable: KeyCombinable) {
    const { altKey, ctrlKey, metaKey, shiftKey } = keyCombinable
    return altKey || ctrlKey || metaKey || shiftKey
  }

  static isOnlyAvailableInFullscreen(keyCombinable: KeyCombinable) {
    return FULL_SCREEN_ONLY_SIGNATURE_SET.has(signatureOf(keyCombinable))
  }

  static extractKeys(keyCombinable: KeyCombinable) {
    const keys = []

    if (keyCombinable.metaKey) keys.push('Meta')
    if (keyCombinable.altKey) keys.push('Alt')
    if (keyCombinable.shiftKey) keys.push('Shift')
    if (keyCombinable.ctrlKey) keys.push('Control')
    if (!NON_KEY_SET.has(keyCombinable.key))
      keys.push(keyCombinable.key as string)

    return keys
  }

  constructor(
    private keyCombinable: KeyCombinable = KeyCombination.defaultValue,
  ) {}

  keyDown(keyCombinable: KeyCombinable) {
    this.keyCombinable = keyCombinable
  }

  keyUp(key: string) {
    if (key === 'Meta') this.keyCombinable.metaKey = false
    if (key === 'Alt') this.keyCombinable.altKey = false
    if (key === 'Shift') this.keyCombinable.shiftKey = false
    if (key === 'Control') this.keyCombinable.ctrlKey = false
    if (key === this.keyCombinable.key) this.keyCombinable.key = undefined
  }

  reset() {
    this.keyCombinable = KeyCombination.defaultValue
  }

  keys() {
    return KeyCombination.extractKeys(this.keyCombinable)
  }

  isOnlyEnterKey() {
    return KeyCombination.isOnlyEnterKey(this.keyCombinable)
  }

  isOnlyModifierKeys() {
    return KeyCombination.isOnlyModifierKeys(this.keyCombinable)
  }

  isOnlyAvailableInFullscreen() {
    return KeyCombination.isOnlyAvailableInFullscreen(this.keyCombinable)
  }

  isRemoveKey() {
    const keyCombinationOfRemove = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'r',
    }
    return this.is(keyCombinationOfRemove)
  }

  isSelectToolsKey() {
    const keyCombinationOfSelectTools = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 't',
    }
    return this.is(keyCombinationOfSelectTools)
  }

  isShowCorrectKey() {
    const keyCombinationOfShowCorrectKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'c',
    }
    return this.is(keyCombinationOfShowCorrectKey)
  }

  isMarkedSelfAsCorrectKey() {
    const keyCombinationOfMarkingSelfAsCorrectKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'y',
    }
    return this.is(keyCombinationOfMarkingSelfAsCorrectKey)
  }

  isMarkedSelfAsWrongKey() {
    const keyCombinationOfMarkingSelfAsWrongKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'n',
    }
    return this.is(keyCombinationOfMarkingSelfAsWrongKey)
  }

  isToggleFullscreenKey() {
    const keyCombinationOfToggleFullscreenKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'f',
    }
    return this.is(keyCombinationOfToggleFullscreenKey)
  }

  isModifierKey() {
    return KeyCombination.isModifierKey(this.keyCombinable)
  }

  hasPressedSomeKey() {
    return !this.is(KeyCombination.defaultValue)
  }

  is(other: KeyCombinable | KeyCombination) {
    if (other instanceof KeyCombination) {
      other = other.keyCombinable
    }

    if (this.isOnlyModifierKeys()) {
      return this.hasEqualModifiers(other)
    } else {
      return (
        this.keyCombinable.altKey === other.altKey &&
        this.keyCombinable.ctrlKey === other.ctrlKey &&
        this.keyCombinable.metaKey === other.metaKey &&
        this.keyCombinable.shiftKey === other.shiftKey &&
        this.keyCombinable.key === other.key
      )
    }
  }

  hasEqualModifiers(other: KeyCombinable | KeyCombination) {
    if (other instanceof KeyCombination) {
      other = other.keyCombinable
    }

    return (
      this.keyCombinable.altKey === other.altKey &&
      this.keyCombinable.ctrlKey === other.ctrlKey &&
      this.keyCombinable.metaKey === other.metaKey &&
      this.keyCombinable.shiftKey === other.shiftKey
    )
  }
}
