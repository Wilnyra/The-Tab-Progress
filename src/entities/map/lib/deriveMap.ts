import { COST_HARD, COST_LAND, MAP_HEIGHT, MAP_WIDTH } from '../model/constants'
import type { MapState } from '../model/types'

export type MapDerived = {
  width: number
  height: number
  terrain: string
  owned: ReadonlySet<number>
  lost: ReadonlySet<number>
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
  return {
    width,
    height,
    terrain,
    owned,
    lost,
    costs,
    lostAt,
    ownedAt,
    available: credits.available,
  }
}
