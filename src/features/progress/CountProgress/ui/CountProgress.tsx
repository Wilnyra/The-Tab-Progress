import { CirclePlay, CircleStop, X } from 'lucide-react'
import { type ComponentProps } from 'react'
import { useCountProgress } from '../lib/useCountProgress'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'
import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'

type CountProgressProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const CountProgress = ({ cardProps }: CountProgressProps) => {
  const { count, isCounting, toggleCount, cancelCount } = useCountProgress()

  return (
    <Card {...cardProps}>
      <CardHeader>
        <CardTitle>Count Progress</CardTitle>
        <CardDescription>
          {isCounting ? 'Stop' : 'Start'} counting progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="relative inline-flex">
            <Button
              onClick={toggleCount}
              className="w-32 h-32 rounded-full [&_svg]:size-full bg-chart-2 hover:bg-chart-2/95"
            >
              {isCounting ? <CircleStop /> : <CirclePlay />}
            </Button>
            {isCounting ? (
              <Button
                type="button"
                variant="destructive"
                onClick={cancelCount}
                aria-label="Cancel counting progress"
                className="absolute -top-1 -right-1 w-10 h-10 p-0 rounded-full ring-4 ring-card [&_svg]:size-5 hover:bg-destructive hover:brightness-90"
              >
                <X />
              </Button>
            ) : null}
          </div>
          <div className="ml-10">
            <p>Current:</p>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {formatSecondsToTime(count)}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
