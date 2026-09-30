import type {
  AchievementFamily,
  AchievementState,
} from '@/entities/achievements'

export const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`

const UNIT: Record<AchievementFamily, [string, string]> = {
  hours: ['h', 'h'],
  activeDays: [' day', ' days'],
  streak: [' day', ' days'],
  cells: [' cell', ' cells'],
}

const unitOf = (family: AchievementFamily, count: number): string => {
  const [one, many] = UNIT[family]
  return count === 1 ? one : many
}

export const formatProgress = (item: AchievementState): string => {
  const current = Math.min(Math.floor(item.current), item.target)
  const pair = `${current} / ${item.target}${unitOf(item.family, item.target)}`
  return item.family === 'streak' ? `Current streak ${pair}` : pair
}

export const formatRemaining = (item: AchievementState): string => {
  const remaining = Math.max(Math.ceil(item.target - item.current), 0)
  return `${remaining}${unitOf(item.family, remaining)} to go`
}

export const formatFamilyCount = (unlocked: number, total: number): string =>
  unlocked === total ? `All ${total} earned` : `${unlocked} of ${total}`

type StreakNote = {
  currentStreak: number
  longestStreak: number
}

export const formatStreakNote = ({
  currentStreak,
  longestStreak,
}: StreakNote): string =>
  `Current streak: ${plural(currentStreak, 'day', 'days')} · ` +
  `Best: ${plural(longestStreak, 'day', 'days')}`

export const FAMILY_NOTES: Record<
  Exclude<AchievementFamily, 'streak'>,
  string
> = {
  hours: 'Total time logged across all your progress.',
  activeDays: 'Days with at least some progress logged.',
  cells: 'Claim cells on the Map tab of the Progress page.',
}
