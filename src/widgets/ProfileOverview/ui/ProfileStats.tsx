import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  useProfileSummary,
  type ProfileSummary,
} from '../lib/useProfileSummary'
import { cn } from '@/shared/lib/cn'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'
import { getPathPath } from '@/shared/lib/routePaths'
import { Button, buttonVariants } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'

type StatProps = {
  label: string
  value: string
}

type StatsGridProps = {
  summary: ProfileSummary
}

type RetryProps = {
  onRetry: () => void
}

const SKELETON_TILES = ['days', 'hours', 'active', 'milestones']

const formatHours = (seconds: number): string => formatMinutesToHm(seconds / 60)

const Stat = ({ label, value }: StatProps): JSX.Element => (
  <div className="rounded-lg bg-muted/70 p-4">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
  </div>
)

const StatsSkeleton = (): JSX.Element => (
  <div aria-busy="true">
    <p role="status" className="sr-only">
      Loading your stats
    </p>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
      {SKELETON_TILES.map((key) => (
        <Skeleton key={key} className="h-[76px] rounded-lg" />
      ))}
    </div>
  </div>
)

const StatsGrid = ({ summary }: StatsGridProps): JSX.Element => (
  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Stat label="Days on your path" value={String(summary.daysSinceStart)} />
    <Stat label="Hours logged" value={formatHours(summary.totalSeconds)} />
    <Stat label="Active days" value={String(summary.activeDays)} />
    <Stat label="Milestones" value={String(summary.milestones)} />
  </dl>
)

const LoadError = ({ onRetry }: RetryProps): JSX.Element => (
  <div className="flex flex-col items-start gap-3 py-2">
    <p className="text-sm text-muted-foreground">
      Couldn&apos;t load your stats.
    </p>
    <Button variant="outline" onClick={onRetry}>
      Try again
    </Button>
  </div>
)

const RefreshError = ({ onRetry }: RetryProps): JSX.Element => (
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

const isEmpty = (summary: ProfileSummary): boolean =>
  summary.totalSeconds === 0 && summary.milestones === 0

export const ProfileStats = (): JSX.Element => {
  const { summary, isLoading, error, reload } = useProfileSummary()

  const renderBody = (): JSX.Element => {
    if (isLoading) return <StatsSkeleton />
    if (summary === null) return <LoadError onRetry={reload} />
    return (
      <div className="space-y-3">
        {error !== null ? <RefreshError onRetry={reload} /> : null}
        {isEmpty(summary) ? (
          <p className="text-sm text-muted-foreground">
            Your stats will appear here once you log your first hour.
          </p>
        ) : (
          <StatsGrid summary={summary} />
        )}
      </div>
    )
  }

  return (
    <section aria-labelledby="profile-stats" className="space-y-3">
      <h3 id="profile-stats" className="sr-only">
        Your stats
      </h3>
      {renderBody()}
      <div className="flex justify-end">
        <Link
          to={getPathPath()}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            '-mr-3 gap-1 px-3',
          )}
        >
          See your path
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
