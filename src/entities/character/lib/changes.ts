import { CATALOG, ROOM } from '../model/catalog'
import type { CatalogEntry, NextChange, StreakOptions } from '../model/types'
import { clampDay } from './math'

type Change = { day: number; label: string }

const ALL_CHANGES: readonly Change[] = [
  ...CATALOG.map((c) => ({ day: c.day, label: c.text })),
  ...ROOM.map((r) => ({ day: r.day, label: r.text })),
]

const earnedDay = (streakDays: number, opts: StreakOptions): number =>
  Math.max(clampDay(streakDays), clampDay(opts.bestStreak ?? 0))

/** Latest person-catalog entry reached on this day. */
export const getChange = (day: number): CatalogEntry => {
  const reached = CATALOG.filter((c) => c.day <= clampDay(day))
  return reached[reached.length - 1] ?? CATALOG[0]
}

/** Next unlock after everything already earned (a break never shows
 * items you already have). */
export const getNextChange = (
  streakDays: number,
  opts: StreakOptions = {},
): NextChange | null => {
  const n = earnedDay(streakDays, opts)
  const next = ALL_CHANGES.filter((c) => c.day > n).sort(
    (a, b) => a.day - b.day,
  )
  const first = next[0]
  if (!first) return null
  const label = next
    .filter((c) => c.day === first.day)
    .map((c) => c.label)
    .join(' · ')
  return { day: first.day, label, inDays: first.day - n }
}

/** What unlocked exactly on the earned day (person + room), or null.
 * Day 0 is the starting look, not a change. */
export const getTodayChange = (
  streakDays: number,
  opts: StreakOptions = {},
): string | null => {
  const n = earnedDay(streakDays, opts)
  if (n === 0) return null
  const today = ALL_CHANGES.filter((c) => c.day === n)
  return today.length ? today.map((c) => c.label).join(' · ') : null
}

/** Short card caption: today's change, else the next one. */
export const getStreakCaption = (
  streakDays: number,
  opts: StreakOptions = {},
): string => {
  const today = getTodayChange(streakDays, opts)
  if (today) return `New today: ${today}`
  const next = getNextChange(streakDays, opts)
  if (!next) return 'Every milestone reached. Keep going at your pace.'
  const unit = next.inDays === 1 ? 'day' : 'days'
  return `Next: ${next.label}, in ${next.inDays} ${unit}`
}
