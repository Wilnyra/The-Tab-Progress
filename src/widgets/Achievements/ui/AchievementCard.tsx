import { Award, Lock } from 'lucide-react'
import { AchievementProgress } from './AchievementProgress'
import { formatFullDate, formatProgress } from './formatAchievement'
import type { AchievementState } from '@/entities/achievements'
import { cn } from '@/shared/lib/cn'

export type AchievementCardStage = 'earned' | 'next' | 'later'

type AchievementCardProps = {
  item: AchievementState
  stage: AchievementCardStage
}

type LockedMetaProps = {
  item: AchievementState
  isMuted: boolean
}

const EarnedMeta = ({ earnedAt }: { earnedAt: string }): JSX.Element => (
  <p className="text-xs font-medium text-gold-dark dark:text-gold-light">
    Earned · {formatFullDate(earnedAt)}
  </p>
)

const LockedMeta = ({ item, isMuted }: LockedMetaProps): JSX.Element => {
  const progress = formatProgress(item)
  return (
    <div className="space-y-1.5">
      <AchievementProgress
        value={item.current}
        max={item.target}
        label={`${item.title}: ${progress}`}
        tone={isMuted ? 'muted' : 'locked'}
      />
      <p className="text-xs tabular-nums text-muted-foreground">{progress}</p>
    </div>
  )
}

const CARD_CLASSES: Record<AchievementCardStage, string> = {
  earned:
    'border-gold/45 bg-gradient-to-br from-gold-light/15 to-gold/10 ' +
    'shadow-sm dark:from-gold-light/10 dark:to-gold/5',
  next: 'border-primary/40 bg-muted/40',
  later: 'bg-muted/40',
}

export const AchievementCard = ({
  item,
  stage,
}: AchievementCardProps): JSX.Element => {
  const isEarned = stage === 'earned'

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3 sm:p-4',
        CARD_CLASSES[stage],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isEarned
              ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark ' +
                  'text-white/90 shadow-sm ring-1 ring-gold-dark/30'
              : 'border border-border text-muted-foreground',
          )}
        >
          {isEarned ? (
            <Award className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        {stage === 'next' ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
            Next
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p
          className={cn(
            'text-sm font-medium leading-snug',
            stage === 'later' ? 'text-muted-foreground/80' : null,
          )}
        >
          {item.shortTitle}
          {isEarned ? null : <span className="sr-only"> (locked)</span>}
        </p>
        {item.earnedAt !== null ? (
          <EarnedMeta earnedAt={item.earnedAt} />
        ) : (
          <LockedMeta item={item} isMuted={stage === 'later'} />
        )}
      </div>
    </li>
  )
}
