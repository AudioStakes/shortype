const keyDescriptionExcludingModifier = [
  'forward delete',
  'Forward Delete',
  'enter',
  '[S|s]pace',
  '[D|d]elete',
  '[E|e]sc',
  '[T|t]ab',
  'F1[0-2]',
  'F[0-9]',
  '[Right|Left|Down|Up] arrow',
  '[右|左|上|下]矢印',
  'バックスラッシュ（\\\\）',
  'プラス記号（\\+）',
  'マイナス記号（\\-）',
  '\\+ キー',
  '- キー',
  'グレイヴアクセント記号（`）',
  'ティルダ記号（~）',
  'Page Down',
  'Page Up',
  '[→|←]キー',
  '削除',
  'スペースバー',
  'Return',
  'カンマ（,）',
  'ピリオド（.）',
  '↓',
  '↑',
  '疑問符（\\?）',
  'スラッシュ（\\/）',
  'Fn',
  'fn',
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

const DENY_LIST_OF_KEY_DESCRIPTION_REGEXP = /Finder|URL|[0-9][つ|回]/g

export const KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP = new RegExp(
  '(' +
    DENY_LIST_OF_KEY_DESCRIPTION_REGEXP.source +
    '|' +
    KEY_DESCRIPTION_REGEXP.source +
    ')'
)
