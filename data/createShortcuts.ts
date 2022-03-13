import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

import KeyCombination from '../src/models/keyCombination'
import { Shortcut } from '../src/types/interfaces'

const KEY_REGEXP =
  /([0-9A-Za-z,+-]|[S|s]pace|[D|d]elete|[E|e]sc|[T|t]ab|F[0-9]|[Right|Left|Down|Up] arrow|[右|左|上|下]矢印|バックスラッシュ（\\）|プラス記号（\+）|マイナス記号（\-）|グレイヴアクセント記号（`）|ティルダ記号（~）|Page Down|Page Up|[→|←]キー|削除|スペースバー|Return|カンマ（,）|ピリオド（.）|↓|↑|疑問符（\?）|スラッシュ（\/）)$/
const ALT_REGEXP = /Option|option/
const CTRL_REGEXP = /Control|Ctrl|control|ctrl/
const META_REGEXP = /⌘|Command|command/
const SHIFT_REGEXP = /Shift|shift/

const HAS_MODIFIED_KEY_REGEXP = /\\|\+|`|~|\?/
const HAS_MULTIPLE_ANSWERS_REGEXP = /または|もしくは|同等/
const HAS_RANGED_ANSWERS_REGEXP = /～/
const HAS_MOUSE_ACTIONS_REGEXP = /ドラッグ|クリック/
const HAS_OTHER_ACTIONS_REGEXP = /入力|選択|ながら/

const convertToKeyArray = [
  ['Right arrow', 'ArrowRight'],
  ['Left arrow', 'ArrowLeft'],
  ['Up arrow', 'ArrowUp'],
  ['Down arrow', 'ArrowDown'],
  ['右矢印', 'ArrowRight'],
  ['左矢印', 'ArrowLeft'],
  ['上矢印', 'ArrowUp'],
  ['下矢印', 'ArrowDown'],
  ['Esc', 'Escape'],
  ['enter', 'Enter'],
  ['space', 'Space'],
  ['esc', 'Escape'],
  ['tab', 'Tab'],
  ['delete', 'Delete'],
  ['バックスラッシュ（\\）', '\\'], // 日本語キーボードの場合 option + ￥
  ['プラス記号（+）', '+'], // 日本語キーボードの場合 command + ;
  ['マイナス記号（-）', '-'],
  ['グレイヴアクセント記号（`）', '`'], // 日本語キーボードの場合 shift + @
  ['ティルダ記号（~）', '~'], // 日本語キーボードの場合 shift + ^
  ['Page Down', 'PageDown'],
  ['Page Up', 'PageUp'],
  ['→キー', 'ArrowRight'],
  ['←キー', 'ArrowLeft'],
  ['削除', 'Backspace'],
  ['スペースバー', 'Space'],
  ['Return', 'Enter'],
  ['カンマ（,）', ','],
  ['ピリオド（.）', '.'],
  ['↑', 'PageUp'],
  ['↓', 'PageDown'],
  ['疑問符（?）', '?'], // 日本語キーボードの場合 shift + /
  ['スラッシュ（/）', '/'],
] as const

const unavailableKeyCombinations = [
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'n',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'q',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 't',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'w',
  },
  {
    altKey: true,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'ArrowLeft',
  },
  {
    altKey: true,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'ArrowRight',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 'n',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 't',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 'w',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'F2',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'F5',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'Tab',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: true,
    key: 'Tab',
  },
]

const convertToKeyMap = new Map<string, string>(convertToKeyArray)

export default async function createShortcuts(csvPath: string) {
  const csvRawData = fs.readFileSync(csvPath)
  const filename = path.basename(csvPath, '.csv')
  const records = parse(csvRawData, { columns: true })

  const shortcuts = []
  for (const record of records) {
    const shortcut = createShortcut(record)

    shortcuts.push(shortcut)
  }

  const json = JSON.stringify(shortcuts)
  fs.writeFileSync(
    `${__dirname}/../src/constants/shortcuts/${filename}.json`,
    json,
    'utf8'
  )
}

interface ShortcutFromCsv {
  id: string

  app: string
  os: string
  category: string
  action: string
  shortcut: string
}

export const createShortcut = (shortcutRaw: ShortcutFromCsv) => {
  const shortcut: Shortcut = {
    id: shortcutRaw.id,
    app: shortcutRaw.app,
    os: shortcutRaw.os,
    category: shortcutRaw.category,
    action: shortcutRaw.action,
    shortcut: shortcutRaw.shortcut,
    altKey: ALT_REGEXP.test(shortcutRaw.shortcut),
    ctrlKey: CTRL_REGEXP.test(shortcutRaw.shortcut),
    metaKey: META_REGEXP.test(shortcutRaw.shortcut),
    shiftKey: SHIFT_REGEXP.test(shortcutRaw.shortcut),
    key: null,
    isAvailable: true,
  }

  const matchKey = shortcutRaw.shortcut.match(KEY_REGEXP)
  if (matchKey) {
    let matchedKey = matchKey[0] as string
    matchedKey = convertToKeyMap.get(matchedKey) ?? matchedKey
    matchedKey = matchedKey.length === 1 ? matchedKey.toLowerCase() : matchedKey
    shortcut.key = matchedKey
  } else {
    shortcut.key = null
  }

  const keyCombination = new KeyCombination(shortcut)

  if (!shortcut.key) {
    shortcut.isAvailable = false
  } else if (HAS_MODIFIED_KEY_REGEXP.test(shortcut.key)) {
    shortcut.isAvailable = false
  } else if (HAS_MULTIPLE_ANSWERS_REGEXP.test(shortcut.shortcut)) {
    shortcut.isAvailable = false
  } else if (HAS_RANGED_ANSWERS_REGEXP.test(shortcut.shortcut)) {
    shortcut.isAvailable = false
  } else if (HAS_MOUSE_ACTIONS_REGEXP.test(shortcut.shortcut)) {
    shortcut.isAvailable = false
  } else if (HAS_OTHER_ACTIONS_REGEXP.test(shortcut.shortcut)) {
    shortcut.isAvailable = false
  } else if (
    unavailableKeyCombinations.some((unavailableKeyCombination) => {
      return keyCombination.is(unavailableKeyCombination)
    })
  ) {
    shortcut.isAvailable = false
  } else {
    shortcut.isAvailable = true
  }

  return shortcut
}
