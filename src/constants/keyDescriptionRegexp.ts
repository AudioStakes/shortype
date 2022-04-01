// 最初にマッチした文字列が返されるため、文字数の降順で並べる
const keyDescriptionExcludingModifier = [
  '[Right|Left|Down|Up] arrow',
  'グレイヴアクセント記号（`）',
  'バックスラッシュ（\\\\）',
  'Forward Delete',
  'forward delete',
  'マイナス記号（\\-）',
  '[右|左|上|下]矢印',
  'スラッシュ（\\/）',
  'プラス記号（\\+）',
  '[D|d]elete',
  'Page Down',
  'ティルダ記号（~）',
  '[S|s]pace',
  '疑問符（\\?）',
  'ピリオド（.）',
  '[→|←]キー',
  'Page Up',
  'F1[0-2]',
  '[T|t]ab',
  '[E|e]sc',
  'カンマ（,）',
  'Return',
  'スペースバー',
  '\\+ キー',
  'enter',
  '- キー',
  'Home',
  'End',
  'fn',
  'Fn',
  '削除',
  'F[0-9]',
  '↑',
  '↓',
  '\\[|\\]',
  '[0-9A-Za-z,]',
]
export const KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP = new RegExp(
  keyDescriptionExcludingModifier.join('|')
)

export const ALT_DESCRIPTION_REGEXP = /Option|option/
export const CTRL_DESCRIPTION_REGEXP = /Control|Ctrl|control|ctrl/
export const META_DESCRIPTION_REGEXP = /⌘|Command|command/
export const SHIFT_DESCRIPTION_REGEXP = /Shift|shift/

export const MODIFIER_KEY_DESCRIPTION_REGEXP = new RegExp(
  ALT_DESCRIPTION_REGEXP.source +
    '|' +
    CTRL_DESCRIPTION_REGEXP.source +
    '|' +
    META_DESCRIPTION_REGEXP.source +
    '|' +
    SHIFT_DESCRIPTION_REGEXP.source,
  'g'
)

const KEY_DESCRIPTION_REGEXP = new RegExp(
  MODIFIER_KEY_DESCRIPTION_REGEXP.source +
    '|' +
    KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP.source
)

export const DENY_LIST_OF_KEY_DESCRIPTION_REGEXP = /Finder|URL|[0-9][つ|回]/g

export const KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP = new RegExp(
  '(' +
    DENY_LIST_OF_KEY_DESCRIPTION_REGEXP.source +
    '|' +
    KEY_DESCRIPTION_REGEXP.source +
    ')'
)
