const SYMBOLIC_KEY_TO_ANNOTATION_MAP: ReadonlyMap<string, string> = new Map([
  ['+', 'Plus'],
  ['/', 'Slash'],
  ['-', 'Minus'],
  ['`', 'Grave'],
  ['\\', 'Backslash'],
  ['.', 'Period'],
  ['?', 'Question'],
  [',', 'Comma'],
  [';', 'Semicolon'],
  [':', 'Colon'],
  ['˜', 'Tilde'],
  ['=', 'Equal'],
] as const)

export default SYMBOLIC_KEY_TO_ANNOTATION_MAP
