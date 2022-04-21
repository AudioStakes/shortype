const KEY_TO_ANNOTATION_MAP: ReadonlyMap<string, string> = new Map([
  ['Alt', 'Option'], // macOS
  ['ArrowDown', 'Down'],
  ['ArrowLeft', 'Left'],
  ['ArrowRight', 'Right'],
  ['ArrowUp', 'Up'],
  ['Backspace', 'Delete'], // macOS
  ['Delete', 'Forward Delete'], //macOS
  ['Meta', 'Command'], // macOS
  ['Add', 'Plus'], // macOS
  ['NumpadAdd', 'Add'],
  ['NumpadDecimal', 'Decimal'],
  ['NumpadDivide', 'Divide'],
  ['NumpadMultiply', 'Multiply'],
  ['NumpadSubtract', 'Subtract'],
] as const)

export default KEY_TO_ANNOTATION_MAP
