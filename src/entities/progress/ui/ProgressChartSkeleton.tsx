import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProgressChartSkeletonProps = {
  rightSlot?: ReactNode
  description?: ReactNode
  chartContainerClassName?: string
}

export const ProgressChartSkeleton = ({
  rightSlot,
  description,
  chartContainerClassName,
}: ProgressChartSkeletonProps) => {
  return (
    <Card className="min-h-[320px]">
      <CardHeader className="flex justify-between flex-row items-start">
        <div className="space-y-1.5">
          <CardTitle>Progress</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </CardHeader>
      <CardContent>
        <div className={chartContainerClassName}>
          <Skeleton className="w-full h-[200px]" />
        </div>
      </CardContent>
    </Card>
  )
}
