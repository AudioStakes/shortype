import { useLayoutEffect } from 'preact/hooks'

export default function useKeyboardEventListener(
  type: 'keyup' | 'keydown',
  listener: (e: KeyboardEvent) => void,
  enabled = true,
) {
  useLayoutEffect(() => {
    if (!enabled) {
      return
    }

    const preventedListener = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('dialog[open]')) {
        return
      }

      if (type === 'keyup') {
        listener(e)
        return
      }

      if (e.target instanceof Element) {
        if (
          e.target.closest('input, textarea, select, [contenteditable="true"]')
        ) {
          return
        }
        if (
          ['Enter', ' ', 'Spacebar', 'Escape'].includes(e.key) &&
          e.target.closest('button, a[href], summary, [role="button"]')
        ) {
          return
        }
      }

      if (e.key !== 'Tab') {
        preventEvent(e)
      }

      if (e.repeat) {
        return
      }

      listener(e)
    }

    const options = { capture: true } as const

    window.addEventListener(type, preventedListener, options)
    return () => {
      window.removeEventListener(type, preventedListener, options)
    }
  }, [type, listener, enabled])
}

const preventEvent = (e: KeyboardEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}
