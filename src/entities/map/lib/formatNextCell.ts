import { SECONDS_PER_CELL } from '../model/constants'

export const formatNextCell = (todaySeconds: number): string => {
  const safe = Math.max(0, Math.floor(todaySeconds))
  const remaining = SECONDS_PER_CELL - (safe % SECONDS_PER_CELL)
  return `${Math.max(1, Math.ceil(remaining / 60))}m`
}

export const formatCellCount = (count: number): string =>
  `${count} ${count === 1 ? 'cell' : 'cells'}`
