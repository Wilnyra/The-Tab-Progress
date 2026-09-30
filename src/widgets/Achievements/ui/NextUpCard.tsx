import { AchievementProgress } from './AchievementProgress'
import { formatProgress, formatRemaining } from './formatAchievement'
import {
  ACHIEVEMENT_FAMILY_LABELS,
  type AchievementState,
} from '@/entities/achievements'

type NextUpCardProps = {
  item: AchievementState
}

const hintOf = (item: AchievementState): string | null => {
  if (item.current > 0) return null
  if (item.family === 'streak') return 'Log progress today to start a streak'
  if (item.family === 'cells')
    return 'Open Progress → Map to claim your first cell'
  return null
}

export const NextUpCard = ({ item }: NextUpCardProps): JSX.Element => {
  const progress = formatProgress(item)
  const hint = hintOf(item)
  const isStreakUnstarted = item.family === 'streak' && item.current === 0

  return (
    <li className="flex flex-col gap-3 rounded-lg bg-primary/5 p-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {ACHIEVEMENT_FAMILY_LABELS[item.family]}
        </p>
        <p className="text-sm font-semibold leading-snug">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {hint ?? item.description}
        </p>
      </div>
      <div className="mt-auto space-y-1.5">
        <p className="text-sm font-semibold tabular-nums">
          {formatRemaining(item)}
        </p>
        {isStreakUnstarted ? null : (
          <AchievementProgress
            value={item.current}
            max={item.target}
            label={`${item.title}: ${progress}`}
            tone="locked"
            className="h-2"
          />
        )}
        <p className="text-xs tabular-nums text-muted-foreground">{progress}</p>
      </div>
    </li>
  )
}
