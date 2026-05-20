import type { SVGAttributes } from 'preact'

type IconName =
  | 'arrow-left'
  | 'arrow-path'
  | 'brightness-down'
  | 'brightness-up'
  | 'check'
  | 'check-circle'
  | 'chevron-right'
  | 'information-circle'
  | 'player-eject'
  | 'power'
  | 'volume-down'
  | 'volume-up'
  | 'x-circle'
  | 'x-mark'

type Props = SVGAttributes<SVGSVGElement> & {
  name: IconName
}

export default function IconGlyph({ name, ...rest }: Props) {
  const common = {
    ...rest,
    role: 'img' as const,
    'aria-label': name,
  }

  switch (name) {
    case 'arrow-left':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M10 5 3 12l7 7" />
          <path d="M4 12h17" />
        </svg>
      )
    case 'arrow-path':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M4 12a8 8 0 0 1 13.66-5.66" />
          <path d="M16 4h3v3" />
          <path d="M20 12a8 8 0 0 1-13.66 5.66" />
          <path d="M8 20H5v-3" />
        </svg>
      )
    case 'brightness-down':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
          <path d="M8 16h8" />
        </svg>
      )
    case 'brightness-up':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
        </svg>
      )
    case 'check':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'check-circle':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path
            d="M9.2 12.7 11.2 14.7 15.3 9.9"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'information-circle':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'player-eject':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M6 14h12" />
          <path d="m7 11 5-5 5 5" />
        </svg>
      )
    case 'power':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M12 2v10" />
          <path d="M8.5 4.5a8 8 0 1 0 7 0" />
        </svg>
      )
    case 'volume-up':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M5 15h4l5 4V5l-5 4H5z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M18.5 6.5a7 7 0 0 1 0 11" />
        </svg>
      )
    case 'volume-down':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M5 15h4l5 4V5l-5 4H5z" />
          <path d="M16 10v4" />
        </svg>
      )
    case 'x-circle':
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path
            d="M9 9l6 6M15 9l-6 6"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
          />
        </svg>
      )
    case 'x-mark':
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        >
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      )
  }

  return null
}
