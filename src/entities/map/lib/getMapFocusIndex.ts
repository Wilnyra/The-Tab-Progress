import type { MapDerived } from './deriveMap'

export const getMapFocusIndex = (derived: MapDerived): number => {
  const { owned, lost, width, height } = derived
  const marked = owned.size > 0 ? owned : lost
  if (marked.size === 0) {
    return Math.floor(height / 2) * width + Math.floor(width / 2)
  }

  let sumX = 0
  let sumY = 0
  for (const index of marked) {
    sumX += index % width
    sumY += Math.floor(index / width)
  }
  const x = Math.min(width - 1, Math.round(sumX / marked.size))
  const y = Math.min(height - 1, Math.round(sumY / marked.size))
  return y * width + x
}
