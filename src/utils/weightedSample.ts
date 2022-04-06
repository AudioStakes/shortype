export function weightedSampleKey(keyWeightMap: Map<string, number>) {
  const keys = Array.from(keyWeightMap.keys())
  const weights = Array.from(keyWeightMap.values())

  return keys[weightedSampleIndex(weights)]
}

const weightedSampleIndex = (weights: number[]) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const randomWeight = Math.random() * totalWeight
  let cumulativeWeight = 0

  const sampledIndex = weights.findIndex((weight) => {
    cumulativeWeight += weight
    return cumulativeWeight >= randomWeight
  })

  return sampledIndex
}

/**
 * Examples of arg and returnValue:
 * [true, true] -> 0.02,
 * [true] -> 0.51,
 * [true, false] -> 3.51,
 * [false] -> 5,
 * [false, false] -> 9
 */
export function weight(results: boolean[]) {
  const laterResults = results.slice(-2) // Last 2 results

  const initialWeight = 1
  const weight = laterResults.reduce(
    (previousWeight, result) => previousWeight + (result ? -0.49 : 4),
    initialWeight
  )

  return weight
}
