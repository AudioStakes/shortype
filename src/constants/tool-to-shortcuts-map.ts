import chrome from '@/constants/shortcuts/chrome.json'
import mac from '@/constants/shortcuts/mac.json'
import terminal from '@/constants/shortcuts/terminal.json'
import { Shortcut } from '@/types/interfaces'

const TOOL_TO_SHORTCUTS_MAP: ReadonlyMap<string, Shortcut[]> = new Map([
  ['Google Chrome', chrome],
  ['Terminal (macOS)', terminal],
  ['macOS', mac],
] as const)

export default TOOL_TO_SHORTCUTS_MAP
