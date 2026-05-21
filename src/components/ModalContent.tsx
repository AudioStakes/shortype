import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

type Props = {
  isShow?: boolean
  isEnterFromRight?: boolean
  children: ComponentChildren
}

export default function ModalContent({
  isShow = false,
  isEnterFromRight = false,
  children,
}: Props) {
  const [isEntered, setIsEntered] = useState(false)

  useEffect(() => {
    if (!isShow) {
      setIsEntered(false)
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setIsEntered(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [isShow])

  if (!isShow) {
    return null
  }

  const enterFromSide = isEnterFromRight ? 'translate-x-4' : '-translate-x-4'

  return (
    <div
      class={`transition-all duration-200 ease-in transform ${
        isEntered ? 'opacity-100 translate-x-0' : `opacity-0 ${enterFromSide}`
      }`}
    >
      {children}
    </div>
  )
}
