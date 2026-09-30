import { AchievementCard, type AchievementCardStage } from './AchievementCard'
import {
  FAMILY_NOTES,
  formatFamilyCount,
  formatStreakNote,
} from './formatAchievement'
import {
  ACHIEVEMENT_FAMILY_LABELS,
  type AchievementFamily,
  type AchievementState,
  type AchievementsSummary,
} from '@/entities/achievements'

type AchievementFamilyGroupProps = {
  family: AchievementFamily
  items: AchievementState[]
  summary: AchievementsSummary
}

const stageOf = (
  item: AchievementState,
  index: number,
  nextIndex: number,
): AchievementCardStage => {
  if (item.earnedAt !== null) return 'earned'
  return index === nextIndex ? 'next' : 'later'
}

export const AchievementFamilyGroup = ({
  family,
  items,
  summary,
}: AchievementFamilyGroupProps): JSX.Element => {
  const unlocked = items.filter((item) => item.earnedAt !== null).length
  const nextIndex = items.findIndex((item) => item.earnedAt === null)
  const headingId = `achievements-${family}`
  const note =
    family === 'streak' ? formatStreakNote(summary) : FAMILY_NOTES[family]

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="space-y-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h4 id={headingId} className="text-sm font-medium">
            {ACHIEVEMENT_FAMILY_LABELS[family]}
          </h4>
          <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatFamilyCount(unlocked, items.length)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <AchievementCard
            key={item.id}
            item={item}
            stage={stageOf(item, index, nextIndex)}
          />
        ))}
      </ul>
    </section>
  )
}
