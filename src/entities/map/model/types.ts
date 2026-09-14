export type MapEventKind = 'claim' | 'restore' | 'lose'

export type MapCell = {
  x: number
  y: number
  kind: MapEventKind
  cost: number
  eventId: number
  createdAt: string
}

export type MapProfile = {
  width: number
  height: number
  terrain: string
  startedAt: string
  decayCursor: string
}

export type MapCredits = {
  earned: number
  spent: number
  available: number
  todaySeconds: number
}

export type MapState = {
  profile: MapProfile
  credits: MapCredits
  cells: MapCell[]
}

export type MapCellAction =
  | { kind: 'claim'; cost: number }
  | { kind: 'restore'; cost: number }
  | { kind: 'blocked'; reason: string }

export type MapActionResult =
  | { ok: true; state: MapState }
  | { ok: false; message: string }
