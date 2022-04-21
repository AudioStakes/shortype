import { parse } from 'csv-parse/sync'
import * as fs from 'fs'

import { createShortcut } from '@/../data/create-shortcuts'
import chrome from '@/constants/shortcuts/chrome.json'
import mac from '@/constants/shortcuts/mac.json'
import terminal from '@/constants/shortcuts/terminal.json'

test('Google Chrome', () => {
  const csvRawData = fs.readFileSync(
    `${__dirname}/../data/shortcuts/chrome.csv`
  )
  const records = parse(csvRawData, { columns: true })

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = chrome.find(
      (shortcut) => shortcut.id === shortcutActual.id
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})

test('Terminal', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/terminal.csv`)
  const records = parse(csvData, { columns: true })

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = terminal.find(
      (shortcut) => shortcut.id === shortcutActual.id
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})

test('macOS', () => {
  const csvData = fs.readFileSync(`${__dirname}/../data/shortcuts/mac.csv`)
  const records = parse(csvData, { columns: true })

  for (const record of records) {
    const shortcutActual = createShortcut(record)
    const shortcutExpected = mac.find(
      (shortcut) => shortcut.id === shortcutActual.id
    )

    expect(shortcutActual).toEqual(shortcutExpected)
  }
})
