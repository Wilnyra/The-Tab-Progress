import type { MapCellAction } from '../model/types'
import type { MapDerived } from './deriveMap'
import { MAP_ERROR_COPY } from './mapErrorMessage'

export const describeCellAction = (
  derived: MapDerived,
  index: number,
): MapCellAction => {
  const char = derived.terrain[index]
  if (char === undefined || char === 'w') {
    return { kind: 'blocked', reason: MAP_ERROR_COPY.water }
  }
  if (derived.owned.has(index)) {
    return { kind: 'blocked', reason: MAP_ERROR_COPY.alreadyOwned }
  }

  const cost = derived.costs[index] ?? 1
  const isRestore = derived.lost.has(index)
  if (!isRestore && !derived.reachable.has(index)) {
    return { kind: 'blocked', reason: MAP_ERROR_COPY.notAdjacent }
  }
  if (derived.available < cost) {
    return { kind: 'blocked', reason: MAP_ERROR_COPY.notEnough }
  }
  return { kind: isRestore ? 'restore' : 'claim', cost }
}
