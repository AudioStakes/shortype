import * as fs from 'node:fs'
import * as path from 'node:path'

import type { ShortcutDescription } from '@/types/interfaces'

import { createShortcut } from './create-shortcut'
import { createShortcutsFromRecords } from './create-shortcuts-core'
import { parseCsv } from './parse-csv'

export default async function createShortcuts(csvPath: string) {
  const csvRawData = fs.readFileSync(csvPath)
  const filename = path.basename(csvPath, '.csv')
  const records = parseCsv(csvRawData) as unknown as ShortcutDescription[]
  const shortcuts = createShortcutsFromRecords(records)

  const json = JSON.stringify(shortcuts)
  fs.writeFileSync(
    `${__dirname}/../src/constants/shortcuts/${filename}.json`,
    json,
    'utf8',
  )
}
