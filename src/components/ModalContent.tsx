import type { ComponentChildren } from 'preact'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'

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
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (isShow && content?.closest('dialog')?.open) {
      content.querySelector<HTMLButtonElement>('button:enabled')?.focus()
    }
  }, [isShow])

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
      ref={contentRef}
      class={`transform transition-[opacity,transform] duration-200 ease-in ${
        isEntered ? 'opacity-100 translate-x-0' : `opacity-0 ${enterFromSide}`
      }`}
    >
      {children}
    </div>
  )
}
