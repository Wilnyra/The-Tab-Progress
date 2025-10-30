import { progressContext } from '@/entities/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { useContext, type ComponentProps } from 'react'
import { getLastQueueInRow } from '../lib/getLastQueueInRow'
import { getProgressEmoji } from '../lib/getProgressEmoji'

type ProgressInRowProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressInRow = ({ cardProps }: ProgressInRowProps) => {
  const { progress } = useContext(progressContext)
  const datesInRow = getLastQueueInRow(progress)

  return (
    <Card {...cardProps}>
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <h2 className="text-center scroll-m-20 text-3xl font-semibold transition-colors">
          {getProgressEmoji(datesInRow.streak)} {datesInRow.streak} days
        </h2>
      </CardContent>
    </Card>
  )
}
