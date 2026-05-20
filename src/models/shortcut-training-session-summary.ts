import shortcutCatalog from '@/models/shortcut-catalog'
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
): ShortcutTrainingSessionSummary => {
  const countsOfEachStatus = () =>
    getCountsOfEachStatus({
      shortcuts: snapshot.shortcuts,
      removedIds: snapshot.removedIds,
      answeredHistory: snapshot.answeredHistory,
    })

  const masteredIds = () => getMasteredIds(snapshot)

  const masteredRateOfEachTool = () =>
    shortcutCatalog.tools().map((tool) => {
      const shortcuts = shortcutCatalog.where({ tool })
      const countOfShortcut = shortcuts.filter(
        (shortcut) => !snapshot.removedIds.has(shortcut.id),
      ).length
      const countOfMastered = shortcuts.filter(
        (shortcut) =>
          masteredIds().includes(shortcut.id) &&
          !snapshot.removedIds.has(shortcut.id),
      ).length

      return {
        name: tool,
        masteredRate:
          countOfShortcut === 0
            ? 0
            : Math.floor((countOfMastered / countOfShortcut) * 100),
      }
    })

  const categoriesWithMasteredRate = (tool: string) => {
    const shortcutsOfTool = shortcutCatalog.where({ tool })
    const masteredIdsOfTool = masteredIds()

    return shortcutCatalog.categoriesOf(tool).map((categoryName) => {
      const shortcutsOfCategory = shortcutsOfTool.filter(
        (shortcut) =>
          shortcut.category === categoryName &&
          !snapshot.removedIds.has(shortcut.id),
      )
      const masteredShortcutsOfCategory = shortcutsOfCategory.filter(
        (shortcut) => masteredIdsOfTool.includes(shortcut.id),
      )

      return {
        name: categoryName,
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
