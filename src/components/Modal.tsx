import type { ComponentChildren } from 'preact'

import IconGlyph from '@/components/IconGlyph'

type Props = {
  isShow: boolean
  onClose: () => void
  children: ComponentChildren
}

export default function Modal({ isShow, onClose, children }: Props) {
  if (!isShow) {
    return <div data-testid="modal" />
  }

  return (
    <div data-testid="modal">
      <button
        type="button"
        class="z-10 absolute w-screen h-screen bg-black opacity-30 top-0"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div class="z-10 p-5 w-4/5 max-w-[45rem] min-h-fit max-h-fit flex flex-col bg-white border border-gray-300 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute">
        <button
          type="button"
          class="self-end rounded-lg transition duration-200 hover:ease-out hover:bg-gray-200 hover:text-gray-900"
          aria-label="Close modal"
          onClick={onClose}
        >
          <IconGlyph name="x-mark" class="h-6 text-gray-400" />
        </button>
        {children}
      </div>
    </div>
  )
}
