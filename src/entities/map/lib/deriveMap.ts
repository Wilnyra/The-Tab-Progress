import { COST_HARD, COST_LAND, MAP_HEIGHT, MAP_WIDTH } from '../model/constants'
import type { MapState } from '../model/types'
import { largestLandComponent } from './largestLandComponent'

export type MapDerived = {
  width: number
  height: number
  terrain: string
  owned: ReadonlySet<number>
  lost: ReadonlySet<number>
  reachable: ReadonlySet<number>
  claimable: ReadonlySet<number>
  costs: readonly number[]
  lostAt: ReadonlyMap<number, string>
  ownedAt: ReadonlyMap<number, string>
  available: number
}

const EMPTY_SET: ReadonlySet<number> = new Set<number>()
const EMPTY_MAP: ReadonlyMap<number, string> = new Map<number, string>()

const EMPTY_DERIVED: MapDerived = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  terrain: '',
  owned: EMPTY_SET,
  lost: EMPTY_SET,
  reachable: EMPTY_SET,
  claimable: EMPTY_SET,
  costs: [],
  lostAt: EMPTY_MAP,
  ownedAt: EMPTY_MAP,
  available: 0,
}

const cellCost = (char: string): number => {
  if (char === 'h') return COST_HARD
  if (char === 'w') return 0
  return COST_LAND
}

const hasOwnedNeighbour = (
  owned: ReadonlySet<number>,
  index: number,
  width: number,
  height: number,
): boolean => {
  const x = index % width
  const y = Math.floor(index / width)
  if (x > 0 && owned.has(index - 1)) return true
  if (x < width - 1 && owned.has(index + 1)) return true
  if (y > 0 && owned.has(index - width)) return true
  if (y < height - 1 && owned.has(index + width)) return true
  return false
}

export const deriveMap = (state: MapState | null): MapDerived => {
  if (!state) return EMPTY_DERIVED

  const { profile, credits, cells } = state
  const { width, height, terrain } = profile

  const owned = new Set<number>()
  const lost = new Set<number>()
  const lostAt = new Map<number, string>()
  const ownedAt = new Map<number, string>()

  for (const cell of cells) {
    const index = cell.y * width + cell.x
    if (cell.kind === 'lose') {
      owned.delete(index)
      ownedAt.delete(index)
      lost.add(index)
      lostAt.set(index, cell.createdAt)
      continue
    }
    lost.delete(index)
    lostAt.delete(index)
    owned.add(index)
    ownedAt.set(index, cell.createdAt)
  }

  const costs = Array.from(terrain, cellCost)
  const reachable = new Set<number>()
  const claimable = new Set<number>()
  const hasTerritory = owned.size > 0
  // Without territory the first claim may only land on the main landmass —
  // a pocket cut off by water could never be grown from.
  const mainland = hasTerritory
    ? EMPTY_SET
    : largestLandComponent(terrain, width, height)

  for (let index = 0; index < costs.length; index += 1) {
    if (terrain[index] === 'w') continue
    if (owned.has(index) || lost.has(index)) continue
    const isOpen = hasTerritory
      ? hasOwnedNeighbour(owned, index, width, height)
      : mainland.has(index)
    if (!isOpen) continue
    reachable.add(index)
    if (credits.available >= costs[index]) claimable.add(index)
  }

  return {
    width,
    height,
    terrain,
    owned,
    lost,
    reachable,
    claimable,
    costs,
    lostAt,
    ownedAt,
    available: credits.available,
  }
}
