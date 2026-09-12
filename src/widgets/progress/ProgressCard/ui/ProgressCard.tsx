import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ProgressChart,
  ProgressHeader,
  ProgressHeatmap,
  aggregateEventsToDays,
  fillMissingDays,
  filterEventsToLastDays,
  summarizeDailyTotals,
  useDailyTotals,
  useEventsLast90Days,
  useTotalForRange,
  type DailyTotalsRange,
  type DailyTotalsSummary,
  type TotalRangeKey,
} from '@/entities/progress'
import { AddProgressDialog } from '@/features/progress/AddProgress'
import { SelectLimit } from '@/features/progress/SelectLimit'
import { cn } from '@/shared/lib/cn'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { getProgressPath } from '@/shared/lib/routePaths'
import { buttonVariants } from '@/shared/ui/Button'
import { Card, CardContent } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProgressCardProps = {
  selectLimit?: boolean
}

const isDetailedRange = (limit: number | null): limit is 7 | 30 | 90 =>
  limit === 7 || limit === 30 || limit === 90

const isHeatmapRange = (limit: number | null): limit is 180 | 360 =>
  limit === 180 || limit === 360

const toTotalRangeKey = (limit: number | null): TotalRangeKey => {
  if (limit === 90 || limit === 180 || limit === 360) return limit
  return 'total'
}

const toDailyTotalsRange = (limit: number | null): DailyTotalsRange | null => {
  if (limit === null) return 'all'
  return isHeatmapRange(limit) ? limit : null
}

const summaryDescription = (rangeKey: TotalRangeKey): string => {
  if (rangeKey === 'total') return 'All-time total'
  return `Total for the last ${rangeKey} days`
}

const countActiveDays = (totals: ReadonlyMap<string, number>): number =>
  Array.from(totals.values()).filter((seconds) => seconds > 0).length

const pluralizeDays = (count: number): string =>
  `${count} ${count === 1 ? 'day' : 'days'}`

const formatStartDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

type AllTimeStatsProps = {
  summary: DailyTotalsSummary
}

const AllTimeStats = ({ summary }: AllTimeStatsProps): JSX.Element => (
  <dl className="grid w-full max-w-md grid-cols-3 gap-4 text-center">
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">Active days</dt>
      <dd className="text-sm font-medium tabular-nums">
        {summary.activeDays} of {summary.daysSinceStart}
      </dd>
    </div>
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">Started</dt>
      <dd className="text-sm font-medium tabular-nums">
        {formatStartDate(summary.firstDay)}
      </dd>
    </div>
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">Longest streak</dt>
      <dd className="text-sm font-medium tabular-nums">
        {pluralizeDays(summary.longestStreak)}
      </dd>
    </div>
  </dl>
)

export const ProgressCard = ({ selectLimit }: ProgressCardProps) => {
  const [limit, setLimit] = useState<number | null>(30)
  const detailed = isDetailedRange(limit)
  const heatmapDays = isHeatmapRange(limit) ? limit : null
  const dailyRange = toDailyTotalsRange(limit)
  const rangeKey = toTotalRangeKey(limit)

  const { events, isLoading: eventsLoading } = useEventsLast90Days()
  const { total, isLoading: totalLoading } = useTotalForRange(rangeKey)
  const daily = useDailyTotals(dailyRange)

  const toolbar = selectLimit ? (
    <SelectLimit value={limit} setLimit={setLimit} />
  ) : null

  const rightSlot = selectLimit ? (
    <AddProgressDialog />
  ) : (
    <Link
      to={getProgressPath()}
      className={cn(buttonVariants({ variant: 'ghost' }), '-mr-3 gap-1 px-3')}
      aria-label="See all progress"
    >
      See all
      <ArrowRight />
    </Link>
  )

  const totalText = totalLoading ? '—' : formatSecondsToTime(total)
  const isDailyLoaded = dailyRange !== null && daily.loadedRange === dailyRange

  if (detailed) {
    const filtered = filterEventsToLastDays(events, limit)
    const dailyData = fillMissingDays(aggregateEventsToDays(filtered), limit)

    return (
      <ProgressChart
        description={`Showing ${limit} days progress`}
        rightSlot={rightSlot}
        toolbar={toolbar}
        data={dailyData}
        chartContainerClassName="max-h-[200px] w-full"
        isLoading={eventsLoading && events.length === 0}
      />
    )
  }

  if (heatmapDays !== null) {
    const renderHeatmap = (): JSX.Element => {
      if (daily.error) {
        return (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load daily progress. Try reloading the page.
          </p>
        )
      }
      if (!isDailyLoaded) {
        return <Skeleton className="h-[128px] w-full" />
      }
      return <ProgressHeatmap totals={daily.totals} dayCount={heatmapDays} />
    }

    return (
      <Card variant="section" className="min-h-[320px]">
        <ProgressHeader
          description={summaryDescription(rangeKey)}
          rightSlot={rightSlot}
          toolbar={toolbar}
        />
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-mono font-semibold tabular-nums">
              {totalText}
            </p>
            {isDailyLoaded ? (
              <p className="text-sm text-muted-foreground">
                {pluralizeDays(countActiveDays(daily.totals))} with progress
              </p>
            ) : null}
          </div>
          {renderHeatmap()}
        </CardContent>
      </Card>
    )
  }

  const allTimeSummary = isDailyLoaded
    ? summarizeDailyTotals(daily.totals)
    : null

  return (
    <Card variant="section" className="min-h-[320px]">
      <ProgressHeader
        description={summaryDescription(rangeKey)}
        rightSlot={rightSlot}
        toolbar={toolbar}
      />
      <CardContent className="flex flex-col items-center justify-center gap-6 pt-12">
        <h2 className="text-5xl font-mono font-semibold tabular-nums">
          {totalText}
        </h2>
        {allTimeSummary ? <AllTimeStats summary={allTimeSummary} /> : null}
      </CardContent>
    </Card>
  )
}
