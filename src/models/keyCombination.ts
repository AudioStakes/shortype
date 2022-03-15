import { KeyCombinable } from '../types/interfaces'

export default class KeyCombination {
  static defaultValue = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: undefined,
  }

  static extractKeys(keyCombinable: KeyCombinable) {
    const keys = []

    if (keyCombinable.metaKey) keys.push('Meta')
    if (keyCombinable.altKey) keys.push('Alt')
    if (keyCombinable.shiftKey) keys.push('Shift')
    if (keyCombinable.ctrlKey) keys.push('Control')
    if (
      !['Alt', 'Shift', 'Meta', 'Control', undefined].includes(
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
    const onlyEnterKey = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'Enter',
    }
    return this.is(onlyEnterKey)
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

  isModifierKey() {
    return (
      this.keyCombinable.key !== undefined &&
      ['Alt', 'Shift', 'Meta', 'Control'].includes(this.keyCombinable.key)
    )
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
}
