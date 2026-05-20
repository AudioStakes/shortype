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
  const availableIdSet = new Set(availableIds)
  const answeredIdSet = new Set(snapshot.answeredHistory.keys())
  const noAnsweredIds = shortcutsIdList.filter((id) => !answeredIdSet.has(id))
  const idToWeightMap = getIdToWeightMap(snapshot)

  const count = (ids: Iterable<string>) => {
    let included = 0
    let removed = 0

    for (const id of ids) {
      if (availableIdSet.has(id)) {
        included += 1
      } else {
        removed += 1
      }
    }

    return { included, removed }
  }

  const masteredIds: string[] = []
  const unmasteredIds: string[] = []

  for (const [id, currentWeight] of idToWeightMap.entries()) {
    if (currentWeight <= MASTERED_WEIGHT_THRESHOLD) {
      masteredIds.push(id)
    } else {
      unmasteredIds.push(id)
    }
  }

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
