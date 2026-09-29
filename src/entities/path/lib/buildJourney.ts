import type { PathData } from '../model/types'

export type JourneyMilestone =
  | { kind: 'manual'; id: string; step: string; at: string; dayKey: string }
  | { kind: 'auto'; id: string; step: string; at: string; dayKey: string }

export type JourneyInterval = {
  seconds: number
  activeDays: number
  cells: number
  photos: number
}

export type JourneyItem =
  | { type: 'interval'; id: string; stats: JourneyInterval }
  | { type: 'milestone'; id: string; milestone: JourneyMilestone }
  | { type: 'start'; id: string; at: string; dayKey: string }

export type JourneySummary = {
  startDay: Date
  daysSinceStart: number
  totalSeconds: number
  activeDays: number
  longestStreak: number
  milestones: number
  cells: number
  photos: number
  todosDone: number
}

export type Journey = {
  summary: JourneySummary
  items: JourneyItem[]
}

export type JourneyInput = {
  milestones: PathData[]
  dailyTotals: ReadonlyMap<string, number>
  claimDates: string[]
  photoDates: string[]
  todosDone: number
  now?: Date
}

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_THRESHOLDS = [10, 50, 100, 250, 500, 1000, 2000]
const ACTIVE_DAY_THRESHOLDS = [7, 30, 100, 365, 1000]
const STREAK_THRESHOLDS = [7, 30, 100]
const CELL_THRESHOLDS = [1, 10, 50, 100, 500]

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

