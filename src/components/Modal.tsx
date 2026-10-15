import type { ComponentChildren } from 'preact'
import { useLayoutEffect, useRef } from 'preact/hooks'

import IconGlyph from '@/components/IconGlyph'

type Props = {
  isShow: boolean
  onClose: () => void
  children: ComponentChildren
  label?: string
  closeLabel?: string
  panelClass?: string
  showCloseButton?: boolean
}

export default function Modal({
  isShow,
  onClose,
  children,
  label = 'ツールとカテゴリーの選択',
  closeLabel = 'Close modal',
  panelClass = 'flex max-w-[45rem] flex-col rounded-lg border border-gray-300 bg-white p-5 shadow-2xl',
  showCloseButton = true,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!isShow || !dialog) return

    const previousFocus = document.activeElement
    dialog.showModal()
    dialog
      .querySelector<HTMLButtonElement>('button:not([tabindex="-1"])')
      ?.focus()

    return () => {
      dialog.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [isShow])

  if (!isShow) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      class="overlay-shell m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent text-slate-700"
      aria-label={label}
      data-testid="modal"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <button
        type="button"
        class="overlay-backdrop"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
      />
      <div class={`overlay-panel ${panelClass}`}>
        {showCloseButton ? (
          <button
            type="button"
            class="ui-close-button self-end"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <IconGlyph name="x-mark" class="h-6 text-gray-400" />
          </button>
        ) : null}
        {children}
      </div>
    </dialog>
  )
}
