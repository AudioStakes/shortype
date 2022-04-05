import { Shortcut } from '@/types/interfaces'

export function sampleShortcut(shortcuts: Shortcut[], removedIds: string[]) {
  const targetShortcuts = shortcuts.filter(
    (shortcut) => !removedIds.includes(shortcut.id)
  )

  if (import.meta.env.MODE === 'test') {
    // 出題順に依存しているテストがあるため
    return targetShortcuts[0]
  } else {
    return sample(targetShortcuts) as Shortcut
  }
}

const sample = (array: string[] | Shortcut[]) => {
  return array[Math.floor(Math.random() * array.length)]
}
