import * as fs from 'node:fs'

import { createShortcut } from '@/../data/create-shortcut'
import { createShortcutsFromRecords } from '@/../data/create-shortcuts-core'
import { parseCsv } from '@/../data/parse-csv'
import chrome from '@/constants/shortcuts/chrome.json'
import mac from '@/constants/shortcuts/mac.json'
import terminal from '@/constants/shortcuts/terminal.json'
import KeyCombination from '@/models/key-combination'

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
  const records = createShortcutsFromRecords(parseCsv(csvRawData))

  expect(records).toEqual(chrome)
})

test('Terminal', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/terminal.csv`)
  const records = createShortcutsFromRecords(parseCsv(csvData))

  expect(records).toEqual(terminal)
})

test.each([
  ['168', 'ArrowDown', 'PageDown'],
  ['169', 'ArrowUp', 'PageUp'],
])('Terminal shortcut %s accepts its arrow key', (id, arrowKey, pageKey) => {
  const shortcut = terminal.find((shortcut) => shortcut.id === id)
  const answer = new KeyCombination(shortcut?.keyCombinations[0])
  const input = {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: arrowKey,
  }

  expect(answer.is(input)).toBe(true)
  expect(answer.is({ ...input, key: pageKey })).toBe(false)
})

test('macOS', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/mac.csv`)
  const records = createShortcutsFromRecords(parseCsv(csvData))

  expect(records).toEqual(mac)
})
