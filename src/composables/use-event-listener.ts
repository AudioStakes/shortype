import { onBeforeUnmount } from 'vue'

export default function useEventListener(
  type: string,
  listener: (e: Event) => void,
  options?: object
) {
  window.addEventListener(type, listener, options)

  onBeforeUnmount(() => {
    window.removeEventListener(type, listener)
  })
}
