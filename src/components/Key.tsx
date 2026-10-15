import KeyWithAnnotation from '@/components/KeyWithAnnotation'
import formatKeyName from '@/utils/format-key-name'
import Keyboard from '@/utils/keyboard'

type Props = {
  keyName: string
  class?: string
}

const getSizeClass = (keyName: string) => {
  if (keyName.length > 8) return 'text-sm'
  if (keyName.length > 6) return 'text-lg'
  if (keyName.length > 4) return 'text-2xl'

  return 'text-3xl'
}

export default function Key({ keyName, class: className }: Props) {
  if (Keyboard.hasSymbol(keyName) || Keyboard.hasIcon(keyName)) {
    return <KeyWithAnnotation keyName={keyName} class={className} />
  }

  return (
    <kbd
      class={`ui-keycap-frame h-20 w-20 ${getSizeClass(keyName)} ${
        className ?? ''
      }`}
      data-testid={keyName}
    >
      {formatKeyName(keyName)}
    </kbd>
  )
}
