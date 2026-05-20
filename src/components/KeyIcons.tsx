import KeyboardBackLightDownImg from '@/assets/key-icons/keyboard-backlight-down.png'
import KeyboardBackLightUpImg from '@/assets/key-icons/keyboard-backlight-up.png'
import MissionControlImg from '@/assets/key-icons/mission-control.png'
import IconGlyph from '@/components/IconGlyph'

type Props = {
  iconName: string
  class?: string
}

export default function KeyIcons({ iconName, class: className }: Props) {
  if (iconName === 'BrightnessDown')
    return <IconGlyph name="brightness-down" class={className} />
  if (iconName === 'BrightnessUp')
    return <IconGlyph name="brightness-up" class={className} />
  if (iconName === 'PlayerEject')
    return <IconGlyph name="player-eject" class={className} />
  if (iconName === 'Power') return <IconGlyph name="power" class={className} />
  if (iconName === 'VolumeUp')
    return <IconGlyph name="volume-up" class={className} />
  if (iconName === 'VolumeDown')
    return <IconGlyph name="volume-down" class={className} />
  if (iconName === 'KeyboardBacklightUp') {
    return (
      <img
        class={`h-10 w-10 ${className ?? ''}`}
        src={KeyboardBackLightUpImg}
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (iconName === 'KeyboardBacklightDown') {
    return (
      <img
        class={`h-10 w-10 ${className ?? ''}`}
        src={KeyboardBackLightDownImg}
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (iconName === 'MissionControl') {
    return (
      <img
        class={`h-10 w-10 ${className ?? ''}`}
        src={MissionControlImg}
        alt=""
        aria-hidden="true"
      />
    )
  }

  return null
}
