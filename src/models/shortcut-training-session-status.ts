import type { Shortcut } from '@/types/interfaces'
import { weight } from '@/utils/weighted-sample'

export type ShortcutTrainingSessionStatusSnapshot = {
  shortcuts: Shortcut[]
  removedIds: ReadonlySet<string>
  answeredHistory: ReadonlyMap<string, boolean[]>
}

type StatusCounts = {
  included: number
  removed: number
}

const MASTERED_WEIGHT_THRESHOLD = 0.6

const shortcutsIds = (shortcuts: Shortcut[]) =>
  shortcuts.map((shortcut) => shortcut.id)

export const getIdToWeightMap = ({
  shortcuts,
  answeredHistory,
}: ShortcutTrainingSessionStatusSnapshot) => {
  const idToWeightMap = new Map<string, number>()
  const shortcutIdSet = new Set(shortcutsIds(shortcuts))

  for (const [id, results] of answeredHistory.entries()) {
    if (shortcutIdSet.has(id)) {
      idToWeightMap.set(id, weight(results))
    }
  }

  return idToWeightMap
}

export const getAvailableIdToWeightMap = (
  snapshot: ShortcutTrainingSessionStatusSnapshot,
) => {
  const availableIdToWeightMap = new Map<string, number>()
  const idToWeightMap = getIdToWeightMap(snapshot)

  for (const [id, currentWeight] of idToWeightMap.entries()) {
    if (!snapshot.removedIds.has(id)) {
      availableIdToWeightMap.set(id, currentWeight)
    }
  }

  return availableIdToWeightMap
}

export const getMasteredIds = (
  snapshot: ShortcutTrainingSessionStatusSnapshot,
) =>
  [...getIdToWeightMap(snapshot)]
    .filter(([, currentWeight]) => currentWeight <= MASTERED_WEIGHT_THRESHOLD)
    .map(([id]) => id)

export const getCountsOfEachStatus = (
  snapshot: ShortcutTrainingSessionStatusSnapshot,
) => {
  const shortcutsIdList = shortcutsIds(snapshot.shortcuts)
  const availableIds = shortcutsIdList.filter(
    (id) => !snapshot.removedIds.has(id),
  )
  const answeredIdSet = new Set(snapshot.answeredHistory.keys())
  const masteredIds = getMasteredIds(snapshot)
  const unmasteredIds = Array.from(getIdToWeightMap(snapshot))
    .filter(([, currentWeight]) => currentWeight > MASTERED_WEIGHT_THRESHOLD)
    .map(([id]) => id)
  const noAnsweredIds = shortcutsIdList.filter((id) => !answeredIdSet.has(id))

  const count = (ids: string[]) => ({
    included: ids.filter((id) => availableIds.includes(id)).length,
    removed: ids.filter((id) => !availableIds.includes(id)).length,
  })

  return {
    mastered: count(masteredIds),
    unmastered: count(unmasteredIds),
    noAnswered: count(noAnsweredIds),
  } satisfies {
    mastered: StatusCounts
    unmastered: StatusCounts
    noAnswered: StatusCounts
  }
}
