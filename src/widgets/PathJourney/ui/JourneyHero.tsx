import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatFullDate, formatHours, plural } from './formatJourney'
import type { JourneySummary } from '@/entities/path'
import { cn } from '@/shared/lib/cn'
import { getProfilePath } from '@/shared/lib/routePaths'
import { buttonVariants } from '@/shared/ui/Button'

type JourneyHeroProps = {
  summary: JourneySummary
}

type StatProps = {
  label: string
  value: string
}

const Stat = ({ label, value }: StatProps): JSX.Element => (
  <div className="rounded-lg bg-muted/70 p-4">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
  </div>
)

const extrasOf = (summary: JourneySummary): string[] =>
  [
    summary.todosDone > 0
      ? plural(summary.todosDone, 'task done', 'tasks done')
      : null,
    summary.photos > 0 ? plural(summary.photos, 'photo', 'photos') : null,
    summary.cells > 0 ? plural(summary.cells, 'map cell', 'map cells') : null,
  ].filter((extra): extra is string => extra !== null)

export const JourneyHero = ({ summary }: JourneyHeroProps): JSX.Element => {
  const days = plural(summary.daysSinceStart, 'day', 'days')
  const extras = extrasOf(summary)

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {days} on your path
        </p>
        <p className="text-sm text-muted-foreground">
          Since your first entry · {formatFullDate(summary.startDay)}
        </p>
      </div>
      <div className="space-y-3">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Hours logged"
            value={formatHours(summary.totalSeconds)}
          />
          <Stat label="Active days" value={String(summary.activeDays)} />
          <Stat
            label="Longest streak"
            value={plural(summary.longestStreak, 'day', 'days')}
          />
          <Stat label="Your milestones" value={String(summary.milestones)} />
        </dl>
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          {extras.length > 0 ? (
            <p className="text-sm tabular-nums text-muted-foreground">
              {extras.join(' · ')}
            </p>
          ) : null}
          <Link
            to={getProfilePath()}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              '-mr-3 ml-auto gap-1 px-3',
            )}
          >
            All achievements
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
