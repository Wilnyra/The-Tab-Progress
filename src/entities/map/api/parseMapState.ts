import type { MapCell, MapEventKind, MapState } from '../model/types'

const TERRAIN_PATTERN = /^[lwh]+$/

const fail: (detail: string) => never = (detail) => {
  throw new Error(`invalid map state: ${detail}`)
}

const isEventKind = (value: string): value is MapEventKind =>
  value === 'claim' || value === 'restore' || value === 'lose'

const asRecord = (value: unknown, path: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(`${path} is not an object`)
  }
  return value as Record<string, unknown>
}

const asNumber = (
  source: Record<string, unknown>,
  key: string,
  path: string,
): number => {
  const value = source[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${path}.${key} is not a number`)
  }
  return value
}

const asString = (
  source: Record<string, unknown>,
  key: string,
  path: string,
): string => {
  const value = source[key]
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${path}.${key} is not a string`)
  }
  return value
}

const parseCell = (value: unknown, index: number): MapCell => {
  const path = `cells[${index}]`
  const raw = asRecord(value, path)
  const kind = asString(raw, 'kind', path)
  if (!isEventKind(kind)) fail(`${path}.kind is unknown`)
  return {
    x: asNumber(raw, 'x', path),
    y: asNumber(raw, 'y', path),
    kind,
    cost: asNumber(raw, 'cost', path),
    eventId: asNumber(raw, 'eventId', path),
    createdAt: asString(raw, 'createdAt', path),
  }
}

export const parseMapState = (value: unknown): MapState => {
  const root = asRecord(value, 'state')
  const profileRaw = asRecord(root.profile, 'profile')
  const creditsRaw = asRecord(root.credits, 'credits')

  const width = asNumber(profileRaw, 'width', 'profile')
  const height = asNumber(profileRaw, 'height', 'profile')
  const terrain = asString(profileRaw, 'terrain', 'profile')
  if (terrain.length !== width * height || !TERRAIN_PATTERN.test(terrain)) {
    fail('profile.terrain does not match the grid')
  }

  const cellsRaw: unknown = root.cells
  if (!Array.isArray(cellsRaw)) fail('cells is not an array')

  const cells = cellsRaw.map(parseCell)
  for (const cell of cells) {
    if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) {
      fail('a cell is outside the grid')
    }
  }

  return {
    profile: {
      width,
      height,
      terrain,
      startedAt: asString(profileRaw, 'startedAt', 'profile'),
      decayCursor: asString(profileRaw, 'decayCursor', 'profile'),
    },
    credits: {
      earned: asNumber(creditsRaw, 'earned', 'credits'),
      spent: asNumber(creditsRaw, 'spent', 'credits'),
      available: asNumber(creditsRaw, 'available', 'credits'),
      todaySeconds: asNumber(creditsRaw, 'todaySeconds', 'credits'),
    },
    cells,
  }
}
