import { expect, test } from 'vitest'
import { createShortcut } from '@/../data/create-shortcut'

const description = {
  id: 'boundary',
  app: 'Example',
  os: 'macOS',
  category: 'Examples',
  action: 'Example action',
}

test.each([
  ['Command + 9 または Command + Shift + q', 'hasDeniedKeyCombination'],
  ['Command + m または Command + 疑問符 (?)', 'hasModifiedKey'],
  ['Command + m メタキーとしてOptionキーを使用', 'needsCustomizedModifierKey'],
  ['Command + m ノートパソコンの場合', 'isDependOnDevice'],
  ['クリック', 'hasOnlyNonKeyAction'],
  ['Command + 1～9', 'hasRangedAnswers'],
])('one unsupported alternative or action disables the whole shortcut: %s', (keysDescription, unavailableReason) => {
  const shortcut = createShortcut({ ...description, keysDescription })
  expect(shortcut.isAvailable).toBe(false)
  expect(shortcut.unavailableReason).toBe(unavailableReason)
  expect(shortcut.id).toBe(description.id)
})

test.each([
  ['Command + m', false],
  ['Command + リンクをクリック', true],
  ['Command + テキストを入力', true],
  ['Command + 音量を上げる', true],
])('fill-in mode follows the description: %s', (keysDescription, expected) => {
  expect(
    createShortcut({ ...description, keysDescription }).needsFillInBlankMode,
  ).toBe(expected)
})

test('normalization preserves identity and maps each alternative independently', () => {
  const shortcut = createShortcut({
    ...description,
    keysDescription:
      'Command + M または Control + Return または Option + Shift + Up arrow',
  })
  expect(shortcut).toMatchObject({
    ...description,
    isAvailable: true,
    unavailableReason: null,
    needsFillInBlankMode: false,
  })
  expect(shortcut.keyCombinations).toEqual([
    { altKey: false, ctrlKey: false, metaKey: true, shiftKey: false, key: 'm' },
    {
      altKey: false,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      key: 'Enter',
    },
    {
      altKey: true,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      key: 'ArrowUp',
    },
  ])
})
