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
    unanswered: StatusCounts
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
  const toolByNameMap = new Map(
    catalog.tools.map(
      (toolSummary) => [toolSummary.name, toolSummary] as const,
    ),
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
      let shortcutCount = 0
      let masteredCount = 0

      for (const shortcut of shortcuts) {
        if (snapshot.removedIds.has(shortcut.id)) {
          continue
        }

        shortcutCount += 1

        if (masteredIdSet.has(shortcut.id)) {
          masteredCount += 1
        }
      }

      return {
        name,
        masteredRate:
          shortcutCount === 0
            ? 0
            : Math.floor((masteredCount / shortcutCount) * 100),
      }
    })
  }

  const categoriesWithMasteredRate = (tool: string) => {
    const toolSummary = toolByNameMap.get(tool)

    if (!toolSummary) {
      return []
    }

    return toolSummary.categories.map((category) => {
      const availableShortcutsOfCategory = category.shortcuts.filter(
        (shortcut) => !snapshot.removedIds.has(shortcut.id),
      )
      const masteredShortcutsOfCategory = availableShortcutsOfCategory.filter(
        (shortcut) => masteredIdSet.has(shortcut.id),
      )

      return {
        name: category.name,
        masteredRate:
          availableShortcutsOfCategory.length === 0
            ? 0
            : Math.floor(
                (masteredShortcutsOfCategory.length /
                  availableShortcutsOfCategory.length) *
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
