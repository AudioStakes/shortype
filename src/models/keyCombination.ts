import { KeyCombinable } from '../types/interfaces'

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
      ['Alt', 'Shift', 'Meta', 'Control'].includes(keyCombinable.key)
    )
  }

  static isModified(keyCombinable: KeyCombinable) {
    const { altKey, ctrlKey, metaKey, shiftKey } = keyCombinable
    return altKey || ctrlKey || metaKey || shiftKey
  }

  static extractKeys(keyCombinable: KeyCombinable) {
    const keys = []

    if (keyCombinable.metaKey) keys.push('Meta')
    if (keyCombinable.altKey) keys.push('Alt')
    if (keyCombinable.shiftKey) keys.push('Shift')
    if (keyCombinable.ctrlKey) keys.push('Control')
    if (
      !['Alt', 'Shift', 'Meta', 'Control', undefined, null].includes(
        keyCombinable.key
      )
    )
      keys.push(keyCombinable.key as string)

    return keys
  }

  constructor(
    private keyCombinable: KeyCombinable = KeyCombination.defaultValue
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

  isModifierKey() {
    return KeyCombination.isModifierKey(this.keyCombinable)
  }

  hasPressedSomeKey() {
    return !this.is(KeyCombination.defaultValue)
  }

  is(other: KeyCombinable) {
    return (
      this.keyCombinable.altKey === other.altKey &&
      this.keyCombinable.ctrlKey === other.ctrlKey &&
      this.keyCombinable.metaKey === other.metaKey &&
      this.keyCombinable.shiftKey === other.shiftKey &&
      this.keyCombinable.key === other.key
    )
  }

  hasEqualModifiers(other: KeyCombinable) {
    return (
      this.keyCombinable.altKey === other.altKey &&
      this.keyCombinable.ctrlKey === other.ctrlKey &&
      this.keyCombinable.metaKey === other.metaKey &&
      this.keyCombinable.shiftKey === other.shiftKey
    )
  }
}
