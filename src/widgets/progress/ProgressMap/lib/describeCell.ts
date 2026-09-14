import { formatCellCount, type MapDerived } from '@/entities/map'

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'an earlier day'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const describeCell = (derived: MapDerived, index: number): string => {
  const char = derived.terrain[index]
  if (char === undefined) return ''
  if (char === 'w') return 'Water'

  const cost = derived.costs[index] ?? 1
  const lostAt = derived.lostAt.get(index)
  if (lostAt !== undefined) {
    return `Lost on ${formatDate(lostAt)} · Restore for ${cost}`
  }

  const ownedAt = derived.ownedAt.get(index)
  if (ownedAt !== undefined) {
    return `Yours · claimed ${formatDate(ownedAt)}`
  }

  const label = char === 'h' ? 'Hard cell' : 'Land'
  return `${label} · ${formatCellCount(cost)}`
}
