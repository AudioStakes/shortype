import { onBeforeUnmount } from 'vue'

export default function useKeyboardEventListener(
  type: 'keyup' | 'keydown',
  listener: (e: KeyboardEvent) => void
) {
  const preventedListener = (e: KeyboardEvent) => {
    preventEvent(e)

    if (e.repeat) return

    listener(e)
  }

  window.addEventListener(type, preventedListener, { capture: true })

  onBeforeUnmount(() => {
    window.removeEventListener(type, preventedListener)
  })
}

const preventEvent = (e: KeyboardEvent) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}
