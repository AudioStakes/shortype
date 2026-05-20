import { useEffect } from 'preact/hooks'

export default function useEventListener(
  type: string,
  listener: (e: Event) => void,
  options?: AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener(type, listener, options)
    return () => {
      window.removeEventListener(type, listener)
    }
  }, [type, listener, options])
}
