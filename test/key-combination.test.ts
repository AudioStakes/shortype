import { describe, expect, test } from 'vitest'
import { KEY_COMBINATIONS_ONLY_AVAILABLE_IN_FULL_SCREEN_MODE } from '@/constants/key-combinations'
import KeyCombination from '@/models/key-combination'
import KeyCombinations from '@/models/key-combinations'
import type { KeyCombinable } from '@/types/interfaces'

const key = (overrides: Partial<KeyCombinable> = {}): KeyCombinable => ({
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key: 'a',
  ...overrides,
})

test('default and reset have no pressed keys', () => {
  const combination = new KeyCombination()
  expect(combination.hasPressedSomeKey()).toBe(false)
  expect(KeyCombination.isDefaultValue(key({ key: null }))).toBe(true)
  expect(KeyCombination.isDefaultValue(key())).toBe(false)
  combination.keyDown(key({ metaKey: true }))
  expect(combination.keys()).toEqual(['Meta', 'a'])
  combination.reset()
  expect(combination.hasPressedSomeKey()).toBe(false)
  expect(combination.keys()).toEqual([])
})

test.each([
  'Alt',
  'Control',
  'Meta',
  'Shift',
])('recognizes and releases modifier %s', (name) => {
  const pressed = new KeyCombination(
    key({
      altKey: true,
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
      key: name,
    }),
  )
  expect(pressed.isModifierKey()).toBe(true)
  expect(pressed.isOnlyModifierKeys()).toBe(true)
  expect(pressed.keys()).toEqual(['Meta', 'Alt', 'Shift', 'Control'])
  pressed.keyUp(name)
  expect(pressed.keyCombinable).toEqual(
    key({
      altKey: name !== 'Alt',
      ctrlKey: name !== 'Control',
      metaKey: name !== 'Meta',
      shiftKey: name !== 'Shift',
      key: undefined,
    }),
  )
})

test.each([
  null,
  undefined,
  'a',
  '',
])('classifies non-modifier keys: %j', (name) => {
  const combination = new KeyCombination(key({ key: name }))
  expect(combination.isModifierKey()).toBe(false)
  expect(combination.isOnlyModifierKeys()).toBe(false)
})

test('modifier-only combinations match only their modifier flags', () => {
  const combination = new KeyCombination(key({ key: 'Meta', metaKey: true }))
  expect(combination.is(key({ key: null, metaKey: true }))).toBe(true)
  expect(
    combination.is(new KeyCombination(key({ key: 'x', metaKey: true }))),
  ).toBe(true)
  for (const modifier of [
    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',
  ] as const) {
    const other = {
      ...combination.keyCombinable,
      [modifier]: !combination.keyCombinable[modifier],
    }
    expect(combination.is(other)).toBe(false)
    expect(combination.hasEqualModifiers(new KeyCombination(other))).toBe(false)
  }
  expect(
    combination.hasEqualModifiers(
      new KeyCombination(combination.keyCombinable),
    ),
  ).toBe(true)
})

test('normal equality checks every modifier and the key', () => {
  const combination = new KeyCombination(key())
  expect(combination.is(key())).toBe(true)
  expect(combination.is(key({ key: 'b' }))).toBe(false)
  for (const modifier of [
    'altKey',
    'ctrlKey',
    'metaKey',
    'shiftKey',
  ] as const) {
    expect(combination.is(key({ [modifier]: true }))).toBe(false)
  }
  combination.keyUp('b')
  expect(combination.keyCombinable.key).toBe('a')
  combination.keyUp('a')
  expect(combination.keyCombinable.key).toBeUndefined()
})

test('recognizes only unmodified action keys', () => {
  const cases = [
    ['Enter', 'isOnlyEnterKey'],
    ['r', 'isRemoveKey'],
    ['t', 'isSelectToolsKey'],
    ['c', 'isShowCorrectKey'],
    ['y', 'isMarkedSelfAsCorrectKey'],
    ['n', 'isMarkedSelfAsWrongKey'],
    ['f', 'isToggleFullscreenKey'],
  ] as const
  for (const [name, method] of cases) {
    expect(new KeyCombination(key({ key: name }))[method]()).toBe(true)
    expect(
      new KeyCombination(key({ key: name, metaKey: true }))[method](),
    ).toBe(false)
    expect(new KeyCombination(key({ key: 'z' }))[method]()).toBe(false)
  }
})

test('fullscreen classification uses all modifier flags and the key', () => {
  for (const combination of KEY_COMBINATIONS_ONLY_AVAILABLE_IN_FULL_SCREEN_MODE) {
    expect(new KeyCombination(combination).isOnlyAvailableInFullscreen()).toBe(
      true,
    )
  }
  const fullscreenKey = key({ key: 'n', metaKey: true })
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey'] as const) {
    expect(
      KeyCombination.isOnlyAvailableInFullscreen({
        ...fullscreenKey,
        [modifier]: !fullscreenKey[modifier],
      }),
    ).toBe(false)
  }
  expect(KeyCombination.isOnlyAvailableInFullscreen(key({ key: null }))).toBe(
    false,
  )
  expect(
    KeyCombination.isOnlyAvailableInFullscreen(key({ key: undefined })),
  ).toBe(false)
})

describe('KeyCombinations alternatives', () => {
  test('empty alternatives match nothing', () => {
    const alternatives = new KeyCombinations([])
    expect(alternatives.find(new KeyCombination())).toBeUndefined()
    expect(alternatives.hasOnlyModifierKeys()).toBe(false)
    expect(alternatives.hasOnlyEnterKey()).toBe(false)
    expect(alternatives.hasOnlyAvailableInFullscreen()).toBe(false)
  })
  test('each query searches beyond a nonmatching first alternative', () => {
    const alternatives = new KeyCombinations([
      new KeyCombination(key()),
      new KeyCombination(key({ key: 'Meta', metaKey: true })),
      new KeyCombination(key({ key: 'Enter' })),
      new KeyCombination(key({ key: 'n', metaKey: true })),
    ])
    expect(
      alternatives
        .find(new KeyCombination(key({ key: 'Enter' })))
        ?.isOnlyEnterKey(),
    ).toBe(true)
    expect(
      alternatives.find(new KeyCombination(key({ key: 'z' }))),
    ).toBeUndefined()
    expect(alternatives.hasOnlyModifierKeys()).toBe(true)
    expect(alternatives.hasOnlyEnterKey()).toBe(true)
    expect(alternatives.hasOnlyAvailableInFullscreen()).toBe(false)
  })
  test('requires fullscreen only when every alternative needs it', () => {
    const alternatives = new KeyCombinations([
      new KeyCombination(key({ key: 'n', metaKey: true })),
      new KeyCombination(key({ key: 't', metaKey: true })),
    ])
    expect(alternatives.hasOnlyAvailableInFullscreen()).toBe(true)
  })
})

test.each([
  null,
  undefined,
])('released modifier-only input still matches modifier flags: %j', (name) => {
  const combination = new KeyCombination(key({ key: name, metaKey: true }))
  expect(combination.isOnlyModifierKeys()).toBe(true)
  expect(combination.keys()).toEqual(['Meta'])
  expect(combination.is(key({ key: 'Meta', metaKey: true }))).toBe(true)
})
