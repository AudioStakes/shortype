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
      class={`ui-button ${
        isDisabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className ?? ''}`}
      {...rest}
    >
      {icon}
      <span>{name}</span>
    </button>
  )
}
