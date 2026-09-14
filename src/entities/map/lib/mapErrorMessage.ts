export const MAP_ERROR_COPY = {
  notAdjacent: 'Pick a cell next to your territory',
  notEnough: 'Not enough cells yet',
  water: "That's water",
  alreadyOwned: 'Already yours',
  cannotUndo: 'Too late to undo',
  fallback: 'Something went wrong. Try again.',
} as const

// Keys are the exact exception texts raised by the map_* functions.
const SERVER_COPY: Readonly<Record<string, string>> = {
  'not adjacent': MAP_ERROR_COPY.notAdjacent,
  'not enough cells': MAP_ERROR_COPY.notEnough,
  water: MAP_ERROR_COPY.water,
  'already owned': MAP_ERROR_COPY.alreadyOwned,
  'cannot undo': MAP_ERROR_COPY.cannotUndo,
  'out of bounds': 'That cell is off the map',
  'not authenticated': 'Please sign in again',
  'invalid timezone': 'Could not read your timezone',
  'invalid terrain': 'Could not create your map',
  'terrain required': 'Could not open your map',
}

export const mapErrorMessage = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  const text = raw.trim().toLowerCase()
  const known = Object.keys(SERVER_COPY).find(
    (token) => text === token || text.startsWith(`${token}:`),
  )
  return known === undefined ? MAP_ERROR_COPY.fallback : SERVER_COPY[known]
}
