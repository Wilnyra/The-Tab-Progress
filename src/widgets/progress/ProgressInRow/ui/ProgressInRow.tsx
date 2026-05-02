import { type ComponentProps } from 'react'
import { getProgressEmoji } from '../lib/getProgressEmoji'
import { ProgressInRowSkeleton } from './ProgressInRowSkeleton'
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

export const ProgressInRow = ({ cardProps }: ProgressInRowProps) => {
  const { events, isLoading } = useEventsLast30Days()
  const dailyData = aggregateEventsToDays(events)
  const datesInRowLength = getLastQueueArray(dailyData).length

  if (isLoading) {
    return <ProgressInRowSkeleton cardProps={cardProps} />
  }

  return (
    <Card {...cardProps} className="min-h-[200px]">
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <h2 className="text-center scroll-m-20 text-3xl font-semibold transition-colors">
          {getProgressEmoji(datesInRowLength)} {datesInRowLength} days
        </h2>
      </CardContent>
    </Card>
  )
}
