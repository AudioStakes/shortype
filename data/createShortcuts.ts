import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

import { DENY_LIST_OF_KEY_COMBINATION } from '../src/constants/keyCombinations'
import {
  ALT_DESCRIPTION_REGEXP,
  CTRL_DESCRIPTION_REGEXP,
  DENY_LIST_OF_KEY_DESCRIPTION_REGEXP,
  KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP,
  META_DESCRIPTION_REGEXP,
  MODIFIER_KEY_DESCRIPTION_REGEXP,
  SHIFT_DESCRIPTION_REGEXP,
} from '../src/constants/keyDescriptionRegexp'
import keyDescriptionToKeyArray from '../src/constants/keyDescriptionToKeyArray'
import { MODIFIED_KEY_REGEXP } from '../src/constants/keyRegexp'
import {
  HAS_MOUSE_ACTIONS_REGEXP,
  HAS_MULTIPLE_ANSWERS_REGEXP,
  HAS_OTHER_ACTIONS_REGEXP,
  HAS_RANGED_ANSWERS_REGEXP,
} from '../src/constants/shortcutDescriptionRegexp'
import KeyCombination from '../src/models/keyCombination'
import { Shortcut } from '../src/types/interfaces'

const deniedKeyCombinations = DENY_LIST_OF_KEY_COMBINATION.map(
  (deniedKeyCombination) => new KeyCombination(deniedKeyCombination)
)

const keyDescriptionToKeyMap = new Map<string, string>(keyDescriptionToKeyArray)

export default async function createShortcuts(csvPath: string) {
  const csvRawData = fs.readFileSync(csvPath)
  const filename = path.basename(csvPath, '.csv')
  const records = parse(csvRawData, { columns: true })

  const shortcuts = []
  for (const record of records) {
    const shortcut = createShortcut(record)

    shortcuts.push(shortcut)
  }

  const json = JSON.stringify(shortcuts)
  fs.writeFileSync(
    `${__dirname}/../src/constants/shortcuts/${filename}.json`,
    json,
    'utf8'
  )
}

interface ShortcutFromCsv {
  id: string

  app: string
  os: string
  category: string
  action: string
  shortcut: string
}

export const createShortcut = (shortcutRaw: ShortcutFromCsv) => {
  const shortcut: Shortcut = {
    id: shortcutRaw.id,
    app: shortcutRaw.app,
    os: shortcutRaw.os,
    category: shortcutRaw.category,
    action: shortcutRaw.action,
    shortcut: shortcutRaw.shortcut,
    keyCombinations: extractKeyCombinations(shortcutRaw.shortcut),
    isAvailable: false,
    unavailableReason: null,
  }

  if (HAS_RANGED_ANSWERS_REGEXP.test(shortcut.shortcut)) {
    shortcut.isAvailable = false
    shortcut.unavailableReason = 'hasRangedAnswers'
  } else if (HAS_MOUSE_ACTIONS_REGEXP.test(shortcut.shortcut)) {
    shortcut.unavailableReason = 'hasMouseActions'
  } else if (HAS_OTHER_ACTIONS_REGEXP.test(shortcut.shortcut)) {
    shortcut.unavailableReason = 'hasOtherActions'
  } else if (
    deniedKeyCombinations.some((deniedKeyCombination) =>
      shortcut.keyCombinations.some((keyCombination) =>
        deniedKeyCombination.is(keyCombination)
      )
    )
  ) {
    shortcut.unavailableReason = 'hasDeniedKeyCombination'
  } else if (
    shortcut.keyCombinations.some((keyCombination) => {
      !keyCombination.key
    })
  ) {
    shortcut.unavailableReason = 'noMatchedKeyExists'
  } else if (
    shortcut.keyCombinations.some((keyCombination) =>
      MODIFIED_KEY_REGEXP.test(keyCombination.key as string)
    )
  ) {
    shortcut.unavailableReason = 'hasModifiedKey'
  } else {
    shortcut.isAvailable = true
  }

  return shortcut
}

const extractKeyCombinations = (shortcutDescriptions: string) => {
  return shortcutDescriptions
    .split(HAS_MULTIPLE_ANSWERS_REGEXP)
    .map((shortcutDescription) => {
      return {
        altKey: ALT_DESCRIPTION_REGEXP.test(shortcutDescription),
        ctrlKey: CTRL_DESCRIPTION_REGEXP.test(shortcutDescription),
        metaKey: META_DESCRIPTION_REGEXP.test(shortcutDescription),
        shiftKey: SHIFT_DESCRIPTION_REGEXP.test(shortcutDescription),
        key: extractKey(shortcutDescription),
      }
    })
}

const extractKey = (shortcutDescription: string) => {
  const matched = shortcutDescription
    .replaceAll(MODIFIER_KEY_DESCRIPTION_REGEXP, '')
    .replaceAll(DENY_LIST_OF_KEY_DESCRIPTION_REGEXP, '')
    .match(KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP)

  if (matched) {
    let matchedKey = matched[0] as string

    matchedKey = keyDescriptionToKeyMap.get(matchedKey) ?? matchedKey
    matchedKey = matchedKey.length === 1 ? matchedKey.toLowerCase() : matchedKey

    return matchedKey
  } else {
    return null
  }
}
