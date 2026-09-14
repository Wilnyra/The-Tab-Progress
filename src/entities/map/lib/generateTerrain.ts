import { MAP_CELL_COUNT, MAP_HEIGHT, MAP_WIDTH } from '../model/constants'
import { countHardIslands, largestLandComponent } from './largestLandComponent'

const WATER_TARGET = Math.round(MAP_CELL_COUNT * 0.12)
const WATER_MIN = Math.ceil(MAP_CELL_COUNT * 0.08)
const WATER_MAX = Math.floor(MAP_CELL_COUNT * 0.2)
const WATER_SEEDS = 12

const HARD_MIN = Math.ceil(MAP_CELL_COUNT * 0.01)
const HARD_MAX = Math.floor(MAP_CELL_COUNT * 0.03)
const HARD_ISLANDS = 7
const HARD_ISLAND_MIN = 3
const HARD_ISLAND_MAX = 6
const ISLANDS_MIN = 6
const ISLANDS_MAX = 8

const MAX_ATTEMPTS = 32

type Random = () => number

const hashSeed = (value: string): number => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRandom = (seed: number): Random => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (random: Random, length: number): number =>
  Math.min(length - 1, Math.floor(random() * length))

const neighboursOf = (index: number): number[] => {
  const x = index % MAP_WIDTH
  const y = Math.floor(index / MAP_WIDTH)
  const result: number[] = []
  if (x > 0) result.push(index - 1)
  if (x < MAP_WIDTH - 1) result.push(index + 1)
  if (y > 0) result.push(index - MAP_WIDTH)
  if (y < MAP_HEIGHT - 1) result.push(index + MAP_WIDTH)
  return result
}

const growCluster = (
  random: Random,
  taken: Set<number>,
  frontier: number[],
  limit: number,
): void => {
  let guard = 0
  const maxSteps = limit * 40 + 64
  while (taken.size < limit && frontier.length > 0 && guard < maxSteps) {
    guard += 1
    const at = pick(random, frontier.length)
    const free = neighboursOf(frontier[at]).filter(
      (candidate) => !taken.has(candidate),
    )
    if (free.length === 0) {
      frontier.splice(at, 1)
      continue
    }
    const next = free[pick(random, free.length)]
    taken.add(next)
    frontier.push(next)
  }
}

const buildWater = (random: Random): Set<number> => {
  const water = new Set<number>()
  const frontier: number[] = []
  for (let seed = 0; seed < WATER_SEEDS; seed += 1) {
    const index = pick(random, MAP_CELL_COUNT)
    if (water.has(index)) continue
    water.add(index)
    frontier.push(index)
  }
  growCluster(random, water, frontier, WATER_TARGET)
  return water
}

const buildHard = (random: Random, water: ReadonlySet<number>): Set<number> => {
  const hard = new Set<number>()
  for (let island = 0; island < HARD_ISLANDS; island += 1) {
    let start = -1
    for (let tries = 0; tries < 64 && start < 0; tries += 1) {
      const candidate = pick(random, MAP_CELL_COUNT)
      if (!water.has(candidate) && !hard.has(candidate)) start = candidate
    }
    if (start < 0) continue
    const span =
      HARD_ISLAND_MIN + pick(random, HARD_ISLAND_MAX - HARD_ISLAND_MIN + 1)
    const blocked = new Set<number>([...water, ...hard])
    const cluster = new Set<number>([start])
    blocked.add(start)
    const frontier = [start]
    let guard = 0
    while (cluster.size < span && frontier.length > 0 && guard < span * 24) {
      guard += 1
      const at = pick(random, frontier.length)
      const free = neighboursOf(frontier[at]).filter(
        (candidate) => !blocked.has(candidate),
      )
      if (free.length === 0) {
        frontier.splice(at, 1)
        continue
      }
      const next = free[pick(random, free.length)]
      blocked.add(next)
      cluster.add(next)
      frontier.push(next)
    }
    for (const index of cluster) hard.add(index)
  }
  return hard
}

const isValid = (terrain: string): boolean => {
  let water = 0
  let hard = 0
  for (const char of terrain) {
    if (char === 'w') water += 1
    else if (char === 'h') hard += 1
  }
  if (water < WATER_MIN || water > WATER_MAX) return false
  if (hard < HARD_MIN || hard > HARD_MAX) return false
  if (MAP_CELL_COUNT - water - hard < 1) return false

  const islands = countHardIslands(terrain, MAP_WIDTH, MAP_HEIGHT)
  return islands >= ISLANDS_MIN && islands <= ISLANDS_MAX
}

// Keeps a single 4-connected landmass: pockets cut off by water would let a
// first claim land somewhere it can never grow from.
const drownPockets = (cells: string[]): void => {
  const main = largestLandComponent(cells.join(''), MAP_WIDTH, MAP_HEIGHT)
  for (let index = 0; index < cells.length; index += 1) {
    if (cells[index] !== 'w' && !main.has(index)) cells[index] = 'w'
  }
}

export const generateTerrain = (userId: string): string => {
  const base = hashSeed(userId)
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const random = createRandom((base + attempt * 0x9e3779b9) >>> 0)
    const water = buildWater(random)
    const hard = buildHard(random, water)

    const cells = new Array<string>(MAP_CELL_COUNT).fill('l')
    for (const index of water) cells[index] = 'w'
    for (const index of hard) cells[index] = 'h'
    drownPockets(cells)

    const terrain = cells.join('')
    if (isValid(terrain)) return terrain
  }
  throw new Error('could not generate a valid map terrain')
}
