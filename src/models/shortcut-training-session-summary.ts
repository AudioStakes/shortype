import {
  getCountsOfEachStatus,
  getMasteredIds,
} from '@/models/shortcut-training-session-status'
import type { Shortcut } from '@/types/interfaces'

export type ShortcutTrainingSessionSnapshot = {
  shortcuts: Shortcut[]
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
}

export type ShortcutCatalogSummary = {
  tools: Array<{
    name: string
    shortcuts: Shortcut[]
    categories: Array<{
      name: string
      shortcuts: Shortcut[]
    }>
  }>
}

type StatusCounts = {
  included: number
  removed: number
}

export type ShortcutTrainingSessionSummary = {
  countsOfEachStatus: () => {
    mastered: StatusCounts
    unmastered: StatusCounts
    noAnswered: StatusCounts
  }
  masteredRateOfEachTool: () => Array<{
    name: string
    masteredRate: number
  }>
  categoriesWithMasteredRate: (tool: string) => Array<{
    name: string
    masteredRate: number
  }>
}

export const createShortcutTrainingSessionSummary = (
  snapshot: ShortcutTrainingSessionSnapshot,
  catalog: ShortcutCatalogSummary,
): ShortcutTrainingSessionSummary => {
  const toolGroupMap = new Map(
    catalog.tools.map((toolGroup) => [toolGroup.name, toolGroup] as const),
  )
  const masteredIdSet = new Set(getMasteredIds(snapshot))

  const countsOfEachStatus = () =>
    getCountsOfEachStatus({
      shortcuts: snapshot.shortcuts,
      removedIds: snapshot.removedIds,
      answeredHistory: snapshot.answeredHistory,
    })

  const masteredRateOfEachTool = () => {
    return catalog.tools.map(({ name, shortcuts }) => {
      let countOfShortcut = 0
      let countOfMastered = 0

      for (const shortcut of shortcuts) {
        if (snapshot.removedIds.has(shortcut.id)) {
          continue
        }

        countOfShortcut += 1

        if (masteredIdSet.has(shortcut.id)) {
          countOfMastered += 1
        }
      }

      return {
        name,
        masteredRate:
          countOfShortcut === 0
            ? 0
            : Math.floor((countOfMastered / countOfShortcut) * 100),
      }
    })
  }

  const categoriesWithMasteredRate = (tool: string) => {
    const toolGroup = toolGroupMap.get(tool)

    if (!toolGroup) {
      return []
    }

    return toolGroup.categories.map((category) => {
      const shortcutsOfCategory = category.shortcuts.filter(
        (shortcut) => !snapshot.removedIds.has(shortcut.id),
      )
      const masteredShortcutsOfCategory = shortcutsOfCategory.filter(
        (shortcut) => masteredIdSet.has(shortcut.id),
      )

      return {
        name: category.name,
        masteredRate:
          shortcutsOfCategory.length === 0
            ? 0
            : Math.floor(
                (masteredShortcutsOfCategory.length /
                  shortcutsOfCategory.length) *
                  100,
              ),
      }
    })
  }

  return {
    countsOfEachStatus,
    masteredRateOfEachTool,
    categoriesWithMasteredRate,
  }
}

export default createShortcutTrainingSessionSummary
