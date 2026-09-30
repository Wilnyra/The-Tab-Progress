import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAchievements } from '../lib/useAchievements'
import { AchievementFamilyGroup } from './AchievementFamilyGroup'
import { AchievementProgress } from './AchievementProgress'
import { AchievementsSkeleton } from './AchievementsSkeleton'
import { NextUpCard } from './NextUpCard'
import {
  ACHIEVEMENT_FAMILIES,
  nextInFamily,
  type AchievementsResult,
} from '@/entities/achievements'
import { cn } from '@/shared/lib/cn'
import { getRootPath } from '@/shared/lib/routePaths'
import { Button, buttonVariants } from '@/shared/ui/Button'

type AchievementsBodyProps = {
  data: AchievementsResult
}

type RefreshErrorProps = {
  onRetry: () => void
}

const EmptyHint = (): JSX.Element => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">
      Log progress to start unlocking achievements.
    </p>
    <Link
      to={getRootPath()}
      className={cn(buttonVariants({ variant: 'ghost' }), '-ml-3 gap-1 px-3')}
    >
      Log your first hour
      <ArrowRight aria-hidden="true" />
    </Link>
  </div>
)

const RefreshError = ({ onRetry }: RefreshErrorProps): JSX.Element => (
  <div
    role="status"
    className="flex items-center gap-1 text-xs text-muted-foreground"
  >
    <span>Couldn&apos;t refresh.</span>
    <Button variant="ghost" size="sm" className="px-2" onClick={onRetry}>
      Try again
    </Button>
  </div>
)

const AchievementsBody = ({ data }: AchievementsBodyProps): JSX.Element => {
  const { items, summary } = data
  const nextUp = nextInFamily(items)
  const isFresh = items.every((item) => item.current === 0)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <AchievementProgress
          value={summary.unlocked}
          max={summary.total}
          label={`${summary.unlocked} of ${summary.total} achievements unlocked`}
          tone="gold"
        />
        {isFresh ? <EmptyHint /> : null}
      </div>

      {nextUp.length > 0 ? (
        <section aria-labelledby="achievements-next-up" className="space-y-3">
          <h4 id="achievements-next-up" className="text-sm font-medium">
            Next up
          </h4>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {nextUp.map((item) => (
              <NextUpCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ) : null}

      {ACHIEVEMENT_FAMILIES.map((family) => (
        <AchievementFamilyGroup
          key={family}
          family={family}
          items={items.filter((item) => item.family === family)}
          summary={summary}
        />
      ))}
    </div>
  )
}

export const AchievementsSection = (): JSX.Element => {
  const { data, isLoading, error, reload } = useAchievements()

  const renderBody = (): JSX.Element => {
    if (isLoading || (data === null && error === null)) {
      return <AchievementsSkeleton />
    }
    if (data === null) {
      return (
        <div className="flex flex-col items-start gap-3 py-6">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load achievements. Try again.
          </p>
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {error !== null ? <RefreshError onRetry={reload} /> : null}
        <AchievementsBody data={data} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Achievements</h3>
        {data !== null ? (
          <p className="text-sm tabular-nums text-muted-foreground">
            {data.summary.unlocked} of {data.summary.total} unlocked
          </p>
        ) : null}
      </div>
      {renderBody()}
    </div>
  )
}
