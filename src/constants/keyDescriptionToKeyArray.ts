const keyDescriptionToKeyArray = [
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
  ['delete', 'Backspace'], // Mac の場合は delete
  ['Delete', 'Backspace'], // Mac の場合は delete
  ['バックスラッシュ（\\）', '\\'], // 日本語キーボードの場合 option + ￥
  ['プラス記号（+）', 'Plus'], // 日本語キーボードの場合 command + ; （「+」は説明文中に key 以外の意味で頻出のため、区別がつくように「plus」とする）
  ['+ キー', 'Plus'], // 日本語キーボードの場合 command + ; （「+」は説明文中に key 以外の意味で頻出のため、区別がつくように「plus」とする）
  ['マイナス記号（-）', '-'],
  ['- キー', '-'],
  ['グレイヴアクセント記号（`）', '`'], // 日本語キーボードの場合 shift + @
  ['ティルダ記号（~）', '˜'], // 日本語キーボードの場合 shift + ^
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
  ['Fn', 'fn'],
  ['fn', 'fn'],
  ['Forward Delete', 'Delete'], // Mac の場合は Forward Delete
  ['forward delete', 'Delete'], // Mac の場合は Forward Delete
  ['Command', 'Meta'],
  ['command', 'Meta'],
  ['⌘', 'Meta'],
  ['Option', 'Alt'],
  ['option', 'Alt'],
  ['shift', 'Shift'],
  ['control', 'Control'],
] as const

export default keyDescriptionToKeyArray
