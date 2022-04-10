import chrome from '@/constants/shortcuts/chrome.json'
import mac from '@/constants/shortcuts/mac.json'
import terminal from '@/constants/shortcuts/terminal.json'

export const toolToShortcutsMap = new Map([
  ['Google Chrome', chrome],
  ['Terminal (macOS)', terminal],
  ['macOS', mac],
])

export function loadShortcutsByTool(tool: string) {
  return toolToShortcutsMap.get(tool) ?? chrome
}

export function loadShortcutsByToolAndCategories(
  tool: string,
  categories: string[]
) {
  const shortcuts = toolToShortcutsMap.get(tool) ?? chrome
  return shortcuts.filter((shortcut) => categories.includes(shortcut.category))
}
