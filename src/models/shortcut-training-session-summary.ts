import shortcutCatalog from '@/models/shortcut-catalog'
import type { Shortcut } from '@/types/interfaces'
import { weight } from '@/utils/weighted-sample'

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
  const shortcutsIds = () => snapshot.shortcuts.map((shortcut) => shortcut.id)

  const availableIds = () =>
    shortcutsIds().filter((id) => !snapshot.removedIds.has(id))

  const answeredIds = () => Array.from(snapshot.answeredHistory.keys())

  const idToWeightMap = () => {
    const idToWeightMap = new Map<string, number>()

    for (const [id, results] of snapshot.answeredHistory.entries()) {
      if (shortcutsIds().includes(id)) {
        idToWeightMap.set(id, weight(results))
      }
    }

    return idToWeightMap
  }

  const masteredIds = () =>
    [...snapshot.answeredHistory]
      .map(([id, results]): [string, number] => [id, weight(results)])
      .filter(([, currentWeight]) => currentWeight <= 0.6)
      .map(([id]) => id)

  const countsOfEachStatus = () => {
    const [masteredIdsOfStatus, unmasteredIds] =
      Array.from(idToWeightMap()).reduce<[string[], string[]]>(
        ([masteredIds, unmasteredIds], [id, currentWeight]) =>
          currentWeight <= 0.6
            ? [[...masteredIds, id], unmasteredIds]
            : [masteredIds, [...unmasteredIds, id]],
        [[], []],
      )

    const noAnsweredIds = shortcutsIds().filter(
      (id) => !answeredIds().includes(id),
    )

    return {
      mastered: {
        included: masteredIdsOfStatus.filter((id) => availableIds().includes(id))
          .length,
        removed: masteredIdsOfStatus.filter((id) => !availableIds().includes(id))
          .length,
      },
      unmastered: {
        included: unmasteredIds.filter((id) => availableIds().includes(id))
          .length,
        removed: unmasteredIds.filter((id) => !availableIds().includes(id))
          .length,
      },
      noAnswered: {
        included: noAnsweredIds.filter((id) => availableIds().includes(id))
          .length,
        removed: noAnsweredIds.filter((id) => !availableIds().includes(id))
          .length,
      },
    }
  }

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
      const masteredShortcutsOfCategory = shortcutsOfCategory.filter((shortcut) =>
        masteredIdsOfTool.includes(shortcut.id),
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
