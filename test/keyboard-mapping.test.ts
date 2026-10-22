import macShortcuts from '@/constants/shortcuts/mac.json'
import KeyCombination from '@/models/key-combination'
import Keyboard from '@/utils/keyboard'

const browserLayout = new Map([
  ['Semicolon', ';'],
  ['KeyQ', 'q'],
  ['Digit9', '9'],
  ['BracketLeft', '['],
])

const layouts = ['fallback', 'browser']

test.each(layouts)('grade punctuation with the %s layout', (layout) => {
  const keyboard = new Keyboard(
    layout === 'browser' ? browserLayout : undefined,
  )

  for (const { id, key, shiftKey } of [
    { id: '292', key: ';', shiftKey: false },
    { id: '291', key: ':', shiftKey: true },
  ]) {
    const shortcut = macShortcuts.find((entry) => entry.id === id)
    const expected = shortcut?.keyCombinations[0]
    if (!expected) {
      throw new Error(`Missing punctuation shortcut ${id}`)
    }

    const pressed = new KeyCombination({
      altKey: false,
      ctrlKey: false,
      metaKey: true,
      shiftKey,
      key: keyboard.key({ code: 'Semicolon', key }),
    })

    expect(new KeyCombination(expected).is(pressed)).toBe(true)
  }
})

test.each(layouts)('keep base keys with the %s layout', (layout) => {
  const keyboard = new Keyboard(
    layout === 'browser' ? browserLayout : undefined,
  )

  for (const { code, key, expected } of [
    { code: 'KeyQ', key: 'Q', expected: 'q' },
    { code: 'Digit9', key: '(', expected: '9' },
    { code: 'BracketLeft', key: '{', expected: '[' },
  ]) {
    expect(keyboard.key({ code, key })).toBe(expected)
  }

  expect(keyboard.key({ code: 'KeyQ', key: 'œ' })).toBe('q')
})

test.each(layouts)('release Shift first with the %s layout', (layout) => {
  const keyboard = new Keyboard(
    layout === 'browser' ? browserLayout : undefined,
  )
  const pressed = new KeyCombination({
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: keyboard.key({ code: 'Semicolon', key: ':' }),
  })

  pressed.keyUp('Shift')
  pressed.keyUp(keyboard.key({ code: 'Semicolon', key: ';' }))

  expect(pressed.keys()).toEqual(['Meta'])
})

test('do not equate unshifted colon and semicolon', () => {
  const semicolon = new KeyCombination({
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: ';',
  })

  expect(semicolon.is({ ...semicolon.keyCombinable, key: ':' })).toBe(false)
})

test('the latest layout lookup wins when native requests finish out of order', async () => {
  const keyboard = new Keyboard()
  const older = Promise.withResolvers<Map<string, string>>()
  const newer = Promise.withResolvers<Map<string, string>>()
  const oldRequest = keyboard.setKeyboardLayoutMap({
    getLayoutMap: () => older.promise,
  })
  const newRequest = keyboard.setKeyboardLayoutMap({
    getLayoutMap: () => newer.promise,
  })
  newer.resolve(new Map([['KeyQ', 'a']]))
  await newRequest
  older.resolve(new Map([['KeyQ', 'z']]))
  await oldRequest
  expect(keyboard.key({ code: 'KeyQ', key: 'q' })).toBe('a')
})

test('a rejected refresh retains the last good layout and ignores an older pending result', async () => {
  const keyboard = new Keyboard(new Map([['KeyQ', 'a']]))
  const older = Promise.withResolvers<Map<string, string>>()
  const oldRequest = keyboard.setKeyboardLayoutMap({
    getLayoutMap: () => older.promise,
  })
  await keyboard.setKeyboardLayoutMap({
    getLayoutMap: () => Promise.reject(new Error('Layout unavailable')),
  })
  older.resolve(new Map([['KeyQ', 'z']]))
  await oldRequest
  expect(keyboard.key({ code: 'KeyQ', key: 'q' })).toBe('a')
})

test('cleanup can abort a pending layout lookup without replacing the last good map', async () => {
  const keyboard = new Keyboard(new Map([['KeyQ', 'a']]))
  const pending = Promise.withResolvers<Map<string, string>>()
  const controller = new AbortController()
  const request = keyboard.setKeyboardLayoutMap(
    { getLayoutMap: () => pending.promise },
    controller.signal,
  )
  controller.abort()
  pending.resolve(new Map([['KeyQ', 'z']]))
  await request
  expect(keyboard.key({ code: 'KeyQ', key: 'q' })).toBe('a')
})
