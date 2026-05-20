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
  const countsOfEachStatus = () =>
    getCountsOfEachStatus({
      shortcuts: snapshot.shortcuts,
      removedIds: snapshot.removedIds,
      answeredHistory: snapshot.answeredHistory,
    })

  const masteredIds = () => getMasteredIds(snapshot)

  const masteredRateOfEachTool = () =>
    catalog.tools.map(({ name, shortcuts }) => {
      const countOfShortcut = shortcuts.filter(
        (shortcut) => !snapshot.removedIds.has(shortcut.id),
      ).length
      const countOfMastered = shortcuts.filter(
        (shortcut) =>
          masteredIds().includes(shortcut.id) &&
          !snapshot.removedIds.has(shortcut.id),
      ).length

      return {
        name,
        masteredRate:
          countOfShortcut === 0
            ? 0
            : Math.floor((countOfMastered / countOfShortcut) * 100),
      }
    })

  const categoriesWithMasteredRate = (tool: string) => {
    const masteredIdsOfTool = masteredIds()
    const toolGroup = catalog.tools.find(({ name }) => name === tool)

    if (!toolGroup) {
      return []
    }

    const shortcutIdsOfTool = new Set(toolGroup.shortcuts.map(({ id }) => id))

    return toolGroup.categories.map((category) => {
      const shortcutsOfCategory = category.shortcuts.filter(
        (shortcut) =>
          shortcutIdsOfTool.has(shortcut.id) &&
          !snapshot.removedIds.has(shortcut.id),
      )
      const masteredShortcutsOfCategory = shortcutsOfCategory.filter(
        (shortcut) => masteredIdsOfTool.includes(shortcut.id),
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
