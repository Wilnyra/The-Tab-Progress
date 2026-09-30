import type { PathData } from '../model/types'
import {
  activeDaysAsc,
  computeAchievements,
  type ActiveDay,
  type AchievementFamily,
  type AchievementState,
} from '@/entities/achievements'

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

const FAMILY_RANK: Record<AchievementFamily, number> = {
  hours: 0,
  activeDays: 1,
  streak: 2,
  cells: 3,
}

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

const byTimeAsc = (a: string, b: string): number =>
  new Date(a).getTime() - new Date(b).getTime()

const earliestDayKey = (sortedIso: string[]): string | undefined => {
  const first = sortedIso[0]
  return first === undefined ? undefined : dayKeyOf(new Date(first))
}

type EarnedAchievement = {
  item: AchievementState
  at: string
  dayKey: string
}

const walkOrder = (a: EarnedAchievement, b: EarnedAchievement): number => {
  const byRank = FAMILY_RANK[a.item.family] - FAMILY_RANK[b.item.family]
  const byThreshold = a.item.threshold - b.item.threshold
  if (a.item.family === 'cells' || b.item.family === 'cells') {
    return byRank || byThreshold
  }
  return a.dayKey.localeCompare(b.dayKey) || byRank || byThreshold
}

const toAutoMilestones = (items: AchievementState[]): JourneyMilestone[] =>
  items
    .flatMap((item): EarnedAchievement[] =>
      item.earnedAt === null || item.earnedDayKey === null
        ? []
        : [{ item, at: item.earnedAt, dayKey: item.earnedDayKey }],
    )
    .sort(walkOrder)
    .map(
      ({ item, at, dayKey }): JourneyMilestone => ({
        kind: 'auto',
        id: `auto:${item.id}`,
        step: item.title,
        at,
        dayKey,
      }),
    )

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

  const achievements = computeAchievements({
    dailyTotals,
    claimDates: claimsAsc,
    now,
  })
  const auto = toAutoMilestones(achievements.items)
  const all = [...manual, ...auto]
    .map((milestone, index) => ({ milestone, index }))
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
      longestStreak: achievements.summary.longestStreak,
      milestones: manual.length,
      cells: claimDates.length,
      photos: photoDates.length,
      todosDone,
    },
    items,
  }
}
