import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_FAMILIES,
  type AchievementDef,
  type AchievementFamily,
} from '../model/catalog'

const SECONDS_PER_HOUR = 3600

export type AchievementInput = {
  dailyTotals: ReadonlyMap<string, number>
  claimDates: string[]
  now?: Date
}

export type AchievementState = AchievementDef & {
  earnedAt: string | null
  earnedDayKey: string | null
  current: number
  target: number
}

export type AchievementsSummary = {
  unlocked: number
  total: number
  longestStreak: number
  currentStreak: number
}

export type AchievementsResult = {
  items: AchievementState[]
  summary: AchievementsSummary
}

type Earned = { at: string; dayKey: string }

export type ActiveDay = { key: string; seconds: number }

const dayKeyOf = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fromDayKey = (key: string): Date => {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const shiftDayKey = (key: string, days: number): string => {
  const date = fromDayKey(key)
  date.setDate(date.getDate() + days)
  return dayKeyOf(date)
}

const endOfDay = (key: string): string => {
  const date = fromDayKey(key)
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

const byTimeAsc = (a: string, b: string): number =>
  new Date(a).getTime() - new Date(b).getTime()

export const activeDaysAsc = (
  totals: ReadonlyMap<string, number>,
): ActiveDay[] =>
  Array.from(totals)
    .filter(([, seconds]) => seconds > 0)
    .map(([key, seconds]) => ({ key, seconds }))
    .sort((a, b) => a.key.localeCompare(b.key))

const defsOf = (family: AchievementFamily): AchievementDef[] =>
  ACHIEVEMENT_CATALOG.filter((def) => def.family === family)

const walkDays = (days: ActiveDay[]): Map<string, Earned> => {
  const earned = new Map<string, Earned>()
  const hourDefs = defsOf('hours')
  const dayDefs = defsOf('activeDays')
  const streakDefs = defsOf('streak')

  let cumulative = 0
  let hourIndex = 0
  let streak = 0
  let streakIndex = 0
  let previousKey: string | null = null

  days.forEach((day, index) => {
    const mark = (def: AchievementDef): void => {
      earned.set(def.id, { at: endOfDay(day.key), dayKey: day.key })
    }

    cumulative += day.seconds
    while (
      hourIndex < hourDefs.length &&
      cumulative >= hourDefs[hourIndex].threshold * SECONDS_PER_HOUR
    ) {
      mark(hourDefs[hourIndex])
      hourIndex += 1
    }

    const dayDef = dayDefs.find((def) => def.threshold === index + 1)
    if (dayDef !== undefined) mark(dayDef)

    streak =
      previousKey !== null && shiftDayKey(previousKey, 1) === day.key
        ? streak + 1
        : 1
    const streakDef: AchievementDef | undefined = streakDefs[streakIndex]
    if (streakDef !== undefined && streak >= streakDef.threshold) {
      mark(streakDef)
      streakIndex += 1
    }
    previousKey = day.key
  })

  return earned
}

const walkClaims = (claimsAsc: string[]): Map<string, Earned> => {
  const earned = new Map<string, Earned>()
  defsOf('cells').forEach((def) => {
    const at: string | undefined = claimsAsc[def.threshold - 1]
    if (at === undefined) return
    earned.set(def.id, { at, dayKey: dayKeyOf(new Date(at)) })
  })
  return earned
}

const longestStreakOf = (days: ActiveDay[]): number => {
  let longest = 0
  let current = 0
  let previousKey: string | null = null
  for (const day of days) {
    current =
      previousKey !== null && shiftDayKey(previousKey, 1) === day.key
        ? current + 1
        : 1
    longest = Math.max(longest, current)
    previousKey = day.key
  }
  return longest
}

const currentStreakOf = (days: ActiveDay[], now: Date): number => {
  const active = new Set(days.map((day) => day.key))
  const today = dayKeyOf(now)
  let cursor = active.has(today) ? today : shiftDayKey(today, -1)
  let streak = 0
  while (active.has(cursor)) {
    streak += 1
    cursor = shiftDayKey(cursor, -1)
  }
  return streak
}

export const computeAchievements = ({
  dailyTotals,
  claimDates,
  now = new Date(),
}: AchievementInput): AchievementsResult => {
  const days = activeDaysAsc(dailyTotals)
  const claimsAsc = [...claimDates].sort(byTimeAsc)
  const earned = new Map([...walkDays(days), ...walkClaims(claimsAsc)])
  const nowMs = now.getTime()

  const totalSeconds = days.reduce((sum, day) => sum + day.seconds, 0)
  const currentStreak = currentStreakOf(days, now)
  const currentByFamily: Record<AchievementFamily, number> = {
    hours: totalSeconds / SECONDS_PER_HOUR,
    activeDays: days.length,
    streak: currentStreak,
    cells: claimsAsc.length,
  }

  const items = ACHIEVEMENT_CATALOG.map((def): AchievementState => {
    const hit = earned.get(def.id)
    const earnedAt =
      hit === undefined
        ? null
        : new Date(hit.at).getTime() > nowMs
          ? now.toISOString()
          : hit.at
    return {
      ...def,
      earnedAt,
      earnedDayKey: hit?.dayKey ?? null,
      current: currentByFamily[def.family],
      target: def.threshold,
    }
  })

  return {
    items,
    summary: {
      unlocked: items.filter((item) => item.earnedAt !== null).length,
      total: items.length,
      longestStreak: longestStreakOf(days),
      currentStreak,
    },
  }
}

export const nextInFamily = (
  items: readonly AchievementState[],
): AchievementState[] =>
  ACHIEVEMENT_FAMILIES.map((family) =>
    items.find((item) => item.family === family && item.earnedAt === null),
  ).filter((item): item is AchievementState => item !== undefined)
