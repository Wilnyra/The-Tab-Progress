export type AchievementFamily = 'hours' | 'activeDays' | 'streak' | 'cells'

export type AchievementDef = {
  id: string
  family: AchievementFamily
  threshold: number
  title: string
  shortTitle: string
  description: string
}

export const ACHIEVEMENT_FAMILIES: readonly AchievementFamily[] = [
  'hours',
  'activeDays',
  'streak',
  'cells',
]

export const ACHIEVEMENT_FAMILY_LABELS: Record<AchievementFamily, string> = {
  hours: 'Hours logged',
  activeDays: 'Active days',
  streak: 'Streaks',
  cells: 'Territory map',
}

const HOUR_THRESHOLDS = [10, 50, 100, 250, 500, 1000, 2000]
const ACTIVE_DAY_THRESHOLDS = [7, 30, 100, 365, 1000]
const STREAK_THRESHOLDS = [7, 30, 100]
const CELL_THRESHOLDS = [1, 10, 50, 100, 500]

const hourDefs = HOUR_THRESHOLDS.map(
  (hours): AchievementDef => ({
    id: `hours-${hours}`,
    family: 'hours',
    threshold: hours,
    title: `${hours} hours of progress`,
    shortTitle: `${hours} hours`,
    description: `Log ${hours} hours of progress in total`,
  }),
)

const activeDayDefs = ACTIVE_DAY_THRESHOLDS.map(
  (days): AchievementDef => ({
    id: `days-${days}`,
    family: 'activeDays',
    threshold: days,
    title: `${days} active days`,
    shortTitle: `${days} days`,
    description: `Log progress on ${days} different days`,
  }),
)

const streakDefs = STREAK_THRESHOLDS.map(
  (days): AchievementDef => ({
    id: `streak-${days}`,
    family: 'streak',
    threshold: days,
    title: `${days}-day streak`,
    shortTitle: `${days}-day streak`,
    description: `Log progress ${days} days in a row`,
  }),
)

const cellDefs = CELL_THRESHOLDS.map(
  (cells): AchievementDef => ({
    id: `cells-${cells}`,
    family: 'cells',
    threshold: cells,
    title:
      cells === 1
        ? 'First cell claimed on the map'
        : `${cells} cells claimed on the map`,
    shortTitle: cells === 1 ? 'First cell' : `${cells} cells`,
    description:
      cells === 1
        ? 'Claim your first cell on the territory map'
        : `Claim ${cells} cells on the territory map`,
  }),
)

export const ACHIEVEMENT_CATALOG: readonly AchievementDef[] = [
  ...hourDefs,
  ...activeDayDefs,
  ...streakDefs,
  ...cellDefs,
]
