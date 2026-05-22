import { useMemo } from 'preact/hooks'

import KeyIcons from '@/components/KeyIcons'
import formatKeyName from '@/utils/format-key-name'
import Keyboard from '@/utils/keyboard'

type Props = {
  keyName: string
  class?: string
}

export default function KeyWithAnnotation({
  keyName,
  class: className,
}: Props) {
  const annotation = useMemo(
    () =>
      Keyboard.annotationOfIcon(keyName) ||
      Keyboard.annotationOfSymbol(keyName) ||
      keyName,
    [keyName],
  )
  const formattedAnnotation = useMemo(
    () => formatKeyName(annotation),
    [annotation],
  )
  const maxLength = useMemo(
    () =>
      Math.max(...formattedAnnotation.split('\n').map((word) => word.length)),
    [formattedAnnotation],
  )
  const lineLength = useMemo(
    () => formattedAnnotation.split('\n').length,
    [formattedAnnotation],
  )

  return (
    <kbd
      class={`ui-keycap-frame h-20 w-20 gap-1 text-3xl ${
        maxLength > 9 ? 'w-[6rem]' : ''
      } ${lineLength > 2 ? 'w-[6.5rem] h-[6rem]' : ''} ${className ?? ''}`}
      data-testid={keyName}
    >
      <span
        class={`text-base leading-none whitespace-pre-line ${
          8 < maxLength ? 'text-[0.85rem]' : ''
        }`}
      >
        {formattedAnnotation}
      </span>
      {Keyboard.hasSymbol(keyName) ? (
        <span>{Keyboard.symbol(keyName) ?? keyName}</span>
      ) : (
        <KeyIcons class="mx-auto" iconName={annotation} />
      )}
    </kbd>
  )
}
