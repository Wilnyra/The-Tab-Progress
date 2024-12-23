import { Button } from '@/shared/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { CirclePlay, CircleStop } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { useCountTimeProgress } from '../lib/useCountTimeProgress'
import { formatSecondsToTime } from '@/shared/lib/formatSecondsToTime'

type CountProgressProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const CountProgress = ({ cardProps }: CountProgressProps) => {
  const {
    count,
    startCountTime,
    stopCountTime,
    isCounting: isCountingInitial,
  } = useCountTimeProgress()
  const [isCounting, setIsCounting] = useState(isCountingInitial)

  const onClickCount = () => {
    if (isCounting) {
      stopCountTime()
    } else {
      startCountTime()
    }

    setIsCounting((prev) => !prev)
  }

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
          <Button
            onClick={onClickCount}
            className="w-32 h-32 rounded-full [&_svg]:size-full bg-chart-2 hover:bg-chart-2/95"
          >
            {isCounting ? <CircleStop /> : <CirclePlay />}
          </Button>
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
