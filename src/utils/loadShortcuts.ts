import { Shortcut } from '@/types/interfaces'

export function loadShortcutsByToolAndCategories(
  tool: string,
  categories: string[]
) {
  const shortcuts = loadShortcutsByTool(tool)
  return shortcuts.filter((shortcut) => categories.includes(shortcut.category))
}

import chrome from '@/constants/shortcuts/chrome.json'
import terminal from '@/constants/shortcuts/terminal.json'
export function loadShortcutsByTool(tool: string) {
  let json

  switch (tool) {
    case 'Google Chrome':
      json = chrome as Shortcut[]
      break

    case 'Terminal (macOS)':
      json = terminal as Shortcut[]
      break

    default:
      json = chrome as Shortcut[]
      break
  }

  return json
}

export function loadAllTools() {
  return [
    {
      name: 'Google Chrome',
      shortcuts: chrome as Shortcut[],
    },
    {
      name: 'Terminal (macOS)',
      shortcuts: terminal as Shortcut[],
    },
  ]
}
