const keyToDisplayNameArray = [
  ['Alt', 'option'], // macOS
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['ArrowUp', 'up'],
  ['Backspace', 'delete'],
  ['CapsLock', 'capslock'],
  ['Control', 'control'],
  ['Delete', 'forward delete'],
  ['Enter', 'enter'],
  ['Escape', 'escape'],
  ['Meta', 'command'], // macOS
  ['NumpadAdd', 'add'],
  ['NumpadDecimal', 'decimal'],
  ['NumpadDivide', 'divide'],
  ['NumpadMultiply', 'multiply'],
  ['NumpadSubtract', 'subtract'],
  ['Shift', 'shift'],
] as const; // https://stackoverflow.com/questions/67631458/no-overload-matches-this-call-while-constructing-map-from-array

export default keyToDisplayNameArray;
