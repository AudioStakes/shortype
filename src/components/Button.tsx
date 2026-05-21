import type { ButtonHTMLAttributes, ComponentChildren } from 'preact'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string
  isDisabled?: boolean
  icon?: ComponentChildren
}

export default function Button({
  name,
  isDisabled = false,
  icon,
  class: className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={isDisabled}
      class={`flex items-center space-x-2 border rounded-full p-2 hover:bg-gray-200 text-gray-700 transition duration-200 hover:ease-out ${
        isDisabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className ?? ''}`}
      {...rest}
    >
      {icon}
      <span>{name}</span>
    </button>
  )
}
