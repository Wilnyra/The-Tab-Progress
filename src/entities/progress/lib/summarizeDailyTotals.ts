import { localDayKey } from './localDayKey'

const DAY_MS = 24 * 60 * 60 * 1000

export type DailyTotalsSummary = {
  activeDays: number
  firstDay: Date
  daysSinceStart: number
  longestStreak: number
}

const fromDayKey = (key: string): Date => {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const nextDayKey = (key: string): string => {
  const date = fromDayKey(key)
  date.setDate(date.getDate() + 1)
  return localDayKey(date)
}

export const summarizeDailyTotals = (
  totals: ReadonlyMap<string, number>,
  now: Date = new Date(),
): DailyTotalsSummary | null => {
  const activeKeys = Array.from(totals)
    .filter(([, seconds]) => seconds > 0)
    .map(([key]) => key)
    .sort()

  const firstKey = activeKeys[0]
  if (firstKey === undefined) return null

  let longestStreak = 0
  let currentStreak = 0
  let previousKey: string | null = null
  for (const key of activeKeys) {
    currentStreak =
      previousKey !== null && nextDayKey(previousKey) === key
        ? currentStreak + 1
        : 1
    longestStreak = Math.max(longestStreak, currentStreak)
    previousKey = key
  }

  const firstDay = fromDayKey(firstKey)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const elapsedMs = today.getTime() - firstDay.getTime()

  return {
    activeDays: activeKeys.length,
    firstDay,
    daysSinceStart: Math.round(elapsedMs / DAY_MS) + 1,
    longestStreak,
  }
}
