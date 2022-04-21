import KeyCombination from '@/models/key-combination'

export default class KeyCombinations {
  constructor(private readonly keyCombinations: KeyCombination[]) {}

  hasOnlyModifierKeys() {
    return this.keyCombinations.some((keyCombination) =>
      keyCombination.isOnlyModifierKeys()
    )
  }

  hasOnlyEnterKey() {
    return this.keyCombinations.some((keyCombination) =>
      keyCombination.isOnlyEnterKey()
    )
  }

  hasOnlyAvailableInFullscreen() {
    return this.keyCombinations.some((keyCombination) =>
      keyCombination.isOnlyAvailableInFullscreen()
    )
  }

  has(otherKeyCombination: KeyCombination) {
    return this.keyCombinations.some((keyCombination) =>
      keyCombination.is(otherKeyCombination)
    )
  }
}
