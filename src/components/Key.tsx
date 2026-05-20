import KeyWithAnnotation from '@/components/KeyWithAnnotation'
import formatKeyName from '@/utils/format-key-name'
import Keyboard from '@/utils/keyboard'

type Props = {
  keyName: string
  class?: string
}

export default function Key({ keyName, class: className }: Props) {
  if (Keyboard.hasSymbol(keyName) || Keyboard.hasIcon(keyName)) {
    return <KeyWithAnnotation keyName={keyName} class={className} />
  }

  return (
    <kbd
      class={`flex h-20 w-20 flex-col items-center justify-center bg-white rounded-lg border-[1px] border-gray-300 shadow-3d text-center text-3xl leading-none ${
        className ?? ''
      }`}
      data-testid={keyName}
    >
      {formatKeyName(keyName)}
    </kbd>
  )
}
