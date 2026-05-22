import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ProgressChart,
  aggregateEventsToDays,
  useEventsLast30Days,
  useTotalForRange,
  type TotalRangeKey,
} from '@/entities/progress'
import { AddProgressDialog } from '@/features/progress/AddProgress'
import { SelectLimit } from '@/features/progress/SelectLimit'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { getProgressPath } from '@/shared/lib/routePaths'
import { buttonVariants } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type ProgressCardProps = {
  selectLimit?: boolean
}

const isDetailedRange = (limit: number | null): limit is 7 | 30 =>
  limit === 7 || limit === 30

const toTotalRangeKey = (limit: number | null): TotalRangeKey => {
  if (limit === 90 || limit === 180 || limit === 360) return limit
  return 'total'
}

const summaryDescription = (rangeKey: TotalRangeKey): string => {
  if (rangeKey === 'total') return 'All-time total'
  return `Total for the last ${rangeKey} days`
}

const filterEventsToLastDays = <T extends { created_at: string }>(
  events: T[],
  days: number,
): T[] => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  const startMs = start.getTime()
  return events.filter((ev) => new Date(ev.created_at).getTime() >= startMs)
}

export const ProgressCard = ({ selectLimit }: ProgressCardProps) => {
  const [limit, setLimit] = useState<number | null>(30)
  const detailed = isDetailedRange(limit)
  const rangeKey = toTotalRangeKey(limit)

  const { events, isLoading: eventsLoading } = useEventsLast30Days()
  const { total, isLoading: totalLoading } = useTotalForRange(rangeKey)

  const rightSlot = (
    <div className="flex gap-4">
      {selectLimit ? <SelectLimit setLimit={setLimit} /> : null}
      {selectLimit ? (
        <AddProgressDialog />
      ) : (
        <Link
          to={getProgressPath()}
          className={buttonVariants({ variant: 'default' })}
          aria-label="Open Progress page"
        >
          <ArrowRight />
        </Link>
      )}
    </div>
  )

  if (detailed) {
    const filtered = filterEventsToLastDays(events, limit)
    const dailyData = aggregateEventsToDays(filtered)

    return (
      <ProgressChart
        description={`Showing ${limit} days progress`}
        rightSlot={rightSlot}
        data={dailyData}
        chartContainerClassName="max-h-[200px] w-full"
        isLoading={eventsLoading}
      />
    )
  }

  return (
    <Card className="min-h-[320px]">
      <CardHeader className="flex justify-between flex-row items-start">
        <div className="space-y-1.5">
          <CardTitle>Progress</CardTitle>
          <CardDescription>{summaryDescription(rangeKey)}</CardDescription>
        </div>
        <div onClick={(e) => e.stopPropagation()}>{rightSlot}</div>
      </CardHeader>
      <CardContent className="flex items-center justify-center pt-12">
        <h2 className="text-5xl font-mono font-semibold tabular-nums">
          {totalLoading ? '—' : formatSecondsToTime(total)}
        </h2>
      </CardContent>
    </Card>
  )
}
