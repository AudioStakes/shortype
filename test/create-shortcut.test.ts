import * as fs from 'node:fs'

import { createShortcut } from '@/../data/create-shortcut'
import { parseCsv } from '@/../data/parse-csv'
import chrome from '@/constants/shortcuts/chrome.json'
import mac from '@/constants/shortcuts/mac.json'
import terminal from '@/constants/shortcuts/terminal.json'
import type { ShortcutDescription } from '@/types/interfaces'

test.each([
  ['Right', 'ArrowRight'],
  ['Left', 'ArrowLeft'],
  ['Down', 'ArrowDown'],
  ['Up', 'ArrowUp'],
])('parse an English %s arrow description', (direction, expectedKey) => {
  const shortcut = createShortcut({
    id: 'english-arrow',
    app: 'Example',
    os: 'macOS',
    category: 'Navigation',
    action: 'Move',
    keysDescription: `Command + ${direction} arrow`,
  })

  expect(shortcut.keyCombinations).toEqual([
    {
      altKey: false,
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      key: expectedKey,
    },
  ])
})

test('Google Chrome', () => {
  const csvRawData = fs.readFileSync(
    `${__dirname}/../data/shortcuts/chrome.csv`,
  )
  const records = parseCsv(csvRawData) as unknown as ShortcutDescription[]

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = chrome.find(
      (shortcut) => shortcut.id === shortcutActual.id,
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})

test('Terminal', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/terminal.csv`)
  const records = parseCsv(csvData) as unknown as ShortcutDescription[]

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = terminal.find(
      (shortcut) => shortcut.id === shortcutActual.id,
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})

test('macOS', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/mac.csv`)
  const records = parseCsv(csvData) as unknown as ShortcutDescription[]

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = mac.find(
      (shortcut) => shortcut.id === shortcutActual.id,
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})
