import type { ComponentChildren } from 'preact'

import IconGlyph from '@/components/IconGlyph'

type Props = {
  isShow: boolean
  onClose: () => void
  children: ComponentChildren
}

export default function Modal({ isShow, onClose, children }: Props) {
  if (!isShow) {
    return null
  }

  return (
    <div class="overlay-shell" data-testid="modal">
      <button
        type="button"
        class="overlay-backdrop"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div class="overlay-panel flex max-w-[45rem] flex-col rounded-lg border border-gray-300 bg-white p-5 shadow-2xl">
        <button
          type="button"
          class="ui-close-button self-end"
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
