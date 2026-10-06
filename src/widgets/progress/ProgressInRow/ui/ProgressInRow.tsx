import { type ComponentProps, type ReactElement, Suspense } from 'react'
import { CharacterFigureSkeleton } from './CharacterFigureSkeleton'
import { ProgressInRowSkeleton } from './ProgressInRowSkeleton'
import { CharacterLazy, getStreakCaption } from '@/entities/character'
import {
  aggregateEventsToDays,
  getLastQueueArray,
  useEventsLast30Days,
} from '@/entities/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type ProgressInRowProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressInRow = ({
  cardProps,
}: ProgressInRowProps): ReactElement => {
  const { events, isLoading } = useEventsLast30Days()
  const dailyData = aggregateEventsToDays(events)
  const datesInRowLength = getLastQueueArray(dailyData).length
  // TODO: the best streak is not stored yet, and the streak itself is
  // computed from the last 30 days of events (useEventsLast30Days), so the
  // look cannot be kept after a break and stops growing past ~30 days.
  // Pass the real best streak once the app persists it.
  const bestStreak = datesInRowLength
  const caption = getStreakCaption(datesInRowLength, { bestStreak })
  const unit = datesInRowLength === 1 ? 'day' : 'days'

  if (isLoading) {
    return <ProgressInRowSkeleton cardProps={cardProps} />
  }

  return (
    <Card {...cardProps} className="min-h-[200px]">
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Suspense fallback={<CharacterFigureSkeleton />}>
            <CharacterLazy
              streak={datesInRowLength}
              bestStreak={bestStreak}
              className="w-[120px]"
            />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="leading-none">
              <span className="text-5xl font-bold tabular-nums">
                {datesInRowLength}
              </span>{' '}
              <span className="text-2xl font-semibold">{unit}</span>
            </p>
            <p className="text-sm text-muted-foreground">{caption}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
