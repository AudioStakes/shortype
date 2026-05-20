import type { ComponentChildren } from 'preact'

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
  if (!isShow) {
    return null
  }

  return (
    <div
      class={
        isEnterFromRight
          ? 'duration-200 ease-in transform opacity-0 -translate-x-6'
          : 'duration-200 ease-in transform opacity-0 translate-x-6'
      }
    >
      {children}
    </div>
  )
}
