import type { ProgressData } from '../model/types'

export type TrendData = {
  direction: 'up' | 'down' | 'stable'
  percentageChange: number
  currentStreak: number
  averageLast7Days: number
  currentValue: number
}

export type TrendLinePoint = {
  created_at: string
  trendValue: number
}

/**
 * Identifies consecutive daily progress streaks.
 * Improved version using unique dates to handle multiple entries per day.
 * Similar to getLastQueueArray but returns all streaks, not just the last one.
 */
const identifyStreaks = (data: ProgressData[]): ProgressData[][] => {
  if (data.length === 0) return []

  const sorted = [...data].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return aTime - bTime
  })

  const uniqueDates = Array.from(
    new Set(sorted.map((d) => d.created_at.split('T')[0])),
  )

  const dates = uniqueDates.map((d) => new Date(d + 'T00:00:00'))
  const streaks: ProgressData[][] = []
  let streakStartDate = uniqueDates[0]

  for (let i = 1; i < dates.length; i++) {
    const curr = dates[i]
    const prev = dates[i - 1]
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays !== 1) {
      const streakData = sorted.filter((item) => {
        const dateOnly = item.created_at.split('T')[0]
        return dateOnly >= streakStartDate && dateOnly < uniqueDates[i]
      })
      if (streakData.length > 0) {
        streaks.push(streakData)
      }
      streakStartDate = uniqueDates[i]
    }
  }

  const lastStreakData = sorted.filter((item) => {
    const dateOnly = item.created_at.split('T')[0]
    return dateOnly >= streakStartDate
  })
  if (lastStreakData.length > 0) {
    streaks.push(lastStreakData)
  }

  return streaks
}

/**
 * Calculates Exponential Moving Average (EMA) for a single streak.
 * EMA formula: EMA(t) = α × Value(t) + (1 - α) × EMA(t-1)
 *
 * Handles multiple entries per day by using daily aggregates.
 *
 * @param streak - Consecutive progress data points
 * @param alpha - Smoothing factor (0-1). Lower = smoother, Higher = responsive
 */
const calculateEMAForStreak = (
  streak: ProgressData[],
  alpha: number,
): TrendLinePoint[] => {
  if (streak.length === 0) return []

  const dailyMap = new Map<string, number>()

  for (const item of streak) {
    const dateOnly = item.created_at.split('T')[0]
    const existing = dailyMap.get(dateOnly) || 0
    dailyMap.set(dateOnly, Math.max(existing, item.value))
  }

  const dailyData = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }))

  const result: TrendLinePoint[] = []
  let ema = dailyData[0].value

  const firstDayData = streak.filter(
    (item) => item.created_at.split('T')[0] === dailyData[0].date,
  )
  for (const item of firstDayData) {
    result.push({
      created_at: item.created_at,
      trendValue: ema,
    })
  }

  for (let i = 1; i < dailyData.length; i++) {
    ema = alpha * dailyData[i].value + (1 - alpha) * ema

    const dayData = streak.filter(
      (item) => item.created_at.split('T')[0] === dailyData[i].date,
    )
    for (const item of dayData) {
      result.push({
        created_at: item.created_at,
        trendValue: ema,
      })
    }
  }

  return result
}

/**
 * Calculates smooth trend line using EMA with streak-aware resets.
 *
 * Algorithm:
 * 1. Identifies consecutive daily streaks (gaps break continuity)
 * 2. Applies EMA smoothing within each streak
 * 3. Resets EMA at streak boundaries (no interpolation across gaps)
 *
 * @param data - Progress data points
 * @param alpha - EMA smoothing factor (default: 0.15 ≈ 13-day period)
 *   - 0.10 = Very smooth (≈19-day period)
 *   - 0.15 = Balanced (≈13-day period) - Recommended
 *   - 0.20 = Responsive (≈9-day period)
 *   - 0.30 = Very responsive (≈6-day period)
 *
 * @returns Trend line points matching input data timestamps
 */
export const calculateTrendLine = (
  data: ProgressData[],
  alpha: number = 0.15,
): TrendLinePoint[] => {
  if (data.length < 2) return []

  const streaks = identifyStreaks(data)
  const allTrendPoints: TrendLinePoint[] = []

  for (const streak of streaks) {
    const streakTrend = calculateEMAForStreak(streak, alpha)
    allTrendPoints.push(...streakTrend)
  }

  return allTrendPoints
}

export const calculateTrend = (data: ProgressData[]): TrendData | null => {
  if (data.length === 0) {
    return null
  }

  const sortedData = [...data].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return bTime - aTime
  })

  const currentValue = sortedData[0]?.value || 0
  const last7Days = sortedData.slice(0, 7)
  const averageLast7Days =
    last7Days.reduce((sum, item) => sum + item.value, 0) / last7Days.length

  let percentageChange = 0
  if (sortedData.length > 1) {
    const previousValue = sortedData[1]?.value || 0
    if (previousValue > 0) {
      percentageChange = ((currentValue - previousValue) / previousValue) * 100
    }
  }

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (percentageChange > 5) {
    direction = 'up'
  } else if (percentageChange < -5) {
    direction = 'down'
  }

  const currentStreak = calculateStreak(sortedData)

  return {
    direction,
    percentageChange,
    currentStreak,
    averageLast7Days,
    currentValue,
  }
}

const calculateStreak = (sortedData: ProgressData[]): number => {
  if (sortedData.length === 0) return 0

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const mostRecentDate = new Date(sortedData[0].created_at)
  mostRecentDate.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (daysDiff > 1) return 0
  if (daysDiff === 1) return 0

  for (let i = 1; i < sortedData.length; i++) {
    const currentDate = new Date(sortedData[i - 1].created_at)
    currentDate.setHours(0, 0, 0, 0)

    const prevDate = new Date(sortedData[i].created_at)
    prevDate.setHours(0, 0, 0, 0)

    const diff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
