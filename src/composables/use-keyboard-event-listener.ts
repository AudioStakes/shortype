import { useEffect } from 'preact/hooks'

export default function useKeyboardEventListener(
  type: 'keyup' | 'keydown',
  listener: (e: KeyboardEvent) => void,
) {
  useEffect(() => {
    const preventedListener = (e: KeyboardEvent) => {
      preventEvent(e)

      if (e.repeat) return

      listener(e)
    }

    const options = { capture: true } as const

    window.addEventListener(type, preventedListener, options)
    return () => {
      window.removeEventListener(type, preventedListener, options)
    }
  }, [type, listener])
}

const preventEvent = (e: KeyboardEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}
