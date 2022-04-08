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
  ['プラス記号（+）', 'Plus'], // 日本語キーボードの場合 shift + ; （「+」は説明文中に key 以外の意味で頻出のため、区別がつくように「plus」とする）
  ['プラス記号 (+)', 'Plus'], // 日本語キーボードの場合 shift + ; （「+」は説明文中に key 以外の意味で頻出のため、区別がつくように「plus」とする）
  ['+ キー', 'Plus'], // 日本語キーボードの場合 shift + ; （「+」は説明文中に key 以外の意味で頻出のため、区別がつくように「plus」とする）
  ['マイナス記号（-）', '-'],
  ['マイナス記号 (-)', '-'],
  ['- キー', '-'],
  ['グレイヴアクセント記号（`）', '`'], // 日本語キーボードの場合 shift + @
  ['ティルダ記号（~）', '˜'], // 日本語キーボードの場合 shift + ^
  ['疑問符（?）', '?'], // 日本語キーボードの場合 shift + /
  ['疑問符 (?)', '?'], // 日本語キーボードの場合 shift + /
  ['スラッシュ（/）', '/'],
  ['スラッシュ (/)', '/'],
  ['コロン (:)', ':'],
  ['セミコロン (;)', ';'],
  ['{ (左中かっこ)', '{'], // 日本語キーボードの場合 shift + [
  ['} (右中かっこ)', '}'], // 日本語キーボードの場合 shift + ]
  ['縦棒 (|)', '|'], // 日本語キーボードの場合 shift + ￥
  ['等号 (=)', '='], // 日本語キーボードの場合 shift + -
  ['Page Up', 'PageUp'],
  ['page up', 'PageUp'],
  ['Page Down', 'PageDown'],
  ['page down', 'PageDown'],
  ['home', 'Home'],
  ['end', 'End'],
  ['→キー', 'ArrowRight'],
  ['←キー', 'ArrowLeft'],
  ['削除', 'Backspace'],
  ['スペースバー', 'Space'],
  ['Return', 'Enter'],
  ['カンマ（,）', ','],
  ['ピリオド（.）', '.'],
  ['↑', 'PageUp'],
  ['↓', 'PageDown'],
  ['fn', 'Fn'], // KeyboardEvent が発火しない。
  ['Forward Delete', 'Delete'], // Mac の場合は Forward Delete
  ['forward delete', 'Delete'], // Mac の場合は Forward Delete
  ['Command', 'Meta'],
  ['command', 'Meta'],
  ['⌘', 'Meta'],
  ['Option', 'Alt'],
  ['option', 'Alt'],
  ['shift', 'Shift'],
  ['control', 'Control'],
  ['電源ボタン', 'Power'], // KeyboardEvent が発火しない
  ['メディア取り出しキー', 'Eject'], // KeyboardEvent が発火しない
  ['輝度を下げる', 'BrightnessDown'], // KeyboardEvent が発火しない
  ['輝度を上げる', 'BrightnessUp'], // KeyboardEvent が発火しない
  ['Mission Control', 'MissionControl'], // KeyboardEvent が発火しない。key の値は MDN になかったので独自につけた。
  ['音量を下げる', 'AudioVolumeDown'], // KeyboardEvent が発火しない
  ['音量を上げる', 'AudioVolumeUp'], // KeyboardEvent が発火しない
  ['キーボードの明るさを上げる', 'KeyboardBacklightUp'], // KeyboardEvent が発火しない。key の値は MDN になかったので独自につけた。
  ['キーボードの明るさを下げる', 'KeyboardBacklightDown'], // KeyboardEvent が発火しない。key の値は MDN になかったので独自につけた。
] as const

export default keyDescriptionToKeyArray
