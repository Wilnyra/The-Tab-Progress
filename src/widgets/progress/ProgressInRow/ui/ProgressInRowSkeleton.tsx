import type { ComponentProps } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProgressInRowSkeletonProps = {
  cardProps?: ComponentProps<typeof Card>
}

export const ProgressInRowSkeleton = ({
  cardProps,
}: ProgressInRowSkeletonProps) => {
  return (
    <Card {...cardProps} className="min-h-[200px]">
      <CardHeader>
        <CardTitle>Progress In Row</CardTitle>
        <CardDescription>Do not interrupt the duration</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="flex justify-center">
          <Skeleton className="h-9 w-48" />
        </div>
      </CardContent>
    </Card>
  )
}
