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

test('Chrome tab movement uses Control and Shift with PageUp or PageDown', () => {
  expect(chrome.find((shortcut) => shortcut.id === '16')).toMatchObject({
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        key: 'PageUp',
      },
      {
        altKey: false,
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        key: 'PageDown',
      },
    ],
    isAvailable: true,
  })
})

test.each([
  [
    'Chrome',
    '342',
    chrome,
    { altKey: true, ctrlKey: false, metaKey: true, shiftKey: false, key: 'n' },
  ],
  [
    'Chrome',
    '343',
    chrome,
    { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true, key: 'i' },
  ],
  [
    'macOS',
    '344',
    mac,
    { altKey: false, ctrlKey: true, metaKey: true, shiftKey: false, key: 'n' },
  ],
  [
    'macOS',
    '345',
    mac,
    {
      altKey: false,
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      key: 'ArrowUp',
    },
  ],
  [
    'macOS',
    '352',
    mac,
    { altKey: false, ctrlKey: true, metaKey: false, shiftKey: false, key: 'y' },
  ],
  [
    'macOS',
    '197',
    mac,
    {
      altKey: false,
      ctrlKey: true,
      metaKey: true,
      shiftKey: false,
      key: 'Space',
    },
  ],
  [
    'Terminal',
    '117',
    terminal,
    {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      key: 'Delete',
    },
  ],
])('%s shortcut %s retains its documented keyboard answer', (_tool, id, shortcuts, answer) => {
  expect(shortcuts.find((shortcut) => shortcut.id === id)).toMatchObject({
    keyCombinations: [answer],
    isAvailable: true,
  })
})

test.each([
  '346',
  '347',
  '348',
  '349',
  '350',
  '351',
])('Fn-only shortcut %s remains unavailable for automatic keyboard scoring', (id) => {
  expect(mac.find((shortcut) => shortcut.id === id)).toMatchObject({
    keyCombinations: [],
    isAvailable: false,
    unavailableReason: 'hasOnlyNonKeyAction',
  })
})

test('Chrome opens the completed address in a new window', () => {
  expect(chrome.find((shortcut) => shortcut.id === '37')?.action).toBe(
    'サイト名に www. と .com を追加して新しいウィンドウで開く',
  )
})

test('system settings retain their existing shortcut IDs and current screen names', () => {
  expect(mac.find((shortcut) => shortcut.id === '266')).toMatchObject({
    category: 'システム設定のショートカット',
    action: 'システム設定の「ディスプレイ」を開く',
  })
  expect(mac.find((shortcut) => shortcut.id === '205')?.action).toBe(
    '最前面のアプリの設定を開く',
  )
  expect(terminal.find((shortcut) => shortcut.id === '156')?.action).toBe(
    '「ターミナル」設定を開く',
  )
})

test('text cut and paste describe the app-specific clipboard', () => {
  expect(mac.find((shortcut) => shortcut.id === '296')?.action).toContain(
    '同じアプリ専用のクリップボード',
  )
  expect(mac.find((shortcut) => shortcut.id === '352')?.action).toBe(
    'control + Kで切り取った内容を同じアプリ内に貼り付ける',
  )
})

test('power shortcuts describe their hardware conditions without removing legacy IDs', () => {
  expect(mac.find((shortcut) => shortcut.id === '206')?.action).toContain(
    'Touch ID搭載キーボードでは画面ロック',
  )
  expect(mac.find((shortcut) => shortcut.id === '210')?.action).toContain(
    'Touch IDのない内蔵キーボード',
  )
  expect(mac.find((shortcut) => shortcut.id === '211')).toMatchObject({
    keysDescription: 'control + command + メディア取り出しキー',
  })
})

test('the app launcher shortcut names both Tahoe and earlier macOS behavior', () => {
  const action = mac.find((shortcut) => shortcut.id === '351')?.action
  expect(action).toContain('macOS Tahoe 26以降')
  expect(action).toContain('Launchpad（旧バージョン）')
})
