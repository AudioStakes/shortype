import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'

import KEY_DESCRIPTION_TO_KEY_MAP from '@/constants/key-description-to-key-map'
import { DENY_LIST_OF_KEY_COMBINATION } from '@/constants/keyCombinations'
import {
  ALT_DESCRIPTION_REGEXP,
  CTRL_DESCRIPTION_REGEXP,
  DENY_LIST_OF_KEY_DESCRIPTION_REGEXP,
  FUNCTION_KEY_DESCRIPTION_REGEXP,
  KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP,
  META_DESCRIPTION_REGEXP,
  MODIFIER_KEY_DESCRIPTION_REGEXP,
  SHIFT_DESCRIPTION_REGEXP,
  UNDETECTABLE_KEY_DESCRIPTION_REGEXP,
} from '@/constants/keyDescriptionRegexp'
import {
  MODIFIED_KEY_REGEXP,
  UNDETECTABLE_KEY_REGEXP,
} from '@/constants/keyRegexp'
import {
  HAS_MOUSE_ACTIONS_REGEXP,
  HAS_MULTIPLE_ANSWERS_REGEXP,
  HAS_OTHER_ACTIONS_REGEXP,
  HAS_RANGED_ANSWERS_REGEXP,
  IS_DEPEND_ON_DEVICE_REGEXP,
  NEEDS_CUSTOMIZED_MODIFIER_KEY_REGEXP,
} from '@/constants/shortcutDescriptionRegexp'
import KeyCombination from '@/models/keyCombination'
import { Shortcut } from '@/types/interfaces'

const deniedKeyCombinations = DENY_LIST_OF_KEY_COMBINATION.map(
  (deniedKeyCombination) => new KeyCombination(deniedKeyCombination)
)

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
    needsFillInBlankMode: false,
  }

  if (NEEDS_CUSTOMIZED_MODIFIER_KEY_REGEXP.test(shortcut.shortcut)) {
    shortcut.unavailableReason = 'needsCustomizedModifierKey'
  } else if (IS_DEPEND_ON_DEVICE_REGEXP.test(shortcut.shortcut)) {
    shortcut.unavailableReason = 'isDependOnDevice'
  } else if (
    shortcut.keyCombinations.every((keyCombination) =>
      KeyCombination.isDefaultValue(keyCombination)
    )
  ) {
    shortcut.unavailableReason = 'hasOnlyNonKeyAction'
  } else if (HAS_RANGED_ANSWERS_REGEXP.test(shortcut.shortcut)) {
    shortcut.unavailableReason = 'hasRangedAnswers'
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

  shortcut.needsFillInBlankMode = needsFillInBlankMode(shortcut.shortcut)

  return shortcut
}

const extractKeyCombinations = (shortcutDescriptions: string) => {
  return shortcutDescriptions
    .replaceAll(DENY_LIST_OF_KEY_DESCRIPTION_REGEXP, '')
    .replaceAll(UNDETECTABLE_KEY_DESCRIPTION_REGEXP, '')
    .split(HAS_MULTIPLE_ANSWERS_REGEXP)
    .filter(
      (shortcutDescription) =>
        !FUNCTION_KEY_DESCRIPTION_REGEXP.test(shortcutDescription)
    )
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
    .replaceAll(UNDETECTABLE_KEY_DESCRIPTION_REGEXP, '')
    .match(KEY_DESCRIPTION_EXCLUDING_MODIFIER_REGEXP)

  if (matched) {
    let matchedKey = matched[0] as string

    if (UNDETECTABLE_KEY_REGEXP.test(matchedKey)) return null

    matchedKey = KEY_DESCRIPTION_TO_KEY_MAP.get(matchedKey) ?? matchedKey
    matchedKey = matchedKey.length === 1 ? matchedKey.toLowerCase() : matchedKey

    return matchedKey
  } else {
    return null
  }
}

const needsFillInBlankMode = (description: string) => {
  return (
    HAS_MOUSE_ACTIONS_REGEXP.test(description) ||
    HAS_OTHER_ACTIONS_REGEXP.test(description) ||
    UNDETECTABLE_KEY_DESCRIPTION_REGEXP.test(description)
  )
}
