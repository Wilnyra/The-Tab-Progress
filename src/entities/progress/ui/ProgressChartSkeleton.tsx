import type { ReactNode } from 'react'
import { ProgressHeader } from './ProgressHeader'
import { Card, CardContent } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProgressChartSkeletonProps = {
  rightSlot?: ReactNode
  toolbar?: ReactNode
  description?: ReactNode
  chartContainerClassName?: string
}

export const ProgressChartSkeleton = ({
  rightSlot,
  toolbar,
  description,
  chartContainerClassName,
}: ProgressChartSkeletonProps) => {
  return (
    <Card variant="section" className="min-h-[320px]">
      <ProgressHeader
        description={description}
        rightSlot={rightSlot}
        toolbar={toolbar}
      />
      <CardContent>
        <div className={chartContainerClassName}>
          <Skeleton className="w-full h-[200px]" />
        </div>
      </CardContent>
    </Card>
  )
}
