const keyNameToSymbolArray = [
  ['Alt', '⌥'], // macOS
  ['ArrowDown', '↓'],
  ['ArrowLeft', '←'],
  ['ArrowRight', '→'],
  ['ArrowUp', '↑'],
  ['Backspace', '⌫'],
  ['CapsLock', '⇪'],
  ['Control', '⌃'],
  ['Delete', '⌦'], // forward delete
  ['Enter', '↩'],
  ['Escape', '⎋'],
  ['Meta', '⌘'], // macOS
  ['NumpadAdd', '+'],
  ['NumpadDecimal', '.'],
  ['NumpadDivide', '/'],
  ['NumpadMultiply', '*'],
  ['NumpadSubtract', '-'],
  ['Shift', '⇧'],
] as const; // https://stackoverflow.com/questions/67631458/no-overload-matches-this-call-while-constructing-map-from-array

export default keyNameToSymbolArray;