const endOfDay = (key: string): string => {
  const date = fromDayKey(key)
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

const nextDayKey = (key: string): string => {
  const date = fromDayKey(key)
  date.setDate(date.getDate() + 1)
  return dayKeyOf(date)
}

const byTimeAsc = (a: string, b: string): number =>
  new Date(a).getTime() - new Date(b).getTime()

const earliestDayKey = (sortedIso: string[]): string | undefined => {
  const first = sortedIso[0]
  return first === undefined ? undefined : dayKeyOf(new Date(first))
}

const pluralize = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

type ActiveDay = { key: string; seconds: number }

const activeDaysAsc = (totals: ReadonlyMap<string, number>): ActiveDay[] =>
  Array.from(totals)
    .filter(([, seconds]) => seconds > 0)
    .map(([key, seconds]) => ({ key, seconds }))
    .sort((a, b) => a.key.localeCompare(b.key))

const autoMilestone = (
  id: string,
  step: string,
  dayKey: string,
  at: string = endOfDay(dayKey),
): JourneyMilestone => ({
  kind: 'auto',
  id: `auto:${id}`,
  step,
  at,
  dayKey,
})

const buildAutoMilestones = (
  days: ActiveDay[],
  claimDates: string[],
): JourneyMilestone[] => {
  const result: JourneyMilestone[] = []

  let cumulative = 0
  let hourIndex = 0
  let streak = 0
  let streakIndex = 0
  let previousKey: string | null = null

  days.forEach((day, index) => {
    cumulative += day.seconds
    while (
      hourIndex < HOUR_THRESHOLDS.length &&
      cumulative >= HOUR_THRESHOLDS[hourIndex] * 3600
    ) {
      const hours = HOUR_THRESHOLDS[hourIndex]
      result.push(
        autoMilestone(`hours-${hours}`, `${hours} hours of progress`, day.key),
      )
      hourIndex += 1
    }

    const count = index + 1
    if (ACTIVE_DAY_THRESHOLDS.includes(count)) {
      result.push(
        autoMilestone(`days-${count}`, `${count} active days`, day.key),
      )
    }

    streak =
      previousKey !== null && nextDayKey(previousKey) === day.key
        ? streak + 1
        : 1
    if (streakIndex < STREAK_THRESHOLDS.length) {
      const target = STREAK_THRESHOLDS[streakIndex]
      if (streak >= target) {
        result.push(
          autoMilestone(`streak-${target}`, `${target}-day streak`, day.key),
        )
        streakIndex += 1
      }
    }
    previousKey = day.key
  })

  const claimsAsc = [...claimDates].sort(byTimeAsc)
  CELL_THRESHOLDS.forEach((threshold) => {
    const at = claimsAsc[threshold - 1]
    if (at === undefined) return
    const step =
      threshold === 1
        ? 'First cell claimed on the map'
        : `${pluralize(threshold, 'cell', 'cells')} claimed on the map`
    result.push(
      autoMilestone(`cells-${threshold}`, step, dayKeyOf(new Date(at)), at),
    )
  })

  return result
}

const longestStreakOf = (days: ActiveDay[]): number => {
  let longest = 0
  let current = 0
  let previousKey: string | null = null
  for (const day of days) {
    current =
      previousKey !== null && nextDayKey(previousKey) === day.key
        ? current + 1
        : 1
    longest = Math.max(longest, current)
    previousKey = day.key
  }
  return longest
}

const countBetween = (
  sortedIso: string[],
  fromMs: number,
  toMs: number,
  includeFrom: boolean,
): number =>
  sortedIso.filter((iso) => {
    const t = new Date(iso).getTime()
    return (includeFrom ? t >= fromMs : t > fromMs) && t <= toMs
  }).length

const intervalStats = (
  days: ActiveDay[],
  claimsAsc: string[],
  photosAsc: string[],
  older: { at: string; dayKey: string },
  newer: { at: string; dayKey: string },
  includeOlder: boolean,
): JourneyInterval => {
  const inRange = days.filter(
    (day) =>
      (includeOlder ? day.key >= older.dayKey : day.key > older.dayKey) &&
      day.key <= newer.dayKey,
  )
  const fromMs = new Date(older.at).getTime()
  const toMs = new Date(newer.at).getTime()
  return {
    seconds: inRange.reduce((sum, day) => sum + day.seconds, 0),
    activeDays: inRange.length,
    cells: countBetween(claimsAsc, fromMs, toMs, includeOlder),
    photos: countBetween(photosAsc, fromMs, toMs, includeOlder),
  }
}

export const buildJourney = ({
  milestones,
  dailyTotals,
  claimDates,
  photoDates,
  todosDone,
  now = new Date(),
}: JourneyInput): Journey | null => {
  const days = activeDaysAsc(dailyTotals)
  const manual: JourneyMilestone[] = milestones.map((row) => ({
    kind: 'manual',
    id: row.id,
    step: row.step,
    at: row.created_at,
    dayKey: dayKeyOf(new Date(row.created_at)),
  }))

  const claimsAsc = [...claimDates].sort(byTimeAsc)
  const photosAsc = [...photoDates].sort(byTimeAsc)

  const firstDayKey = [
    days[0]?.key,
    ...manual.map((m) => m.dayKey),
    earliestDayKey(claimsAsc),
    earliestDayKey(photosAsc),
  ]
    .filter((key): key is string => key !== undefined)
    .sort()[0]
  if (firstDayKey === undefined) return null

  const nowMs = now.getTime()
  const clampToNow = (milestone: JourneyMilestone): JourneyMilestone =>
    milestone.kind === 'auto' && new Date(milestone.at).getTime() > nowMs
      ? { ...milestone, at: now.toISOString() }
      : milestone

  const all = [...manual, ...buildAutoMilestones(days, claimsAsc)]
    .map((milestone, index) => ({ milestone: clampToNow(milestone), index }))
    .sort(
      (a, b) =>
        new Date(b.milestone.at).getTime() -
          new Date(a.milestone.at).getTime() || b.index - a.index,
    )
    .map(({ milestone }) => milestone)

  const start = {
    at: fromDayKey(firstDayKey).toISOString(),
    dayKey: firstDayKey,
  }
  const today = { at: now.toISOString(), dayKey: dayKeyOf(now) }

  const points: Array<{ at: string; dayKey: string }> = [today, ...all, start]
  const items: JourneyItem[] = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const newer = points[i]
    const older = points[i + 1]
    const isLast = i + 1 === points.length - 1
    items.push({
      type: 'interval',
      id: `interval:${i}`,
      stats: intervalStats(days, claimsAsc, photosAsc, older, newer, isLast),
    })
    const milestone = all[i]
    if (milestone !== undefined) {
      items.push({ type: 'milestone', id: milestone.id, milestone })
    }
  }
  items.push({ type: 'start', id: 'start', at: start.at, dayKey: firstDayKey })

  const startDay = fromDayKey(firstDayKey)
  const todayStart = fromDayKey(today.dayKey)

  return {
    summary: {
      startDay,
      daysSinceStart:
        Math.round((todayStart.getTime() - startDay.getTime()) / DAY_MS) + 1,
      totalSeconds: days.reduce((sum, day) => sum + day.seconds, 0),
      activeDays: days.length,
      longestStreak: longestStreakOf(days),
      milestones: manual.length,
      cells: claimDates.length,
      photos: photoDates.length,
      todosDone,
    },
    items,
  }
}
