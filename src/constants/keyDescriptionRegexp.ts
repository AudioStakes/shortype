// 最初にマッチした文字列が返されるため、文字数の降順で並べる
const keyDescriptionExcludingModifier = [
  '[Right|Left|Down|Up] arrow',
  'スラッシュ \\(\\/\\)',
  'プラス記号 \\(\\+\\)',
  'Mission Control',
  'forward delete',
  'Forward Delete',
  'バックスラッシュ（\\\\）',
  'グレイヴアクセント記号（`）',
  'マイナス記号 \\(-\\)',
  'キーボードの明るさを下げる',
  'キーボードの明るさを上げる',
  '疑問符 \\(\\?\\)',
  '} \\(右中かっこ\\)',
  '{ \\(左中かっこ\\)',
  'セミコロン \\(;\\)',
  '縦棒 \\(\\|\\)',
  'マイナス記号（\\-）',
  'コロン \\(:\\)',
  '等号 \\(=\\)',
  'メディア取り出しキー',
  'プラス記号（\\+）',
  'スラッシュ（\\/）',
  '[S|s]pace',
  'ティルダ記号（~）',
  'page down',
  'Page Down',
  '疑問符（\\?）',
  'page up',
  'Page Up',
  'ピリオド（.）',
  'カンマ（,）',
  '音量を上げる',
  '音量を下げる',
  '輝度を上げる',
  '輝度を下げる',
  'スペースバー',
  '\\+ キー',
  'Return',
  'delete',
  'Delete',
  '電源ボタン',
  'enter',
  'Home',
  'home',
  '- キー',
  'End',
  'end',
  '[右|左|上|下]矢印',
  '[→|←]キー',
  'F1[0-2]',
  '[T|t]ab',
  '[E|e]sc',
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

const undetectableKeyDescriptions = [
  'Mission Control',
  'キーボードの明るさを下げる',
  'キーボードの明るさを上げる',
  'メディア取り出しキー',
  '音量を上げる',
  '音量を下げる',
  '輝度を上げる',
  '輝度を下げる',
  '電源ボタン',
]
export const UNDETECTABLE_KEY_DESCRIPTION_REGEXP = new RegExp(
  undetectableKeyDescriptions.join('|'),
  'g'
)

export const FUNCTION_KEY_DESCRIPTION_REGEXP = /Fn|fn/

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

export const DENY_LIST_OF_KEY_DESCRIPTION_REGEXP =
  /Mission Control|Finder|URL|[0-9][つ|回]/g

export const KEY_DESCRIPTION_INCLUDING_DENY_LIST_REGEXP = new RegExp(
  '(' +
    DENY_LIST_OF_KEY_DESCRIPTION_REGEXP.source +
    '|' +
    KEY_DESCRIPTION_REGEXP.source +
    ')'
)
