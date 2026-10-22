import type { NavigatorExtend } from '@/types/interfaces'

const unlockKeyboard = () => {
  try {
    const keyboard = (navigator as NavigatorExtend).keyboard
    keyboard?.unlock?.()
  } catch {
    // A failed optional cleanup must not interrupt training.
  }
}

let currentOwner: symbol | undefined

export const createKeyboardLock = (onChange: (acquired: boolean) => void) => {
  const owner = Symbol()
  let generation = 0
  let pending = false
  let acquired = false

  return {
    request: () => {
      const requestGeneration = ++generation
      currentOwner = owner
      pending = true
      acquired = false
      const finishRequest = (success: boolean) => {
        if (requestGeneration !== generation || currentOwner !== owner) {
          if (success && currentOwner === undefined) {
            unlockKeyboard()
          }
          return
        }
        pending = false
        acquired = success
        onChange(success)
      }
      try {
        const keyboard = (navigator as NavigatorExtend).keyboard
        if (typeof keyboard?.lock !== 'function') {
          finishRequest(false)
          return
        }
        void keyboard.lock().then(
          () => finishRequest(true),
          () => finishRequest(false),
        )
      } catch {
        finishRequest(false)
      }
    },
    release: () => {
      generation += 1
      if (currentOwner === owner) {
        currentOwner = undefined
        if (pending || acquired) {
          unlockKeyboard()
        }
      }
      pending = false
      acquired = false
    },
  }
}
